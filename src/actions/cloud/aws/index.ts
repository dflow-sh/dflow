'use server'

import {
  DescribeInstancesCommand,
  DescribeKeyPairsCommand,
  EC2Client,
  ImportKeyPairCommand,
  ModifyInstanceAttributeCommand,
  RunInstancesCommand,
  _InstanceType,
} from '@aws-sdk/client-ec2'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'

import { awsRegions } from '@/lib/constants'
import { protectedClient } from '@/lib/safe-action'
import { CloudProviderAccount } from '@/payload-types'

import {
  checkAWSConnectionSchema,
  // Add this to your validator file
  connectAWSAccountSchema,
  createEC2InstanceSchema,
  deleteAWSAccountSchema,
  updateEC2InstanceSchema,
} from './validator'

export const createEC2InstanceAction = protectedClient
  .metadata({
    actionName: 'createEC2InstanceAction',
  })
  .schema(createEC2InstanceSchema)
  .action(async ({ clientInput, ctx }) => {
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
    const {
      userTenant: { tenant },
    } = ctx
    const payload = await getPayload({ config: configPromise })

    const awsAccountDetails = await payload.findByID({
      collection: 'cloudProviderAccounts',
      id: accountId,
    })

    const sshKeyDetails = await payload.findByID({
      collection: 'sshKeys',
      id: sshKeyId,
    })
    const ec2Client = new EC2Client({
      region,
      credentials: {
        accessKeyId: awsAccountDetails.awsDetails?.accessKeyId!,
        secretAccessKey: awsAccountDetails.awsDetails?.secretAccessKey!,
      },
    })

    const describeKeysCommand = new DescribeKeyPairsCommand()

    const sshKeys = await ec2Client.send(describeKeysCommand)

    const sshKey = sshKeys.KeyPairs?.find(
      key => key.KeyName === sshKeyDetails.name,
    )

    if (!sshKey?.KeyName) {
      const keyCommand = new ImportKeyPairCommand({
        KeyName: sshKeyDetails.name,
        PublicKeyMaterial: Buffer.from(sshKeyDetails.publicKey),
      })
      await ec2Client.send(keyCommand)
    }

    const { docs: securityGroups } = await payload.find({
      collection: 'securityGroups',
      pagination: false,
      where: {
        id: {
          in: securityGroupIds,
        },
      },
    })

    const unsyncedGroups = securityGroups.filter(
      sg => sg.syncStatus !== 'in-sync',
    )

    if (unsyncedGroups.length > 0) {
      await Promise.all(
        unsyncedGroups.map(sg =>
          payload.update({
            collection: 'securityGroups',
            id: sg.id,
            data: {
              syncStatus: 'start-sync',
              cloudProvider: 'aws',
              cloudProviderAccount: accountId,
              lastSyncedAt: new Date().toISOString(),
            },
          }),
        ),
      )

      // Re-check sync status once
      const { docs: updatedGroups } = await payload.find({
        collection: 'securityGroups',
        pagination: false,
        where: {
          id: {
            in: unsyncedGroups.map(g => g.id),
          },
        },
      })

      const stillNotSynced = updatedGroups.filter(
        g => g.syncStatus !== 'in-sync',
      )

      if (stillNotSynced.length > 0) {
        throw new Error('Some security groups failed to sync')
      }

      const { docs: refreshedGroups } = await payload.find({
        collection: 'securityGroups',
        pagination: false,
        where: {
          id: {
            in: securityGroupIds,
          },
        },
      })

      securityGroups.splice(0, securityGroups.length, ...refreshedGroups)
    }

    const validSecurityGroupIds = securityGroups
      .map(sg => sg.securityGroupId)
      .filter((sgId): sgId is string => !!sgId)

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
          Tags: [{ Key: 'Name', Value: name }],
        },
      ],
    })

    const ec2Response = await ec2Client.send(ec2Command)

    const instanceDetails = ec2Response.Instances?.[0]

    if (instanceDetails) {
      const pollForPublicIP = async () => {
        for (let i = 0; i < 10; i++) {
          const describeCommand = new DescribeInstancesCommand({
            InstanceIds: [instanceDetails.InstanceId!],
          })

          const result = await ec2Client.send(describeCommand)
          const ip = result.Reservations?.[0]?.Instances?.[0]?.PublicIpAddress

          if (ip) return ip

          await new Promise(r => setTimeout(r, 5000))
        }

        throw new Error('Public IP not assigned yet after waiting')
      }

      const ip = await pollForPublicIP()

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
          cloudProviderAccount: accountId,
          awsEc2Details: {
            instanceId: instanceDetails.InstanceId,
            region: region,
            imageId: instanceDetails.ImageId,
            instanceType: instanceDetails.InstanceType,
            diskSize: diskSize,
            securityGroups: securityGroups.map(sg => sg.id),
            launchTime: instanceDetails.LaunchTime?.toISOString(),
            state: instanceDetails.State?.Name,
            subnetId: instanceDetails.SubnetId,
            vpcId: instanceDetails.VpcId,
            publicDnsName: instanceDetails.PublicDnsName,
            privateDnsName: instanceDetails.PrivateDnsName,
            privateIpAddress: instanceDetails.PrivateIpAddress,
            publicIpAddress: ip,
            keyName: instanceDetails.KeyName,
            architecture: instanceDetails.Architecture,
          },
          tenant,
        },
      })

      if (serverResponse.id) {
        revalidatePath('/servers')
        return { success: true, server: serverResponse }
      }
    }
  })

export const connectAWSAccountAction = protectedClient
  .metadata({
    actionName: 'connectAWSAccountAction',
  })
  .schema(connectAWSAccountSchema)
  .action(async ({ clientInput, ctx }) => {
    const { accessKeyId, secretAccessKey, name, id } = clientInput
    const payload = await getPayload({ config: configPromise })
    const { userTenant } = ctx
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
          tenant: userTenant.tenant,
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

    const response = await payload.update({
      collection: 'cloudProviderAccounts',
      id,
      data: {
        deletedAt: new Date().toISOString(),
      },
    })

    return response
  })

export const updateEC2InstanceAction = protectedClient
  .metadata({
    actionName: 'updateEC2InstanceAction',
  })
  .schema(updateEC2InstanceSchema)
  .action(async ({ clientInput }) => {
    const {
      serverId,
      instanceId,
      accountId,
      name,
      description,
      securityGroupsIds,
    } = clientInput

    const payload = await getPayload({ config: configPromise })

    // Get the server to update
    const server = await payload.findByID({
      collection: 'servers',
      id: clientInput.serverId,
    })

    if (!server) {
      throw new Error(`Server with ID ${clientInput.serverId} not found`)
    }

    // Get AWS account details
    const awsAccountDetails = await payload.findByID({
      collection: 'cloudProviderAccounts',
      id: accountId,
    })

    if (
      !awsAccountDetails?.awsDetails?.accessKeyId ||
      !awsAccountDetails.awsDetails.secretAccessKey
    ) {
      throw new Error('AWS account details not found')
    }

    // Initialize EC2 client
    const ec2Client = new EC2Client({
      region: awsRegions.at(0)?.value || 'us-east-1',
      credentials: {
        accessKeyId: awsAccountDetails.awsDetails.accessKeyId,
        secretAccessKey: awsAccountDetails.awsDetails.secretAccessKey,
      },
    })

    // Process security groups
    const { docs: securityGroups } = await payload.find({
      collection: 'securityGroups',
      pagination: false,
      where: {
        id: {
          in: securityGroupsIds,
        },
      },
    })

    const unsyncedGroups = securityGroups.filter(
      sg => sg.syncStatus !== 'in-sync',
    )

    // Sync unsynced security groups
    if (unsyncedGroups.length > 0) {
      await Promise.all(
        unsyncedGroups.map(sg =>
          payload.update({
            collection: 'securityGroups',
            id: sg.id,
            data: {
              syncStatus: 'start-sync',
              cloudProvider: 'aws',
              cloudProviderAccount: accountId || server.cloudProviderAccount,
              lastSyncedAt: new Date().toISOString(),
            },
          }),
        ),
      )

      // Re-check sync status
      const { docs: updatedGroups } = await payload.find({
        collection: 'securityGroups',
        pagination: false,
        where: {
          id: {
            in: unsyncedGroups.map(g => g.id),
          },
        },
      })

      const stillNotSynced = updatedGroups.filter(
        g => g.syncStatus !== 'in-sync',
      )

      if (stillNotSynced.length > 0) {
        throw new Error('Some security groups failed to sync')
      }

      // Get refreshed groups
      const { docs: refreshedGroups } = await payload.find({
        collection: 'securityGroups',
        pagination: false,
        where: {
          id: {
            in: securityGroupsIds,
          },
        },
      })

      securityGroups.splice(0, securityGroups.length, ...refreshedGroups)
    }

    // Get actual AWS security group IDs
    const validSecurityGroupIds = securityGroups
      .map(sg => sg.securityGroupId)
      .filter((sgId): sgId is string => !!sgId)

    // const isSecurityGroupsUpdated = server.awsEc2Details?.securityGroups?.every(
    //   securityGroup =>
    //     securityGroupsIds?.includes(
    //       (securityGroup as SecurityGroup).securityGroupId as string,
    //     ),
    // )

    await ec2Client.send(
      new ModifyInstanceAttributeCommand({
        InstanceId: instanceId,
        Groups: validSecurityGroupIds,
      }),
    )

    const response = await payload.update({
      collection: 'servers',
      id: serverId,
      data: {
        name,
        description,
        awsEc2Details: {
          ...server.awsEc2Details,
          securityGroups: securityGroupsIds,
        },
      },
    })

    if (response) {
      revalidatePath(`/servers/${server.id}`)
      revalidatePath(`/onboarding/add-server`)
    }

    return { success: true, server: response }
  })

export const checkAWSAccountConnection = protectedClient
  .metadata({
    actionName: 'checkAWSAccountConnection',
  })
  .schema(checkAWSConnectionSchema)
  .action(async ({ clientInput }) => {
    const { accessKeyId, secretAccessKey, region = 'us-east-1' } = clientInput

    try {
      // Validate credentials format
      if (
        !accessKeyId ||
        typeof accessKeyId !== 'string' ||
        accessKeyId.trim() === ''
      ) {
        return {
          isConnected: false,
          accountInfo: null,
          error: 'Invalid or missing AWS Access Key ID',
        }
      }

      if (
        !secretAccessKey ||
        typeof secretAccessKey !== 'string' ||
        secretAccessKey.trim() === ''
      ) {
        return {
          isConnected: false,
          accountInfo: null,
          error: 'Invalid or missing AWS Secret Access Key',
        }
      }

      // Initialize EC2 client with provided credentials
      const ec2Client = new EC2Client({
        region,
        credentials: {
          accessKeyId: accessKeyId.trim(),
          secretAccessKey: secretAccessKey.trim(),
        },
      })

      // Perform a simple API call to test connectivity
      // DescribeKeyPairs is a low-cost operation that requires minimal permissions
      const testCommand = new DescribeKeyPairsCommand({})

      const response = await ec2Client.send(testCommand)

      // If we reach here, the connection is successful
      const accountInfo = {
        region,
        keyPairsCount: response.KeyPairs?.length || 0,
        hasEC2Access: true,
        connectionTime: new Date().toISOString(),
      }

      return {
        isConnected: true,
        accountInfo,
        error: null,
      }
    } catch (error: any) {
      console.error('AWS account connection check failed:', error)

      // Handle specific AWS error types
      if (
        error.name === 'InvalidUserID.NotFound' ||
        error.name === 'InvalidAccessKeyId'
      ) {
        return {
          isConnected: false,
          accountInfo: null,
          error: 'Invalid AWS Access Key ID. Please check your credentials.',
        }
      }

      if (error.name === 'SignatureDoesNotMatch') {
        return {
          isConnected: false,
          accountInfo: null,
          error:
            'Invalid AWS Secret Access Key. Please check your credentials.',
        }
      }

      if (error.name === 'UnauthorizedOperation') {
        return {
          isConnected: false,
          accountInfo: null,
          error:
            'AWS credentials are valid but lack EC2 permissions. Please ensure your IAM user has the necessary permissions.',
        }
      }

      if (
        error.name === 'TokenRefreshRequired' ||
        error.name === 'ExpiredToken'
      ) {
        return {
          isConnected: false,
          accountInfo: null,
          error:
            'AWS security token has expired. Please generate new credentials.',
        }
      }

      if (
        error.name === 'NetworkingError' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ECONNREFUSED'
      ) {
        return {
          isConnected: false,
          accountInfo: null,
          error:
            'Network error. Please check your internet connection and try again.',
        }
      }

      if (error.code === 'ECONNABORTED' || error.name === 'TimeoutException') {
        return {
          isConnected: false,
          accountInfo: null,
          error:
            'Connection timeout. The AWS service may be slow or unavailable.',
        }
      }

      if (
        error.name === 'ServiceUnavailable' ||
        error.name === 'InternalError'
      ) {
        return {
          isConnected: false,
          accountInfo: null,
          error:
            'AWS service is temporarily unavailable. Please try again later.',
        }
      }

      if (
        error.name === 'ThrottlingException' ||
        error.name === 'RequestLimitExceeded'
      ) {
        return {
          isConnected: false,
          accountInfo: null,
          error: 'Too many requests. Please wait a moment and try again.',
        }
      }

      // Generic error fallback
      return {
        isConnected: false,
        accountInfo: null,
        error:
          'Failed to connect to AWS. Please check your credentials and try again.',
      }
    }
  })
