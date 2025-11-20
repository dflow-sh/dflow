import {
  AuthorizeSecurityGroupEgressCommand,
  AuthorizeSecurityGroupIngressCommand,
  CreateSecurityGroupCommand,
  CreateTagsCommand,
  DeleteTagsCommand,
  DescribeSecurityGroupRulesCommand,
  DescribeTagsCommand,
  EC2Client,
  ModifySecurityGroupRulesCommand,
  RevokeSecurityGroupEgressCommand,
  RevokeSecurityGroupIngressCommand,
} from '@aws-sdk/client-ec2'
import { APIError, CollectionBeforeChangeHook } from 'payload'

import { awsRegions } from '@/lib/constants'
import { SecurityGroup } from '@/payload-types'

interface FormattedRule {
  securityGroupRuleId?: string
  protocol: string
  fromPort: number
  toPort: number
  cidr: string
  description: string
  originalRule: any
}

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
      return { protocol: 'tcp' } // Default to TCP if type is unrecognized
  }
}

const mapSourceToCIDR = (type: string, value: string): string => {
  switch (type) {
    case 'anywhere-ipv4':
      return '0.0.0.0/0'
    case 'anywhere-ipv6':
      return '::/0'
    default:
      return value || '0.0.0.0/0' // Fallback if value is missing
  }
}

const formatRule = (rule: any, isEgress: boolean): FormattedRule => {
  const base = mapRuleTypeToProtocolPorts(rule.type || 'custom-tcp')
  const protocol =
    (rule.protocol || base.protocol || 'tcp') === 'all'
      ? '-1'
      : rule.protocol || base.protocol
  const fromPort =
    protocol === 'icmp' || protocol === '-1'
      ? -1
      : Number(rule.fromPort ?? base.fromPort ?? 0)
  const toPort =
    protocol === 'icmp' || protocol === '-1'
      ? -1
      : Number(rule.toPort ?? base.toPort ?? 0)
  const cidr = isEgress
    ? mapSourceToCIDR(
        rule.destinationType || 'anywhere-ipv4',
        rule.destination || '0.0.0.0/0',
      )
    : mapSourceToCIDR(
        rule.sourceType || 'anywhere-ipv4',
        rule.source || '0.0.0.0/0',
      )
  return {
    securityGroupRuleId: rule.securityGroupRuleId,
    protocol,
    fromPort,
    toPort,
    cidr,
    description: rule.description || '',
    originalRule: rule,
  }
}

// Helper function to map AWS protocol to collection's protocol type
const mapProtocolToCollectionType = (
  protocol: string,
): 'tcp' | 'udp' | 'icmp' | 'all' | null => {
  if (protocol === '-1') return 'all'
  if (['tcp', 'udp', 'icmp'].includes(protocol))
    return protocol as 'tcp' | 'udp' | 'icmp'
  return null // Fallback for unrecognized protocols
}

// Helper to check if two rules are functionally equivalent
const areRulesEquivalent = (rule1: any, rule2: any): boolean => {
  return (
    rule1.IpProtocol === rule2.protocol &&
    (rule1.FromPort === rule2.fromPort ||
      (rule1.IpProtocol === '-1' && rule2.protocol === '-1')) &&
    (rule1.ToPort === rule2.toPort ||
      (rule1.IpProtocol === '-1' && rule2.protocol === '-1')) &&
    rule1.CidrIpv4 === rule2.cidr
  )
}

export const securityGroupBeforeChangeHook: CollectionBeforeChangeHook<
  SecurityGroup
> = async ({ data, originalDoc, req }) => {
  const { payload } = req

  if (data.syncStatus !== 'start-sync') return data

  if (!data.cloudProvider) {
    throw new APIError(
      'Cloud provider is required when syncing.',
      400,
      [
        {
          field: 'cloudProvider',
          message: 'Cloud provider is required when syncing.',
        },
      ],
      false,
    )
  }

  if (!data.cloudProviderAccount) {
    throw new APIError(
      'Cloud provider account is required when syncing.',
      400,
      [
        {
          field: 'cloudProviderAccount',
          message: 'Cloud provider account is required when syncing.',
        },
      ],
      false,
    )
  }

  if (data.cloudProvider !== 'aws') return data

  const cloudProviderAccountId = String(
    typeof data.cloudProviderAccount === 'object'
      ? data.cloudProviderAccount?.id
      : data.cloudProviderAccount,
  )

  try {
    const cloudProviderAccounts = await payload.findByID({
      collection: 'cloudProviderAccounts',
      id: cloudProviderAccountId,
    })
    const accessKeyId = cloudProviderAccounts?.awsDetails?.accessKeyId
    const secretAccessKey = cloudProviderAccounts?.awsDetails?.secretAccessKey

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials missing')
    }

    const region = awsRegions?.[0]?.value || 'ap-south-1'
    const ec2Client = new EC2Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    })

    // Create new security group if needed
    if (!data.securityGroupId) {
      const createResult = await ec2Client.send(
        new CreateSecurityGroupCommand({
          GroupName: data.name,
          Description: data.description,
        }),
      )

      if (!createResult.GroupId) {
        throw new Error('Failed to create security group')
      }

      data.securityGroupId = createResult.GroupId
    }

    const securityGroupId = data.securityGroupId
    if (!securityGroupId) throw new Error('Missing security group ID')

    // Initialize rules arrays if undefined
    data.inboundRules = data.inboundRules || []
    data.outboundRules = data.outboundRules || []

    // Format all rules upfront for AWS operations
    const formattedInboundRules = data.inboundRules.map(rule =>
      formatRule(rule, false),
    )
    const formattedOutboundRules = data.outboundRules.map(rule =>
      formatRule(rule, true),
    )

    // Fetch existing rules from AWS
    const rulesResponse = await ec2Client.send(
      new DescribeSecurityGroupRulesCommand({
        Filters: [{ Name: 'group-id', Values: [securityGroupId] }],
      }),
    )

    const allRules =
      rulesResponse.SecurityGroupRules?.map(rule => ({
        SecurityGroupRuleId: rule.SecurityGroupRuleId,
        IpProtocol: rule.IpProtocol,
        FromPort: rule.FromPort,
        ToPort: rule.ToPort,
        CidrIpv4: rule.CidrIpv4,
        Description: rule.Description,
        IsEgress: rule.IsEgress,
      })) || []

    const existingInboundRules = allRules.filter(
      rule => rule.IsEgress === false,
    )
    const existingOutboundRules = allRules.filter(
      rule => rule.IsEgress === true,
    )

    // Match inbound rules that already exist but don't have securityGroupRuleId
    formattedInboundRules.forEach(rule => {
      if (!rule.securityGroupRuleId) {
        const matchingExistingRule = existingInboundRules.find(existing =>
          areRulesEquivalent(existing, rule),
        )
        if (matchingExistingRule?.SecurityGroupRuleId) {
          rule.securityGroupRuleId = matchingExistingRule.SecurityGroupRuleId
          rule.originalRule.securityGroupRuleId =
            matchingExistingRule.SecurityGroupRuleId
        }
      }
    })

    // Match outbound rules that already exist but don't have securityGroupRuleId
    formattedOutboundRules.forEach(rule => {
      if (!rule.securityGroupRuleId) {
        const matchingExistingRule = existingOutboundRules.find(existing =>
          areRulesEquivalent(existing, rule),
        )
        if (matchingExistingRule?.SecurityGroupRuleId) {
          rule.securityGroupRuleId = matchingExistingRule.SecurityGroupRuleId
          rule.originalRule.securityGroupRuleId =
            matchingExistingRule.SecurityGroupRuleId
        }
      }
    })

    // Update data.inboundRules and data.outboundRules for database sync
    data.inboundRules = formattedInboundRules.map(fr => ({
      ...fr.originalRule,
      securityGroupRuleId: fr.securityGroupRuleId || undefined,
      protocol: mapProtocolToCollectionType(fr.protocol),
      fromPort: fr.fromPort === -1 ? undefined : fr.fromPort, // Set to undefined if -1 (all/icmp)
      toPort: fr.toPort === -1 ? undefined : fr.toPort, // Set to undefined if -1 (all/icmp)
      source: fr.cidr,
      description: fr.description,
    }))

    data.outboundRules = formattedOutboundRules.map(fr => ({
      ...fr.originalRule,
      securityGroupRuleId: fr.securityGroupRuleId || undefined,
      protocol: mapProtocolToCollectionType(fr.protocol),
      fromPort: fr.fromPort === -1 ? undefined : fr.fromPort, // Set to undefined if -1 (all/icmp)
      toPort: fr.toPort === -1 ? undefined : fr.toPort, // Set to undefined if -1 (all/icmp)
      destination: fr.cidr,
      description: fr.description,
    }))

    // Process inbound rules
    // Modify existing rules
    const inboundRulesToModify = formattedInboundRules
      .filter(fr => fr.securityGroupRuleId)
      .map(fr => {
        const existingRule = existingInboundRules.find(
          er => er.SecurityGroupRuleId === fr.securityGroupRuleId,
        )

        if (
          existingRule &&
          (existingRule.IpProtocol !== fr.protocol ||
            existingRule.FromPort !== fr.fromPort ||
            existingRule.ToPort !== fr.toPort ||
            existingRule.CidrIpv4 !== fr.cidr ||
            existingRule.Description !== fr.description)
        ) {
          return {
            SecurityGroupRuleId: fr.securityGroupRuleId!,
            SecurityGroupRule: {
              IpProtocol: fr.protocol,
              FromPort: fr.fromPort,
              ToPort: fr.toPort,
              CidrIpv4: fr.cidr,
              Description: fr.description,
            },
          }
        }
        return null
      })
      .filter(Boolean)

    if (inboundRulesToModify.length > 0) {
      await ec2Client.send(
        new ModifySecurityGroupRulesCommand({
          GroupId: securityGroupId,
          SecurityGroupRules: inboundRulesToModify as any[],
        }),
      )
    }

    // Create new inbound rules (only those that don't have a securityGroupRuleId yet)
    const inboundRulesToCreate = formattedInboundRules.filter(
      fr => !fr.securityGroupRuleId,
    )

    if (inboundRulesToCreate.length > 0) {
      const response = await ec2Client.send(
        new AuthorizeSecurityGroupIngressCommand({
          GroupId: securityGroupId,
          IpPermissions: inboundRulesToCreate.map(fr => ({
            IpProtocol: fr.protocol,
            FromPort: fr.fromPort,
            ToPort: fr.toPort,
            IpRanges: [{ CidrIp: fr.cidr, Description: fr.description }],
          })),
        }),
      )

      response.SecurityGroupRules?.forEach((awsRule, index) => {
        if (awsRule.SecurityGroupRuleId && inboundRulesToCreate[index]) {
          inboundRulesToCreate[index].originalRule.securityGroupRuleId =
            awsRule.SecurityGroupRuleId
          // Update formatted rule with the new ID for database sync
          inboundRulesToCreate[index].securityGroupRuleId =
            awsRule.SecurityGroupRuleId

          data.inboundRules = data.inboundRules?.map(ir => {
            if (ir.id === inboundRulesToCreate[index].originalRule.id) {
              ir.securityGroupRuleId = awsRule.SecurityGroupRuleId
            }

            return ir
          })
        }
      })
    }

    // Remove inbound rules
    const inboundRulesToRemove = existingInboundRules.filter(
      er =>
        !formattedInboundRules.some(
          fr => fr.securityGroupRuleId === er.SecurityGroupRuleId,
        ),
    )

    if (inboundRulesToRemove.length > 0) {
      await ec2Client.send(
        new RevokeSecurityGroupIngressCommand({
          GroupId: securityGroupId,
          SecurityGroupRuleIds: inboundRulesToRemove.map(
            r => r.SecurityGroupRuleId!,
          ),
        }),
      )
    }

    // Process outbound rules
    // Modify existing rules
    const outboundRulesToModify = formattedOutboundRules
      .filter(fr => fr.securityGroupRuleId)
      .map(fr => {
        const existingRule = existingOutboundRules.find(
          er => er.SecurityGroupRuleId === fr.securityGroupRuleId,
        )
        if (
          existingRule &&
          (existingRule.IpProtocol !== fr.protocol ||
            existingRule.FromPort !== fr.fromPort ||
            existingRule.ToPort !== fr.toPort ||
            existingRule.CidrIpv4 !== fr.cidr ||
            existingRule.Description !== fr.description)
        ) {
          return {
            SecurityGroupRuleId: fr.securityGroupRuleId!,
            SecurityGroupRule: {
              IpProtocol: fr.protocol,
              FromPort: fr.fromPort,
              ToPort: fr.toPort,
              CidrIpv4: fr.cidr,
              Description: fr.description,
            },
          }
        }
        return null
      })
      .filter(Boolean)

    if (outboundRulesToModify.length > 0) {
      await ec2Client.send(
        new ModifySecurityGroupRulesCommand({
          GroupId: securityGroupId,
          SecurityGroupRules: outboundRulesToModify as any[],
        }),
      )
    }

    // Create new outbound rules (only those that don't have a securityGroupRuleId yet)
    const outboundRulesToCreate = formattedOutboundRules.filter(
      fr => !fr.securityGroupRuleId,
    )

    if (outboundRulesToCreate.length > 0) {
      try {
        const response = await ec2Client.send(
          new AuthorizeSecurityGroupEgressCommand({
            GroupId: securityGroupId,
            IpPermissions: outboundRulesToCreate.map(fr => ({
              IpProtocol: fr.protocol,
              FromPort: fr.fromPort,
              ToPort: fr.toPort,
              IpRanges: [{ CidrIp: fr.cidr, Description: fr.description }],
            })),
          }),
        )

        response.SecurityGroupRules?.forEach((awsRule, index) => {
          if (awsRule.SecurityGroupRuleId && outboundRulesToCreate[index]) {
            outboundRulesToCreate[index].originalRule.securityGroupRuleId =
              awsRule.SecurityGroupRuleId
            // Update formatted rule with the new ID for database sync
            outboundRulesToCreate[index].securityGroupRuleId =
              awsRule.SecurityGroupRuleId

            data.outboundRules = data.outboundRules?.map(ir => {
              if (ir.id === outboundRulesToCreate[index].originalRule.id) {
                ir.securityGroupRuleId = awsRule.SecurityGroupRuleId
              }

              return ir
            })
          }
        })
      } catch (error: any) {
        // Handle duplicate rule error specifically
        if (error.Code === 'InvalidPermission.Duplicate') {
          console.log('Ignoring duplicate outbound rule error:', error.message)

          // Try to find any existing rule that matches our outbound rules and assign IDs
          outboundRulesToCreate.forEach(rule => {
            const matchingExistingRule = existingOutboundRules.find(existing =>
              areRulesEquivalent(existing, rule),
            )

            if (matchingExistingRule?.SecurityGroupRuleId) {
              rule.originalRule.securityGroupRuleId =
                matchingExistingRule.SecurityGroupRuleId

              // Update the rule in data.outboundRules
              data.outboundRules = data.outboundRules?.map(ir => {
                if (ir.id === rule.originalRule.id) {
                  ir.securityGroupRuleId =
                    matchingExistingRule.SecurityGroupRuleId
                }
                return ir
              })
            }
          })
        } else {
          // Re-throw other errors
          throw error
        }
      }
    }

    // Remove outbound rules
    const outboundRulesToRemove = existingOutboundRules.filter(
      er =>
        !formattedOutboundRules.some(
          fr => fr.securityGroupRuleId === er.SecurityGroupRuleId,
        ),
    )
    if (outboundRulesToRemove.length > 0) {
      await ec2Client.send(
        new RevokeSecurityGroupEgressCommand({
          GroupId: securityGroupId,
          SecurityGroupRuleIds: outboundRulesToRemove.map(
            r => r.SecurityGroupRuleId!,
          ),
        }),
      )
    }

    // Use DescribeTagsCommand instead of relying on originalDoc
    // Fetch existing tags directly from AWS
    const tagsResponse = await ec2Client.send(
      new DescribeTagsCommand({
        Filters: [
          {
            Name: 'resource-id',
            Values: [securityGroupId],
          },
        ],
      }),
    )

    // Format the AWS tags into our application format
    const existingTags =
      tagsResponse.Tags?.map(tag => ({
        id: `${tag.Key}-${Date.now()}`, // Generate an ID since AWS doesn't provide one
        key: tag.Key || '',
        value: tag.Value || '',
      })) || []

    // Format the new tags from the request data
    const newTags = (data.tags || [])
      .filter(tag => tag && tag.key)
      .map(tag => ({ id: tag.id, key: tag.key, value: tag.value || '' }))

    // Create maps for easier comparison
    const existingTagsMap = new Map(existingTags.map(tag => [tag.key, tag]))
    const newTagsMap = new Map(newTags.map(tag => [tag.key, tag]))

    // Determine tag changes
    const tagsToCreate = newTags.filter(tag => !existingTagsMap.has(tag.key))
    const tagsToUpdate = newTags.filter(
      tag =>
        existingTagsMap.has(tag.key) &&
        existingTagsMap.get(tag.key)?.value !== tag.value,
    )
    const tagsToRemove = existingTags.filter(tag => !newTagsMap.has(tag.key))

    // Always process tag changes even if they appear empty
    // Remove tags that don't exist in the new configuration
    if (tagsToRemove.length > 0) {
      await ec2Client.send(
        new DeleteTagsCommand({
          Resources: [securityGroupId],
          Tags: tagsToRemove.map(tag => ({ Key: tag.key })),
        }),
      )
    }

    // Create or update tags
    if (tagsToCreate.length > 0 || tagsToUpdate.length > 0) {
      await ec2Client.send(
        new CreateTagsCommand({
          Resources: [securityGroupId],
          Tags: [...tagsToCreate, ...tagsToUpdate].map(tag => ({
            Key: tag.key,
            Value: tag.value || '',
          })),
        }),
      )
    }

    data.syncStatus = 'in-sync'
    data.lastSyncedAt = new Date().toISOString()
  } catch (error) {
    console.error('Security Group Sync Error:', error)
    data.syncStatus = 'failed'
    data.lastSyncedAt = new Date().toISOString()
  }

  return data
}
