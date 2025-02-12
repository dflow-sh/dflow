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

    console.log('from queue', job.id)

    debug(`starting deploy app queue for ${appId} app`)

    const branchName = branch ? branch : 'main'

    const ssh = await sshConnect()

    await dokku.git.sync({
      ssh,
      appName: appName,
      gitRepoUrl: `https://github.com/${repoOwner}/${repoName}.git`,
      branchName,
      options: {
        onStdout: async chunk => {
          await pub.publish('my-channel', chunk.toString())
          // console.log(chunk.toString())
        },
        onStderr: async chunk => {
          await pub.publish('my-channel', chunk.toString())
          // console.log(chunk.toString())
        },
      },
    })

    await dokku.letsencrypt.enable(ssh, appName, {
      onStdout: async chunk => {
        await pub.publish('my-channel', chunk.toString())
        console.info(chunk.toString())
      },
      onStderr: chunk => {
        console.info(chunk.toString())
      },
    })

    debug(
      `finishing create app ${appName} from https://github.com/${repoOwner}/${repoName}.git`,
    )

    // if (!res.stderr) {
    //   await pub.publish('my-channel', 'successfully created')
    //   console.log(' working')
    // } else if (res.stderr) {
    //   await pub.publish('my-channel', 'failed to create app')
    //   console.log('now working')
    // }

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
