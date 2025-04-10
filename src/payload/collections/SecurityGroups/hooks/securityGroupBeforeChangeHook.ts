import {
  AuthorizeSecurityGroupEgressCommand,
  AuthorizeSecurityGroupIngressCommand,
  CreateSecurityGroupCommand,
  CreateTagsCommand,
  DeleteTagsCommand,
  EC2Client,
  RevokeSecurityGroupEgressCommand,
  RevokeSecurityGroupIngressCommand,
} from '@aws-sdk/client-ec2'
import { CollectionBeforeChangeHook } from 'payload'

import { awsRegions } from '@/lib/constants'
import { SecurityGroup } from '@/payload-types'

const mapRuleTypeToProtocolPorts = (ruleType: string) => {
  switch (ruleType) {
    case 'all-traffic':
      return { protocol: '-1', fromPort: -1, toPort: -1 }
    case 'ssh':
      return { protocol: 'tcp', fromPort: 22, toPort: 22 }
    case 'http':
      return { protocol: 'tcp', fromPort: 80, toPort: 80 }
    case 'https':
      return { protocol: 'tcp', fromPort: 443, toPort: 443 }
    case 'rdp':
      return { protocol: 'tcp', fromPort: 3389, toPort: 3389 }
    case 'custom-tcp':
      return { protocol: 'tcp' }
    case 'custom-udp':
      return { protocol: 'udp' }
    case 'custom-icmp':
      return { protocol: 'icmp', fromPort: -1, toPort: -1 }
    default:
      return {}
  }
}

const mapSourceToCIDR = (type: string, value: string): string => {
  switch (type) {
    case 'anywhere-ipv4':
      return '0.0.0.0/0'
    case 'anywhere-ipv6':
      return '::/0'
    default:
      return value
  }
}

export const securityGroupBeforeChangeHook: CollectionBeforeChangeHook<
  SecurityGroup
> = async ({ data, originalDoc, req }) => {
  if (!data.syncStatus || data.cloudProvider !== 'aws') return data

  const payload = req.payload
  const accountId = String(
    typeof data.cloudProviderAccount === 'object'
      ? data.cloudProviderAccount.id
      : data.cloudProviderAccount,
  )

  try {
    const awsAccount = await payload.findByID({
      collection: 'cloudProviderAccounts',
      id: accountId,
    })

    if (
      !awsAccount?.awsDetails?.accessKeyId ||
      !awsAccount.awsDetails.secretAccessKey
    ) {
      throw new Error('AWS credentials missing')
    }

    const region = awsRegions?.[0]?.value || 'ap-south-1'
    const ec2Client = new EC2Client({
      region,
      credentials: {
        accessKeyId: awsAccount.awsDetails.accessKeyId,
        secretAccessKey: awsAccount.awsDetails.secretAccessKey,
      },
    })

    // Create security group if new
    if (!data.securityGroupId) {
      const createResult = await ec2Client.send(
        new CreateSecurityGroupCommand({
          GroupName: data.name,
          Description: data.description,
        }),
      )
      data.securityGroupId = createResult.GroupId
    }

    // Process inbound rules
    if (data.inboundRules) {
      const existingRules = originalDoc?.inboundRules || []

      // Remove deleted rules
      for (const rule of existingRules) {
        if (
          rule.securityGroupRuleId &&
          !data.inboundRules.some(
            r => r.securityGroupRuleId === rule.securityGroupRuleId,
          )
        ) {
          await ec2Client.send(
            new RevokeSecurityGroupIngressCommand({
              GroupId: data.securityGroupId,
              SecurityGroupRuleIds: [rule.securityGroupRuleId],
            }),
          )
        }
      }

      // Add new rules
      const newRules = data.inboundRules.filter(r => !r.securityGroupRuleId)
      if (newRules.length) {
        const permissions = newRules.map(rule => {
          const base = mapRuleTypeToProtocolPorts(rule.type)
          return {
            IpProtocol: rule.protocol || base.protocol || 'tcp',
            FromPort: rule.fromPort ?? base.fromPort ?? 0,
            ToPort: rule.toPort ?? base.toPort ?? 0,
            IpRanges: [
              {
                CidrIp: mapSourceToCIDR(rule.sourceType, rule.source),
                Description: rule.description || '',
              },
            ],
          }
        })

        const response = await ec2Client.send(
          new AuthorizeSecurityGroupIngressCommand({
            GroupId: data.securityGroupId,
            IpPermissions: permissions,
          }),
        )

        // Update rule IDs
        response.SecurityGroupRules?.forEach((awsRule, i) => {
          if (newRules[i]) {
            newRules[i].securityGroupRuleId = awsRule.SecurityGroupRuleId
          }
        })
      }
    }

    // Process outbound rules (skip default allow-all)
    if (data.outboundRules) {
      const existingRules = originalDoc?.outboundRules || []

      // Remove deleted non-default rules
      for (const rule of existingRules) {
        if (
          rule.securityGroupRuleId &&
          !data.outboundRules.some(
            r => r.securityGroupRuleId === rule.securityGroupRuleId,
          ) &&
          !(rule.type === 'all-traffic' && rule.destination === '0.0.0.0/0')
        ) {
          await ec2Client.send(
            new RevokeSecurityGroupEgressCommand({
              GroupId: data.securityGroupId,
              SecurityGroupRuleIds: [rule.securityGroupRuleId],
            }),
          )
        }
      }

      // Add new non-default rules
      const newRules = data.outboundRules.filter(
        r =>
          !r.securityGroupRuleId &&
          !(r.type === 'all-traffic' && r.destination === '0.0.0.0/0'),
      )

      if (newRules.length) {
        const permissions = newRules.map(rule => {
          const base = mapRuleTypeToProtocolPorts(rule.type)
          return {
            IpProtocol: rule.protocol || base.protocol || 'tcp',
            FromPort: rule.fromPort ?? base.fromPort ?? 0,
            ToPort: rule.toPort ?? base.toPort ?? 0,
            IpRanges: [
              {
                CidrIp: mapSourceToCIDR(rule.destinationType, rule.destination),
                Description: rule.description || '',
              },
            ],
          }
        })

        const response = await ec2Client.send(
          new AuthorizeSecurityGroupEgressCommand({
            GroupId: data.securityGroupId,
            IpPermissions: permissions,
          }),
        )

        // Update rule IDs
        response.SecurityGroupRules?.forEach((awsRule, i) => {
          if (newRules[i]) {
            newRules[i].securityGroupRuleId = awsRule.SecurityGroupRuleId
          }
        })
      }
    }

    // Update the tags processing section to handle the securityGroupId type safety
    if (data.tags && data.securityGroupId) {
      // Add check for securityGroupId
      const existingTags = originalDoc?.tags || []

      // Tags to remove
      const tagsToRemove = existingTags
        .filter(
          existingTag =>
            !data.tags?.some(newTag => newTag.key === existingTag.key),
        )
        .map(tag => tag.key)

      if (tagsToRemove.length > 0) {
        await ec2Client.send(
          new DeleteTagsCommand({
            Resources: [data.securityGroupId], // Now definitely a string
            Tags: tagsToRemove.map(key => ({ Key: key })),
          }),
        )
      }

      // Tags to add or update
      const tagsToAdd = data.tags.filter(
        newTag =>
          !existingTags.some(
            existingTag =>
              existingTag.key === newTag.key &&
              existingTag.value === newTag.value,
          ),
      )

      if (tagsToAdd.length > 0) {
        await ec2Client.send(
          new CreateTagsCommand({
            Resources: [data.securityGroupId], // Now definitely a string
            Tags: tagsToAdd.map(tag => ({
              Key: tag.key,
              Value: tag.value || '',
            })),
          }),
        )
      }
    }

    return data
  } catch (error) {
    console.error('Security Group Sync Error:', error)
    data.syncStatus = false
    throw error
  }
}
