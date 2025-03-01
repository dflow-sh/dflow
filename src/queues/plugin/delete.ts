import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'
import createDebug from 'debug'

import { pub, queueConnection } from '@/lib/redis'

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
  }
}

const queueName = 'delete-plugin'
const debug = createDebug(`queue:${queueName}`)

// Enable debug logging
debug.enabled = true

export const deletePluginQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    debug(`Processing job: ${job.id}`)

    const { sshDetails, pluginDetails, serverDetails } = job.data
    debug(`Job data: ${JSON.stringify(job.data)}`)

    try {
      const ssh = await dynamicSSH(sshDetails)
      debug('SSH connection established')

      const pluginUninstallationResponse = await dokku.plugin.uninstall(
        ssh,
        pluginDetails.name,
        {
          onStdout: async chunk => {
            debug('stdout:', chunk.toString())
            await pub.publish('my-channel', chunk.toString())
          },
          onStderr: async chunk => {
            debug('stderr:', chunk.toString())
            await pub.publish('my-channel', chunk.toString())
          },
        },
      )

      debug('Plugin uninstallation response:', pluginUninstallationResponse)

      if (pluginUninstallationResponse.code === 0) {
        await pub.publish(
          'my-channel',
          `✅ Successfully uninstalled ${pluginDetails.name} plugin`,
        )
      }

      ssh.dispose()
    } catch (error) {
      debug('Error processing job:', error)
      throw error // Re-throw to trigger the failed event
    }
  },
  {
    connection: queueConnection,
    // Add concurrency limit
    concurrency: 1,
  },
)

worker.on('completed', job => {
  debug(`Job ${job.id} completed successfully`)
})

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  debug(`Job ${job?.id} failed:`, err)
  await pub.publish('my-channel', '❌ failed to uninstall plugin')

  if (job?.data) {
    const { pluginDetails } = job.data
    debug(`${job?.id} has failed uninstalling ${pluginDetails.name}`)
  }
})

// Add more event handlers for better debugging
worker.on('error', err => {
  debug('Worker error:', err)
})

worker.on('active', job => {
  debug(`Job ${job.id} has started`)
})
