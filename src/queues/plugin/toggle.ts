import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'
import { NodeSSH } from 'node-ssh'

import { payloadWebhook } from '@/lib/payloadWebhook'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendEvent } from '@/lib/sendEvent'
import { Server } from '@/payload-types'

interface QueueArgs {
  sshDetails: {
    host: string
    port: number
    username: string
    privateKey: string
  }
  //   payload: BasePayload
  pluginDetails: {
    enabled: boolean
    name: string
  }
  serverDetails: {
    id: string
    previousPlugins: Server['plugins']
  }
  payloadToken: string | undefined
}

const queueName = 'toggle-plugin'

export const togglePluginQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const { sshDetails, pluginDetails, payloadToken, serverDetails } = job.data
    const { previousPlugins = [] } = serverDetails
    let ssh: NodeSSH | null = null

    if (!payloadToken) {
      console.warn('Payload token is missing!', payloadToken)
    }

    try {
      ssh = await dynamicSSH(sshDetails)

      const pluginStatusResponse = await dokku.plugin.toggle({
        enabled: pluginDetails.enabled,
        pluginName: pluginDetails.name,
        ssh,
        options: {
          onStdout: async chunk => {
            await sendEvent({
              pub,
              message: chunk.toString(),
              serverId: serverDetails.id,
            })
          },
          onStderr: async chunk => {
            await sendEvent({
              pub,
              message: chunk.toString(),
              serverId: serverDetails.id,
            })
          },
        },
      })

      if (pluginStatusResponse.code === 0) {
        await sendEvent({
          pub,
          message: `✅ Successfully ${pluginDetails.enabled ? 'enabled' : 'disabled'} ${pluginDetails.name} plugin`,
          serverId: serverDetails.id,
        })

        await sendEvent({
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

        const updatePluginResponse = await payloadWebhook({
          payloadToken: `${payloadToken}`,
          data: {
            type: 'plugin.update',
            data: {
              serverId: serverDetails.id,
              plugins: filteredPlugins,
            },
          },
        })

        await pub.publish('refresh-channel', JSON.stringify({ refresh: true }))
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
  {
    connection: queueConnection,
    // Add concurrency limit
    concurrency: 1,
  },
)

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  console.log('Failed to toggle plugin', err)

  if (job?.data) {
    await sendEvent({
      pub,
      message: err.message,
      serverId: job.data.serverDetails.id,
    })
  }
})

export const addTogglePluginQueue = async (data: QueueArgs) => {
  const id = `toggle-${data.pluginDetails.name}-${data.pluginDetails.enabled}:${new Date().getTime()}`

  return await togglePluginQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
