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
  userName: string
  repoName: string
  branch?: string
  // token: string
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
    const { appId, userName: repoOwner, repoName, branch } = job.data

    console.log('from queue', job.id)

    debug(`starting deploy app queue for ${appId} app`)

    const app = {
      name: 'test',
    }

    const branchName = branch ? branch : 'main'

    const ssh = await sshConnect()

    const res = await dokku.git.sync({
      ssh,
      appName: app.name,
      gitRepoUrl: `https://github.com/${repoOwner}/${repoName}.git`,
      branchName,
      options: {
        onStdout: async chunk => {
          await pub.publish('my-channel', chunk.toString())
          console.log('working')
        },
        onStderr: async chunk => {
          await pub.publish('my-channel', chunk.toString())
          console.log('now working')
        },
      },
    })
    debug(
      `finishing create app ${app.name} from https://github.com/${repoOwner}/${repoName}.git`,
    )
    if (!res.stderr) {
      await pub.publish('my-channel', 'successfully created')
      console.log(' working')
    } else if (res.stderr) {
      await pub.publish('my-channel', 'failed to create app')
      console.log('now working')
    }

    ssh.dispose()
  },
  { connection: redisClient },
)

worker.on('failed', async (job: Job | undefined, err) => {
  const { appId } = job?.data
  await pub.publish('my-channel', 'failed to create app')
  console.log('now working')
  debug(`${job?.id} has failed for for ${appId}   : ${err.message}`)
})
