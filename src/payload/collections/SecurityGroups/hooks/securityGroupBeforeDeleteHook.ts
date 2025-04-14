import { DeleteSecurityGroupCommand, EC2Client } from '@aws-sdk/client-ec2'
import { CollectionBeforeDeleteHook } from 'payload'

import { awsRegions } from '@/lib/constants'

export const securityGroupBeforeDeleteHook: CollectionBeforeDeleteHook =
  async ({ req, id }) => {
    try {
      // Fetch the security group document using Payload API
      const doc = await req.payload.findByID({
        collection: 'securityGroups', // Make sure this matches your collection slug
        id,
        depth: 0, // No need for depth since we just need basic info
      })

      // Check if this is an AWS security group with an ID
      if (!doc || doc.cloudProvider !== 'aws' || !doc.securityGroupId) {
        return
      }

      // Get the associated cloud provider account
      const accountId =
        typeof doc.cloudProviderAccount === 'object'
          ? doc.cloudProviderAccount.id
          : doc.cloudProviderAccount

      if (!accountId) {
        console.warn('No cloud provider account associated with security group')
        return
      }

      const account = await req.payload.findByID({
        collection: 'cloudProviderAccounts',
        id: accountId,
      })

      if (
        !account?.awsDetails?.accessKeyId ||
        !account.awsDetails.secretAccessKey
      ) {
        console.warn('AWS credentials missing for account')
        return
      }

      // Create EC2 client
      const ec2Client = new EC2Client({
        region: awsRegions?.[0]?.value || 'ap-south-1',
        credentials: {
          accessKeyId: account.awsDetails.accessKeyId,
          secretAccessKey: account.awsDetails.secretAccessKey,
        },
      })

      // Delete the security group in AWS
      await ec2Client.send(
        new DeleteSecurityGroupCommand({
          GroupId: doc.securityGroupId,
        }),
      )
    } catch (error) {
      console.error('Failed to delete AWS security group:', error)
      throw error // Prevent deletion if AWS deletion fails
    }
  }
