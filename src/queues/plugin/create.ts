import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'

import { payloadWebhook } from '@/lib/payloadWebhook'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
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
    url: string
    name: string
  }
  serverDetails: {
    id: string
    previousPlugins: Server['plugins']
  }
  payloadToken: string | undefined
}

const queueName = 'create-plugin'

export const createPluginQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const { sshDetails, pluginDetails, serverDetails, payloadToken } = job.data
    const { previousPlugins = [] } = serverDetails

    console.log('inside install plugin queue')

    try {
      const ssh = await dynamicSSH(sshDetails)

      const pluginInstallationResponse = await dokku.plugin.install(
        ssh,
        `${pluginDetails.url} ${pluginDetails.name}`,
        {
          onStdout: async chunk => {
            await pub.publish('my-channel', chunk.toString())
          },
          onStderr: async chunk => {
            await pub.publish('my-channel', chunk.toString())
          },
        },
      )

      if (pluginInstallationResponse.code === 0) {
        await pub.publish(
          'my-channel',
          `✅ Successfully installed ${pluginDetails.name} plugin`,
        )

        await pub.publish('my-channel', `Syncing changes...`)

        const pluginsResponse = await dokku.plugin.list(ssh)

        // if previous-plugins are there then removing from previous else updating with server-response
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

        console.dir(
          { filteredPlugins, previousPlugins, pluginsResponse },
          { depth: Infinity },
        )

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
  console.log('Failed to install plugin', err)

  await pub.publish('my-channel', '❌ failed to install plugin')
})

// Add more event handlers for better debugging
worker.on('error', err => {})

worker.on('active', job => {})

export const addCreatePluginQueue = async (data: QueueArgs) => {
  const id = `create-plugin-${data.pluginDetails.name}:${new Date().getTime()}`
  return await createPluginQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
