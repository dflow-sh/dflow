'use server'

import { EC2Client, ModifyInstanceAttributeCommand } from '@aws-sdk/client-ec2'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'

import { awsRegions } from '@/lib/constants'
import { protectedClient } from '@/lib/safe-action'
import { addInstallRailpackQueue } from '@/queues/builder/installRailpack'
import { addInstallDokkuQueue } from '@/queues/dokku/install'
import { addManageServerDomainQueue } from '@/queues/domain/manageGlobal'

import {
  completeServerOnboardingSchema,
  createServerSchema,
  deleteServerSchema,
  installDokkuSchema,
  updateServerDomainSchema,
  updateServerSchema,
} from './validator'

const payload = await getPayload({ config: configPromise })

// No need to handle try/catch that abstraction is taken care by next-safe-actions
export const createServerAction = protectedClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'createServerAction',
  })
  .schema(createServerSchema)
  .action(async ({ clientInput }) => {
    const { name, description, ip, port, username, sshKey } = clientInput

    const response = await payload.create({
      collection: 'servers',
      data: {
        name,
        description,
        ip,
        port,
        username,
        sshKey,
        provider: 'other',
      },
    })

    if (response) {
      revalidatePath('/servers')
    }

    return response
  })

export const updateServerAction = protectedClient
  .metadata({
    actionName: 'updateServerAction',
  })
  .schema(updateServerSchema)
  .action(async ({ clientInput }) => {
    const { id, ...data } = clientInput

    const response = await payload.update({
      id,
      data,
      collection: 'servers',
    })

    if (
      response.provider === 'aws' &&
      response.cloudProviderAccount &&
      response.securityGroups?.length
    ) {
      const cloudProviderAccountId =
        typeof response.cloudProviderAccount === 'object'
          ? response.cloudProviderAccount.id
          : response.cloudProviderAccount

      const awsAccountDetails = await payload.findByID({
        collection: 'cloudProviderAccounts',
        id: cloudProviderAccountId,
      })

      const ec2Client = new EC2Client({
        region: awsRegions.at(0)?.value || 'ap-south-1',
        credentials: {
          accessKeyId: awsAccountDetails.awsDetails?.accessKeyId!,
          secretAccessKey: awsAccountDetails.awsDetails?.secretAccessKey!,
        },
      })

      if (response.securityGroups.length && response.instanceId) {
        const securityGroupIds = response.securityGroups.map(sg =>
          typeof sg === 'object' ? sg.id : sg,
        )

        // Fetch current security groups
        const { docs: securityGroups } = await payload.find({
          collection: 'securityGroups',
          pagination: false,
          where: {
            id: {
              in: securityGroupIds,
            },
          },
        })

        // Start sync for unsynced ones
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
                  cloudProviderAccount: awsAccountDetails.id,
                  lastSyncedAt: new Date().toISOString(),
                },
              }),
            ),
          )

          // Re-fetch once to check syncStatus
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
        }

        // Final fetch to get valid AWS Group IDs
        const { docs: refreshedGroups } = await payload.find({
          collection: 'securityGroups',
          pagination: false,
          where: {
            id: {
              in: securityGroupIds,
            },
          },
        })

        const validSecurityGroupIds = refreshedGroups
          .map(sg => sg.securityGroupId)
          .filter((id): id is string => !!id)

        if (validSecurityGroupIds.length === 0) {
          throw new Error('No valid security groups available')
        }

        // Apply to EC2 instance
        const updatedec2 = await ec2Client.send(
          new ModifyInstanceAttributeCommand({
            InstanceId: response.instanceId,
            Groups: validSecurityGroupIds,
          }),
        )

        console.log({ updatedec2 })
      }
    }

    if (response) {
      revalidatePath(`/servers/${id}`)
      revalidatePath(`/onboarding/add-server`)
    }

    return response
  })

export const deleteServerAction = protectedClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'deleteServerAction',
  })
  .schema(deleteServerSchema)
  .action(async ({ clientInput }) => {
    const { id } = clientInput

    const response = await payload.delete({
      collection: 'servers',
      id,
    })

    if (response) {
      revalidatePath(`/servers/${id}`)
      return { deleted: true }
    }
  })

export const installDokkuAction = protectedClient
  .metadata({
    actionName: 'installDokkuAction',
  })
  .schema(installDokkuSchema)
  .action(async ({ clientInput }) => {
    const { serverId } = clientInput
    const serverDetails = await payload.findByID({
      collection: 'servers',
      id: serverId,
      depth: 10,
    })

    if (typeof serverDetails.sshKey === 'object') {
      const installationResponse = await addInstallDokkuQueue({
        serverDetails: {
          id: serverId,
          provider: serverDetails.provider,
        },
        sshDetails: {
          host: serverDetails.ip,
          port: serverDetails.port,
          privateKey: serverDetails.sshKey.privateKey,
          username: serverDetails.username,
        },
      })

      if (installationResponse.id) {
        return { success: true }
      }
    }
  })

export const updateServerDomainAction = protectedClient
  .metadata({
    actionName: 'updateServerDomainAction',
  })
  .schema(updateServerDomainSchema)
  .action(async ({ clientInput }) => {
    const { id, domain, operation } = clientInput

    // Fetching server-details for showing previous details
    const { domains: serverPreviousDomains } = await payload.findByID({
      id,
      collection: 'servers',
    })

    const previousDomains = serverPreviousDomains ?? []

    const domains =
      operation !== 'remove'
        ? [...previousDomains, { domain, default: operation === 'set' }]
        : previousDomains.filter(prevDomain => prevDomain.domain !== domain)

    const response = await payload.update({
      id,
      data: {
        domains,
      },
      collection: 'servers',
      depth: 10,
    })

    const privateKey =
      typeof response.sshKey === 'object' ? response.sshKey.privateKey : ''

    const queueResponse = await addManageServerDomainQueue({
      serverDetails: {
        global: {
          domain,
          action: operation,
        },
        id,
      },
      sshDetails: {
        host: response.ip,
        port: response.port,
        username: response.username,
        privateKey,
      },
    })

    if (queueResponse.id) {
      revalidatePath(`/servers/${id}`)
      return { success: true }
    }
  })

export const installRailpackAction = protectedClient
  .metadata({
    actionName: 'installRailpackAction',
  })
  .schema(installDokkuSchema)
  .action(async ({ clientInput }) => {
    const { serverId } = clientInput
    const serverDetails = await payload.findByID({
      collection: 'servers',
      id: serverId,
      depth: 10,
    })

    if (typeof serverDetails.sshKey === 'object') {
      const installationResponse = await addInstallRailpackQueue({
        serverDetails: {
          id: serverId,
        },
        sshDetails: {
          host: serverDetails.ip,
          port: serverDetails.port,
          privateKey: serverDetails.sshKey.privateKey,
          username: serverDetails.username,
        },
      })

      if (installationResponse.id) {
        return { success: true }
      }
    }
  })

export const completeServerOnboardingAction = protectedClient
  .metadata({
    actionName: 'completeServerOnboardingAction',
  })
  .schema(completeServerOnboardingSchema)
  .action(async ({ clientInput }) => {
    const { serverId } = clientInput

    const response = await payload.update({
      id: serverId,
      data: {
        onboarded: true,
      },
      collection: 'servers',
    })

    if (response) {
      revalidatePath(`/servers/${serverId}`)
      return { success: true, server: response }
    }

    return { success: false }
  })
