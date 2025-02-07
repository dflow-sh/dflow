import { dokku } from '../lib/dokku'
import { sshConnect } from '../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'
import createDebug from 'debug'
import Redis from 'ioredis'

import { pub } from '@/lib/redis'

const queueName = 'deploy-app'
const debug = createDebug(`queue:${queueName}`)

const redisClient = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})

interface QueueArgs {
  appId: string
  appName: string
  userName: string
  repoName: string
  branch?: string
}

export const deployAppQueue = new Queue<QueueArgs>(queueName, {
  connection: redisClient,
})

/**
 * - Create app
 */
const worker = new Worker(
  queueName,
  async job => {
    const { appId, appName, userName: repoOwner, repoName, branch } = job.data
    debug(`starting deploy app queue for ${appId} app`)

    const branchName = branch ? branch : 'main'
    const ssh = await sshConnect()

    try {
      // Enable Let's Encrypt
      const sslResult = await dokku.letsencrypt.enable(ssh, appName, {
        onStdout: async chunk => {
          const message = chunk.toString()
          await pub.publish('my-channel', `[SSL] ${message}`)
          debug(`[SSL][stdout] ${message}`)
        },
        onStderr: async chunk => {
          const message = chunk.toString()
          await pub.publish('my-channel', `[SSL Error] ${message}`)
          debug(`[SSL][stderr] ${message}`)
        },
      })

      if (sslResult.stderr) {
        throw new Error(`SSL setup failed: ${sslResult.stderr}`)
      }

      // Deploy application
      const deployResult = await dokku.git.sync({
        ssh,
        appName,
        gitRepoUrl: `https://github.com/${repoOwner}/${repoName}.git`,
        branchName,
        options: {
          onStdout: async chunk => {
            const message = chunk.toString()
            await pub.publish('my-channel', `[Deploy] ${message}`)
            debug(`[Deploy][stdout] ${message}`)
          },
          onStderr: async chunk => {
            const message = chunk.toString()
            await pub.publish('my-channel', `[Deploy Error] ${message}`)
            debug(`[Deploy][stderr] ${message}`)
          },
        },
      })

      if (deployResult.stderr) {
        throw new Error(`Deployment failed: ${deployResult.stderr}`)
      }

      await pub.publish('my-channel', `✅ App ${appName} deployed successfully`)
      debug(`App ${appName} deployed successfully`)
    } catch (error: unknown) {
      await pub.publish('my-channel', '❌ Deployment failed')
      debug('Deployment failed')
      throw error
    } finally {
      ssh.dispose()
    }
  },
  { connection: redisClient },
)

worker.on('failed', async (job: Job | undefined, err) => {
  const { appId } = job?.data
  debug(`${job?.id} has failed for for ${appId}   : ${err.message}`)
})
