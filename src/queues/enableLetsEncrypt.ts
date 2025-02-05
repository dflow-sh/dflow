import { dokku } from '../lib/dokku'
import { sshConnect } from '../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'
import createDebug from 'debug'
import Redis from 'ioredis'

const queueName = 'enable-letsencrypt'
const debug = createDebug(`queue:${queueName}`)

const redisClient = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})

interface QueueArgs {
  appName: string
}

export const enableLetsEncryptQueue = new Queue<QueueArgs>(queueName, {
  connection: redisClient,
})

const worker = new Worker(
  queueName,
  async job => {
    const { appName } = job.data

    console.log(`starting letsencrypt queue for ${appName} `)

    debug(`starting letsencrypt queue for ${appName} `)

    // add record in db
    const ssh = await sshConnect()
    const res = await dokku.letsencrypt.enable(ssh, appName, {
      onStdout: async chunk => {
        // await pub.publish('my-channel', chunk.toString())
        console.info(chunk.toString())
      },
      onStderr: chunk => {
        console.info(chunk.toString())
      },
    })

    debug(`finishing letsencrypt queue for ${appName}`)
    if (!res.stderr) {
      // sendLog(job.id, {
      //   createDatabaseLogs: {
      //     // message: createdDb.id,
      //     message: '12345',
      //     type: 'end:success',
      //   },
      // });
    } else if (res.stderr) {
      // sendLog('DATABASE_CREATED', {
      //   createDatabaseLogs: {
      //     message: 'Failed to create db',
      //     type: 'end:failure',
      //   },
      // });
    }
    ssh.dispose()
  },
  { connection: redisClient },
)

worker.on('failed', async (job: Job | undefined, err) => {
  const { appName } = job?.data
  // sendLog('DATABASE_CREATED', {
  //   createDatabaseLogs: {
  //     message: 'Failed to create DB',
  //     type: 'end:failure',
  //   },
  // });
  debug(
    `${job?.id} has failed for for enabling lets encrypt for ${appName}  : ${err.message}`,
  )
})
