import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'

import { payloadWebhook } from '@/lib/payloadWebhook'
import { pub, queueConnection } from '@/lib/redis'

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
  serviceDetails: {
    id: string
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
    const { sshDetails, pluginDetails, payloadToken, serviceDetails } = job.data

    if (!payloadToken) {
      console.warn('Payload token is missing!', payloadToken)
    }

    try {
      const ssh = await dynamicSSH(sshDetails)

      const pluginStatusResponse = await dokku.plugin.toggle({
        enabled: pluginDetails.enabled,
        pluginName: pluginDetails.name,
        ssh,
        options: {
          onStdout: async chunk => {
            await pub.publish('my-channel', chunk.toString())
          },
          onStderr: async chunk => {
            await pub.publish('my-channel', chunk.toString())
          },
        },
      })

      if (pluginStatusResponse.code === 0) {
        await pub.publish(
          'my-channel',
          `✅ Successfully ${pluginDetails.enabled ? 'enabled' : 'disabled'} ${pluginDetails.name} plugin`,
        )

        await pub.publish('my-channel', `Syncing changes...`)

        const pluginsResponse = await dokku.plugin.list(ssh)

        const updatePluginResponse = await payloadWebhook({
          payloadToken: `${payloadToken}`,
          data: {
            type: 'plugin.update',
            data: {
              serverId: serviceDetails.id,
              plugins: pluginsResponse.plugins.map(plugin => ({
                name: plugin.name,
                status: plugin.status ? 'enabled' : 'disabled',
                version: plugin.version,
              })),
            },
          },
        })

        await pub.publish('refresh-channel', JSON.stringify({ refresh: true }))
      }

      ssh.dispose()
    } catch (error) {
      throw error // Re-throw to trigger the failed event
    }
  },
  {
    connection: queueConnection,
    // Add concurrency limit
    concurrency: 1,
  },
)

worker.on('completed', job => {})

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  const pluginDetails = job?.data?.pluginDetails
  console.log('Failed to toggle plugin', err)

  await pub.publish(
    'my-channel',
    `❌ failed to ${pluginDetails?.enabled ? 'enable' : 'disable'} ${pluginDetails?.name} plugin`,
  )
})

// Add more event handlers for better debugging
worker.on('error', err => {})

worker.on('active', job => {})
