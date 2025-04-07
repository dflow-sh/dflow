'use server'

import {
  AuthorizeSecurityGroupIngressCommand,
  CreateSecurityGroupCommand,
  DescribeInstancesCommand,
  DescribeKeyPairsCommand,
  DescribeSecurityGroupsCommand,
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

    // 3. Check if dflow-securitygroup already exists, if not create it
    let securityGroupId
    // Check if the security group already exists
    const describeSecurityGroupsCommand = new DescribeSecurityGroupsCommand({
      Filters: [
        {
          Name: 'group-name',
          Values: ['dflow-securitygroup'],
        },
      ],
    })

    const existingGroups = await ec2Client.send(describeSecurityGroupsCommand)

    const securityGroup = existingGroups.SecurityGroups?.find(
      group => group.GroupName === 'dflow-securitygroup',
    )

    if (securityGroup) {
      // Use the existing security group
      securityGroupId = securityGroup.GroupId
      console.log('Using existing dflow-securitygroup:', securityGroupId)
    } else {
      // Create a new security group
      const securityGroupCommand = new CreateSecurityGroupCommand({
        GroupName: 'dflow-securitygroup',
        Description: 'Security group for dflow',
      })

      const securityGroupResponse = await ec2Client.send(securityGroupCommand)
      securityGroupId = securityGroupResponse.GroupId
      console.log('Created new dflow-securitygroup:', securityGroupId)

      // 4. Authorize access to the security group
      const authorizeCommand = new AuthorizeSecurityGroupIngressCommand({
        GroupId: securityGroupId,
        IpPermissions: [
          {
            IpProtocol: 'tcp',
            FromPort: 22,
            ToPort: 22,
            IpRanges: [{ CidrIp: '0.0.0.0/0', Description: 'SSH access' }],
          },
          {
            IpProtocol: 'tcp',
            FromPort: 80,
            ToPort: 80,
            IpRanges: [{ CidrIp: '0.0.0.0/0', Description: 'HTTP access' }],
          },
          {
            IpProtocol: 'tcp',
            FromPort: 443,
            ToPort: 443,
            IpRanges: [{ CidrIp: '0.0.0.0/0', Description: 'HTTPS access' }],
          },
          {
            IpProtocol: 'tcp',
            FromPort: 19999,
            ToPort: 19999,
            IpRanges: [{ CidrIp: '0.0.0.0/0', Description: 'Netdata Metrics' }],
          },
        ],
      })

      await ec2Client.send(authorizeCommand)
    }

    // 5. Create the EC2 instance with the SSH key-pair, Security Group, Disk Storage
    const ec2Command = new RunInstancesCommand({
      ImageId: ami,
      InstanceType: instanceType as _InstanceType,
      MinCount: 1,
      MaxCount: 1,
      KeyName: sshKeyDetails.name,
      SecurityGroupIds: [securityGroupId ?? ''],
      BlockDeviceMappings: [
        {
          // DeviceName: '/dev/xvda',
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
      // 6. Poll for the public IP address of the instance
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

      // 7. Updating the instance details in database with private-ip address
      const serverResponse = await payload.create({
        collection: 'servers',
        data: {
          name,
          description,
          port: 22,
          sshKey: sshKeyId,
          username: 'ubuntu',
          ip,
        },
      })

      if (serverResponse.id) {
        revalidatePath(`/settings/servers`)
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
