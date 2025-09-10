'use server'

import { revalidatePath } from 'next/cache'
import { NodeSSH } from 'node-ssh'

import { dokku } from '@/lib/dokku'
import { protectedClient } from '@/lib/safe-action'
import { dynamicSSH, extractSSHDetails } from '@/lib/ssh'
import { addLetsencryptPluginConfigureQueue } from '@/queues/letsencrypt/configure'
import { addInstallLetsencryptAndConfigureQueue } from '@/queues/letsencrypt/installAndConfigure'
import { addDeletePluginQueue } from '@/queues/plugin/delete'
import { addInstallPluginQueue } from '@/queues/plugin/install'
import { addTogglePluginQueue } from '@/queues/plugin/toggle'

import {
  checkPluginUsageSchema,
  configureLetsencryptPluginSchema,
  installAndConfigureLetsencryptPluginSchema,
  installPluginSchema,
  syncPluginSchema,
  togglePluginStatusSchema,
} from './validator'

export const installPluginAction = protectedClient
  .metadata({
    actionName: 'installPluginAction',
  })
  .schema(installPluginSchema)
  .action(async ({ clientInput, ctx }) => {
    const { payload, userTenant } = ctx
    const { serverId, pluginName, pluginURL } = clientInput

    // Fetching server details instead of passing from client
    const server = await payload.findByID({
      collection: 'servers',
      id: serverId,
      depth: 5,
    })

    const sshDetails = extractSSHDetails({ server })
    const queueResponse = await addInstallPluginQueue({
      pluginDetails: {
        name: pluginName,
        url: pluginURL,
      },
      serverDetails: {
        id: serverId,
        previousPlugins: server.plugins ?? [],
      },
      sshDetails,
      tenant: {
        slug: userTenant.tenant.slug,
      },
    })

    if (queueResponse.id) {
      return { success: true }
    }
  })

export const syncPluginAction = protectedClient
  .metadata({
    actionName: 'syncPluginAction',
  })
  .schema(syncPluginSchema)
  .action(async ({ clientInput, ctx }) => {
    const { payload } = ctx
    const { serverId } = clientInput

    // Fetching server details instead of passing from client
    const server = await payload.findByID({
      collection: 'servers',
      id: serverId,
      depth: 5,
    })

    const sshDetails = extractSSHDetails({
      server,
    })

    let ssh: NodeSSH | null = null

    try {
      ssh = await dynamicSSH(sshDetails)
      const previousPlugins = server?.plugins ?? []

      const pluginsResponse = await dokku.plugin.list(ssh)

      const filteredPlugins = pluginsResponse.plugins.map(plugin => {
        const previousPluginDetails = (previousPlugins ?? []).find(
          previousPlugin => previousPlugin?.name === plugin?.name,
        )

        return {
          name: plugin.name,
          status: plugin.status ? ('enabled' as const) : ('disabled' as const),
          version: plugin.version,
          configuration:
            previousPluginDetails?.configuration &&
            typeof previousPluginDetails?.configuration === 'object' &&
            !Array.isArray(previousPluginDetails?.configuration)
              ? previousPluginDetails.configuration
              : {},
        }
      })

      // Updating plugin list in database
      const updatedServerResponse = await payload.update({
        collection: 'servers',
        id: serverId,
        data: {
          plugins: filteredPlugins,
        },
      })

      revalidatePath(`/servers/${serverId}`)
      return { success: true, plugins: updatedServerResponse.plugins ?? [] }
    } catch (error) {
      let message = ''
      if (error instanceof Error) {
        message = error.message
      }

      throw new Error(`Failed to sync plugins: ${message}`)
    } finally {
      if (ssh) {
        ssh.dispose()
      }
    }
  })

export const togglePluginStatusAction = protectedClient
  .metadata({
    actionName: 'togglePluginStatusAction',
  })
  .schema(togglePluginStatusSchema)
  .action(async ({ clientInput, ctx }) => {
    const { payload, userTenant } = ctx
    const { pluginName, serverId, enabled } = clientInput

    // Fetching server details instead of passing from client
    const server = await payload.findByID({
      collection: 'servers',
      id: serverId,
      depth: 5,
    })

    const sshDetails = extractSSHDetails({ server })
    const queueResponse = await addTogglePluginQueue({
      sshDetails,
      pluginDetails: {
        enabled,
        name: pluginName,
      },
      serverDetails: {
        id: serverId,
        previousPlugins: server.plugins ?? [],
      },
      tenant: {
        slug: userTenant.tenant.slug,
      },
    })

    if (queueResponse.id) {
      return { success: true }
    }
  })

export const deletePluginAction = protectedClient
  .metadata({
    actionName: 'deletePluginAction',
  })
  .schema(installPluginSchema)
  .action(async ({ clientInput, ctx }) => {
    const { payload, userTenant } = ctx
    const { serverId, pluginName } = clientInput

    // Fetching server details instead of passing from client
    const server = await payload.findByID({
      collection: 'servers',
      id: serverId,
      depth: 5,
    })

    const sshDetails = extractSSHDetails({ server })

    const queueResponse = await addDeletePluginQueue({
      pluginDetails: {
        name: pluginName,
      },
      serverDetails: {
        id: serverId,
        previousPlugins: server.plugins ?? [],
      },
      sshDetails,
      tenant: {
        slug: userTenant.tenant.slug,
      },
    })

    if (queueResponse.id) {
      return { success: true }
    }
  })

export const checkPluginUsageAction = protectedClient
  .metadata({
    actionName: 'checkPluginUsageAction',
  })
  .schema(checkPluginUsageSchema)
  .action(async ({ clientInput, ctx }) => {
    const { payload } = ctx
    const { serverId, connectionType, pluginName, category } = clientInput

    console.log({ serverId, pluginName, category })

    if (category === 'database') {
      const { docs: services } = await payload.find({
        collection: 'services',
        where: {
          'databaseDetails.type': {
            equals: pluginName,
          },
          'project.server': {
            equals: serverId,
          },
        },
        depth: 1,
      })

      if (services.length > 0) {
        return { success: true, inUse: true, services }
      } else {
        return { success: true, inUse: false, services: [] }
      }
    }

    if (category === 'messageQueue') {
      return { success: true, inUse: false, services: [] }
    }

    if (category === 'domain') {
      if (pluginName === 'letsencrypt' && connectionType === 'ssh') {
        return { success: true, inUse: true, services: [] }
      }
    }

    return { success: true, inUse: false, services: [] }
  })

export const configureLetsencryptPluginAction = protectedClient
  .metadata({
    actionName: 'configureLetsencryptPluginAction',
  })
  .schema(configureLetsencryptPluginSchema)
  .action(async ({ clientInput, ctx }) => {
    const { payload, userTenant } = ctx
    const { email, autoGenerateSSL = false, serverId } = clientInput

    const userEmail = email || ctx.user.email

    // Fetching server details instead of passing from client
    const server = await payload.findByID({
      collection: 'servers',
      id: serverId,
      depth: 1,
    })

    const sshDetails = extractSSHDetails({ server })
    const queueResponse = await addLetsencryptPluginConfigureQueue({
      serverDetails: {
        id: serverId,
      },
      pluginDetails: {
        autoGenerateSSL,
        email: userEmail,
      },
      sshDetails,
      tenant: {
        slug: userTenant.tenant.slug,
      },
    })

    if (queueResponse.id) {
      return { success: true }
    }
  })

export const installAndConfigureLetsencryptPluginAction = protectedClient
  .metadata({
    actionName: 'installAndConfigureLetsencryptPluginAction',
  })
  .schema(installAndConfigureLetsencryptPluginSchema)
  .action(async ({ clientInput, ctx }) => {
    const { payload, userTenant } = ctx
    const { serverId } = clientInput

    const userEmail = ctx.user.email

    // Fetching server details instead of passing from client
    const server = await payload.findByID({
      collection: 'servers',
      id: serverId,
      depth: 1,
    })

    const sshDetails = extractSSHDetails({ server })
    const queueResponse = await addInstallLetsencryptAndConfigureQueue({
      serverDetails: {
        id: serverId,
      },
      pluginDetails: {
        autoGenerateSSL: true,
        email: userEmail,
      },
      sshDetails,
      tenant: {
        slug: userTenant.tenant.slug,
      },
    })

    if (queueResponse.id) {
      return { success: true }
    }
  })
