'use server'

import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'

import { dokku } from '@/lib/dokku'
import { pub } from '@/lib/redis'
import { protectedClient } from '@/lib/safe-action'
import { dynamicSSH } from '@/lib/ssh'
import { addManageServerDomainQueue } from '@/queues/domain/manageGlobal'

import {
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
      },
    })

    if (response) {
      revalidatePath('/settings/servers')
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
      revalidatePath(`/settings/servers/${id}`)
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
      revalidatePath(`/settings/servers/${id}`)
      return { deleted: true }
    }
  })

export const installDokkuAction = protectedClient
  .metadata({
    actionName: 'installDokkuAction',
  })
  .schema(installDokkuSchema)
  .action(async ({ clientInput }) => {
    const { host, port, privateKey, username, serverId } = clientInput

    const ssh = await dynamicSSH({
      host,
      port,
      privateKey,
      username,
    })

    const installationResponse = await dokku.version.install(ssh, {
      onStdout: async chunk => {
        await pub.publish('my-channel', chunk.toString())
        console.info(chunk.toString())
      },
      onStderr: async chunk => {
        await pub.publish('my-channel', chunk.toString())
        console.info({
          installDokkuLogs: {
            message: chunk.toString(),
            type: 'stdout',
          },
        })
      },
    })

    if (installationResponse.success) {
      revalidatePath(`/settings/servers/${serverId}`)
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
      },
      sshDetails: {
        host: response.ip,
        port: response.port,
        username: response.username,
        privateKey,
      },
    })

    if (queueResponse.id) {
      revalidatePath(`/settings/servers/${id}`)
      return { success: true }
    }
  })
