import configPromise from '@payload-config'
import { Job } from 'bullmq'
import { NodeSSH } from 'node-ssh'
import { getPayload } from 'payload'

import { getQueue, getWorker } from '@/lib/bullmq'
import { dokku } from '@/lib/dokku'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendActionEvent, sendEvent } from '@/lib/sendEvent'
import { SSHType, dynamicSSH } from '@/lib/ssh'
import { Server } from '@/payload-types'

interface QueueArgs {
  sshDetails: SSHType
  pluginDetails: {
    name: string
  }
  serverDetails: {
    id: string
    previousPlugins: Server['plugins']
  }
  tenant: {
    slug: string
  }
}

export const addDeletePluginQueue = async (data: QueueArgs) => {
  const QUEUE_NAME = `server-${data.serverDetails.id}-delete-plugin`

  const deletePluginQueue = getQueue({
    name: QUEUE_NAME,
    connection: queueConnection,
  })

  const worker = getWorker<QueueArgs>({
    name: QUEUE_NAME,
    processor: async job => {
      const { sshDetails, pluginDetails, serverDetails, tenant } = job.data
      const { previousPlugins = [] } = serverDetails
      let ssh: NodeSSH | null = null
      const payload = await getPayload({ config: configPromise })

      try {
        ssh = await dynamicSSH(sshDetails)

        const pluginUninstallationResponse = await dokku.plugin.uninstall(
          ssh,
          pluginDetails.name,
          {
            onStdout: async chunk => {
              sendEvent({
                pub,
                message: chunk.toString(),
                serverId: serverDetails.id,
              })
            },
            onStderr: async chunk => {
              sendEvent({
                pub,
                message: chunk.toString(),
                serverId: serverDetails.id,
              })
            },
          },
        )

        if (pluginUninstallationResponse.code === 0) {
          sendEvent({
            pub,
            message: `✅ Successfully uninstalled ${pluginDetails.name} plugin`,
            serverId: serverDetails.id,
          })

          sendEvent({
            pub,
            message: `Syncing changes...`,
            serverId: serverDetails.id,
          })

          const pluginsResponse = await dokku.plugin.list(ssh)

          // if previous-plugins are there then removing from previous else updating with server-response
          const filteredPlugins = previousPlugins
            ? previousPlugins.filter(
                plugin => plugin.name !== pluginDetails.name,
              )
            : pluginsResponse.plugins.map(plugin => ({
                name: plugin.name,
                status: plugin.status
                  ? ('enabled' as const)
                  : ('disabled' as const),
                version: plugin.version,
              }))

          await payload.update({
            collection: 'servers',
            id: serverDetails.id,
            data: {
              plugins: filteredPlugins,
            },
          })

          sendActionEvent({
            pub,
            action: 'refresh',
            tenantSlug: tenant.slug,
          })
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : ''
        throw new Error(
          `❌ failed to uninstall ${pluginDetails?.name} plugin: ${message}`,
        )
      } finally {
        ssh?.dispose()
      }
    },

    connection: queueConnection,
  })

  worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
    if (job?.data) {
      sendEvent({
        pub,
        message: err.message,
        serverId: job.data.serverDetails.id,
      })
    }
  })

  const id = `delete-plugin-${data.pluginDetails.name}:${new Date().getTime()}`

  return await deletePluginQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
