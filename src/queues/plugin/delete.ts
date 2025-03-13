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
  pluginDetails: {
    name: string
  }
  serverDetails: {
    id: string
    previousPlugins: Server['plugins']
  }
  payloadToken: string | undefined
}

const queueName = 'delete-plugin'

export const deletePluginQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const { sshDetails, pluginDetails, serverDetails, payloadToken } = job.data
    const { previousPlugins = [] } = serverDetails

    try {
      const ssh = await dynamicSSH(sshDetails)

      const pluginUninstallationResponse = await dokku.plugin.uninstall(
        ssh,
        pluginDetails.name,
        {
          onStdout: async chunk => {
            await pub.publish('my-channel', chunk.toString())
          },
          onStderr: async chunk => {
            await pub.publish('my-channel', chunk.toString())
          },
        },
      )

      if (pluginUninstallationResponse.code === 0) {
        await pub.publish(
          'my-channel',
          `✅ Successfully uninstalled ${pluginDetails.name} plugin`,
        )

        await pub.publish('my-channel', `Syncing changes...`)

        const pluginsResponse = await dokku.plugin.list(ssh)

        console.dir({ pluginsResponse }, { depth: Infinity })

        // if previous-plugins are there then removing from previous else updating with server-response
        const filteredPlugins = previousPlugins
          ? previousPlugins.filter(plugin => plugin.name !== pluginDetails.name)
          : pluginsResponse.plugins.map(plugin => ({
              name: plugin.name,
              status: plugin.status
                ? ('enabled' as const)
                : ('disabled' as const),
              version: plugin.version,
            }))

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

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  console.log('Failed to uninstall plugin', err)

  await pub.publish('my-channel', '❌ failed to uninstall plugin')
})

export const addDeletePluginQueue = async (data: QueueArgs) => {
  const id = `delete-plugin${data.pluginDetails.name}:${new Date().getTime()}`

  return await deletePluginQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
