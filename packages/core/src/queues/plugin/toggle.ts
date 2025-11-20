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
    enabled: boolean
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

export const addTogglePluginQueue = async (data: QueueArgs) => {
  const QUEUE_NAME = `server-${data.serverDetails.id}-toggle-plugin`

  const togglePluginQueue = getQueue({
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

        const pluginStatusResponse = await dokku.plugin.toggle({
          enabled: pluginDetails.enabled,
          pluginName: pluginDetails.name,
          ssh,
          options: {
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
        })

        if (pluginStatusResponse.code === 0) {
          sendEvent({
            pub,
            message: `✅ Successfully ${pluginDetails.enabled ? 'enabled' : 'disabled'} ${pluginDetails.name} plugin`,
            serverId: serverDetails.id,
          })

          sendEvent({
            pub,
            message: `Syncing changes...`,
            serverId: serverDetails.id,
          })

          const pluginsResponse = await dokku.plugin.list(ssh)

          const filteredPlugins = pluginsResponse.plugins.map(plugin => {
            const previousPluginDetails = (previousPlugins ?? []).find(
              previousPlugin => previousPlugin?.name === plugin?.name,
            )

            return {
              name: plugin.name,
              status: plugin.status
                ? ('enabled' as const)
                : ('disabled' as const),
              version: plugin.version,
              configuration:
                previousPluginDetails?.configuration &&
                typeof previousPluginDetails?.configuration === 'object' &&
                !Array.isArray(previousPluginDetails?.configuration)
                  ? previousPluginDetails.configuration
                  : {},
            }
          })

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
          `❌ failed to ${pluginDetails?.enabled ? 'enable' : 'disable'} ${pluginDetails?.name} plugin: ${message}`,
        )
      } finally {
        if (ssh) {
          ssh.dispose()
        }
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

  const id = `toggle-${data.pluginDetails.name}-${data.pluginDetails.enabled}:${new Date().getTime()}`

  return await togglePluginQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
