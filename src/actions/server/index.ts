'use server'

import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'

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
