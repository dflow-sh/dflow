import { DeleteSecurityGroupCommand, EC2Client } from '@aws-sdk/client-ec2'
import { CollectionBeforeDeleteHook } from 'payload'

import { awsRegions } from '@/lib/constants'

export const securityGroupBeforeDeleteHook: CollectionBeforeDeleteHook =
  async ({ req, id }) => {
    try {
      const doc = await req.payload.findByID({
        collection: 'securityGroups',
        id,
        depth: 0,
      })

      if (!doc) return

      // Only process if AWS provider and required info is available
      if (doc.cloudProvider !== 'aws') return

      if (!doc.cloudProviderAccount) {
        console.warn('[SecurityGroup Delete] No cloudProviderAccount linked.')
        return
      }

      if (!doc.securityGroupId) {
        console.warn(
          '[SecurityGroup Delete] No AWS securityGroupId set on the document.',
        )
        return
      }

      const accountId =
        typeof doc.cloudProviderAccount === 'object'
          ? doc.cloudProviderAccount.id
          : doc.cloudProviderAccount

      if (!accountId) {
        console.warn(
          '[SecurityGroup Delete] Could not determine cloudProviderAccount ID.',
        )
        return
      }

      const account = await req.payload.findByID({
        collection: 'cloudProviderAccounts',
        id: accountId,
      })

      if (!account) {
        console.warn(
          `[SecurityGroup Delete] Cloud provider account not found: ${accountId}`,
        )
        return
      }

      const { accessKeyId, secretAccessKey } = account.awsDetails || {}

      if (!accessKeyId || !secretAccessKey) {
        console.warn(
          '[SecurityGroup Delete] AWS credentials missing in cloud provider account.',
        )
        return
      }

      const ec2Client = new EC2Client({
        region: awsRegions?.[0]?.value || 'ap-south-1',
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      })

      await ec2Client.send(
        new DeleteSecurityGroupCommand({
          GroupId: doc.securityGroupId,
        }),
      )

      console.log(
        `[SecurityGroup Delete] Deleted AWS Security Group: ${doc.securityGroupId}`,
      )
    } catch (error) {
      console.error(
        '[SecurityGroup Delete] Failed to delete AWS security group:',
        error,
      )
      throw error
    }
  }
