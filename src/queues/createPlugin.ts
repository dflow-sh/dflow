import { dokku } from '../lib/dokku'
import { dynamicSSH } from '../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'
import createDebug from 'debug'
import Redis from 'ioredis'
import { revalidatePath } from 'next/cache'

import { pub } from '@/lib/redis'

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
  }
}

const queueName = 'create-plugin'
const debug = createDebug(`queue:${queueName}`)

// Enable debug logging
debug.enabled = true

const redisClient = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})

export const createPluginQueue = new Queue<QueueArgs>(queueName, {
  connection: redisClient,
})

console.log('Worker is running...')

// Prevent multiple worker instances during development
let worker: Worker | null = null

if (!worker) {
  console.log('Initializing worker...')

  worker = new Worker<QueueArgs>(
    queueName,
    async job => {
      debug(`Processing job: ${job.id}`)

      const { sshDetails, pluginDetails, serverDetails } = job.data
      debug('Job data:', job.data)

      try {
        const ssh = await dynamicSSH(sshDetails)
        debug('SSH connection established')

        const pluginInstallationResponse = await dokku.plugin.install(
          ssh,
          `${pluginDetails.url} ${pluginDetails.name}`,
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

        debug('Plugin installation response:', pluginInstallationResponse)

        if (pluginInstallationResponse.code === 0) {
          const pluginsResponse = await dokku.plugin.list(ssh)
          debug('Plugins response:', pluginsResponse)

          revalidatePath(`/settings/servers/${serverDetails.id}/general`)
        }

        ssh.dispose()
      } catch (error) {
        debug('Error processing job:', error)
        throw error // Re-throw to trigger the failed event
      }
    },
    {
      connection: redisClient,
      // Add concurrency limit
      concurrency: 1,
    },
  )

  worker.on('completed', job => {
    debug(`Job ${job.id} completed successfully`)
  })

  worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
    debug(`Job ${job?.id} failed:`, err)
    await pub.publish('my-channel', '❌ failed to install plugin')

    if (job?.data) {
      const { pluginDetails } = job.data
      debug(`${job?.id} has failed installing ${pluginDetails.url}`)
    }
  })

  // Add more event handlers for better debugging
  worker.on('error', err => {
    debug('Worker error:', err)
  })

  worker.on('active', job => {
    debug(`Job ${job.id} has started`)
  })
}

// Cleanup on process exit
process.on('SIGTERM', async () => {
  await worker?.close()
})
