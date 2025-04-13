'use server'

import {
  DescribeInstancesCommand,
  DescribeKeyPairsCommand,
  EC2Client,
  ImportKeyPairCommand,
  RunInstancesCommand,
  _InstanceType,
} from '@aws-sdk/client-ec2'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'

import { protectedClient } from '@/lib/safe-action'
import { CloudProviderAccount } from '@/payload-types'

import {
  connectAWSAccountSchema,
  createEC2InstanceSchema,
  deleteAWSAccountSchema,
} from './validator'

export const createEC2InstanceAction = protectedClient
  .metadata({
    actionName: 'createEC2InstanceAction',
  })
  .schema(createEC2InstanceSchema)
  .action(async ({ clientInput }) => {
    const {
      name,
      accountId,
      sshKeyId,
      ami,
      description,
      diskSize,
      instanceType,
      region,
      securityGroupIds,
    } = clientInput
    const payload = await getPayload({ config: configPromise })

    const awsAccountDetails = await payload.findByID({
      collection: 'cloudProviderAccounts',
      id: accountId,
    })

    const sshKeyDetails = await payload.findByID({
      collection: 'sshKeys',
      id: sshKeyId,
    })

    // 1. Create the EC2 client
    const ec2Client = new EC2Client({
      region,
      credentials: {
        accessKeyId: awsAccountDetails.awsDetails?.accessKeyId!,
        secretAccessKey: awsAccountDetails.awsDetails?.secretAccessKey!,
      },
    })

    // 2. Check if a key pair with this name already exists
    const describeKeysCommand = new DescribeKeyPairsCommand({
      KeyNames: [sshKeyDetails.name],
    })
    const sshKeys = await ec2Client.send(describeKeysCommand)

    const sshKey = sshKeys.KeyPairs?.find(
      key => key.KeyName === sshKeyDetails.name,
    )

    // Create the key pair if it doesn't exist
    if (!sshKey?.KeyName) {
      const keyCommand = new ImportKeyPairCommand({
        KeyName: sshKeyDetails.name,
        PublicKeyMaterial: Buffer.from(sshKeyDetails.publicKey),
      })
      await ec2Client.send(keyCommand)
    }

    // 3. Get security groups and check sync status
    const { docs: securityGroups } = await payload.find({
      collection: 'securityGroups',
      pagination: false,
      where: {
        id: {
          in: securityGroupIds,
        },
      },
    })

    // 4. Check for unsynced security groups and trigger sync
    const unsyncedGroups = securityGroups.filter(
      sg => sg.syncStatus !== 'in-sync',
    )

    if (unsyncedGroups.length > 0) {
      // Update status to start sync
      await Promise.all(
        unsyncedGroups.map(
          async sg =>
            await payload.update({
              collection: 'securityGroups',
              id: sg.id,
              data: {
                syncStatus: 'start-sync',
              },
            }),
        ),
      )

      // Wait for sync to complete (you might need a more robust solution here)
      let allSynced = false
      let attempts = 0
      const maxAttempts = 10
      const delay = 5000 // 5 seconds

      while (!allSynced && attempts < maxAttempts) {
        attempts++
        await new Promise(r => setTimeout(r, delay))

        // Fetch latest status
        const { docs: updatedGroups } = await payload.find({
          collection: 'securityGroups',
          pagination: false,
          where: {
            id: {
              in: unsyncedGroups.map(g => g.id),
            },
          },
        })

        allSynced = updatedGroups.every(g => g.syncStatus === 'in-sync')
      }

      if (!allSynced) {
        throw new Error('Some security groups failed to sync')
      }

      // Refetch all security groups to get updated securityGroupIds
      const { docs: refreshedGroups } = await payload.find({
        collection: 'securityGroups',
        pagination: false,
        where: {
          id: {
            in: securityGroupIds,
          },
        },
      })

      // Update the security groups array with refreshed data
      securityGroups.splice(0, securityGroups.length, ...refreshedGroups)
    }

    // 5. Get valid security group IDs
    const validSecurityGroupIds = securityGroups
      .map(sg => sg.securityGroupId)
      .filter((sgId): sgId is string => sgId !== null && sgId !== undefined)

    if (validSecurityGroupIds.length === 0) {
      throw new Error('No valid security groups available')
    }

    // 6. Create the EC2 instance
    const ec2Command = new RunInstancesCommand({
      ImageId: ami,
      InstanceType: instanceType as _InstanceType,
      MinCount: 1,
      MaxCount: 1,
      KeyName: sshKeyDetails.name,
      SecurityGroupIds: validSecurityGroupIds,
      BlockDeviceMappings: [
        {
          DeviceName: '/dev/sda1',
          Ebs: {
            VolumeSize: diskSize,
            VolumeType: 'gp3',
            DeleteOnTermination: true,
          },
        },
      ],
      TagSpecifications: [
        {
          ResourceType: 'instance',
          Tags: [
            {
              Key: 'Name',
              Value: name,
            },
          ],
        },
      ],
    })

    const ec2Response = await ec2Client.send(ec2Command)
    console.dir({ ec2Response }, { depth: Infinity })

    const instanceDetails = ec2Response.Instances?.[0]

    if (instanceDetails) {
      // 7. Poll for the public IP address of the instance
      async function pollForPublicIP() {
        for (let i = 0; i < 10; i++) {
          const describeCommand = new DescribeInstancesCommand({
            InstanceIds: [instanceDetails?.InstanceId!],
          })

          const result = await ec2Client.send(describeCommand)
          const ip = result.Reservations?.[0]?.Instances?.[0]?.PublicIpAddress

          if (ip) {
            return ip
          }

          await new Promise(r => setTimeout(r, 5000)) // wait 5 seconds
        }

        throw new Error('Public IP not assigned yet after waiting')
      }

      const ip = await pollForPublicIP()

      // 8. Create server record
      const serverResponse = await payload.create({
        collection: 'servers',
        data: {
          name,
          description,
          port: 22,
          sshKey: sshKeyId,
          username: 'ubuntu',
          ip,
          provider: 'aws',
          securityGroups: securityGroups.map(sg => sg.id),
        },
      })

      if (serverResponse.id) {
        revalidatePath('/settings/servers')
        return { success: true }
      }
    }
  })

export const connectAWSAccountAction = protectedClient
  .metadata({
    actionName: 'connectAWSAccountAction',
  })
  .schema(connectAWSAccountSchema)
  .action(async ({ clientInput }) => {
    const { accessKeyId, secretAccessKey, name, id } = clientInput
    const payload = await getPayload({ config: configPromise })

    let response: CloudProviderAccount

    if (id) {
      response = await payload.update({
        collection: 'cloudProviderAccounts',
        id,
        data: {
          type: 'aws',
          awsDetails: {
            accessKeyId,
            secretAccessKey,
          },
          name,
        },
      })
    } else {
      response = await payload.create({
        collection: 'cloudProviderAccounts',
        data: {
          type: 'aws',
          awsDetails: {
            accessKeyId,
            secretAccessKey,
          },
          name,
        },
      })
    }

    return response
  })

export const deleteAWSAccountAction = protectedClient
  .metadata({
    actionName: 'deleteAWSAccountAction',
  })
  .schema(deleteAWSAccountSchema)
  .action(async ({ clientInput }) => {
    const { id } = clientInput
    const payload = await getPayload({ config: configPromise })

    const response = await payload.delete({
      collection: 'cloudProviderAccounts',
      id,
    })

    return response
  })
