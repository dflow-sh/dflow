import { dokku } from '../lib/dokku'
import { sshConnect } from '../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'
import createDebug from 'debug'
import Redis from 'ioredis'

import { pub } from '@/lib/redis'

const queueName = 'create-database'
const debug = createDebug(`queue:${queueName}`)

const redisClient = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})

interface QueueArgs {
  databaseName: string
  databaseType: string
  userId: string
}

export type DatabaseTypes = 'REDIS' | 'POSTGRESQL' | 'MONGODB' | 'MYSQL'
const dbTypeToDokkuPlugin = (dbType: DatabaseTypes): string => {
  switch (dbType) {
    case 'MONGODB':
      return 'mongo'
    case 'POSTGRESQL':
      return 'postgres'
    case 'REDIS':
      return 'redis'
    case 'MYSQL':
      return 'mysql'
  }
}

export const createDatabaseQueue = new Queue<QueueArgs>(queueName, {
  connection: redisClient,
})

const worker = new Worker(
  queueName,
  async job => {
    const { databaseName, databaseType, userId } = job.data

    const dbType = dbTypeToDokkuPlugin(databaseType)

    console.log(
      `starting createDatabase queue for ${dbType} database called ${databaseName}, with id ${userId}`,
    )

    debug(
      `starting createDatabase queue for ${dbType} database called ${databaseName} with id ${job.id}`,
    )

    // add record in db
    const ssh = await sshConnect()
    const res = await dokku.database.create(ssh, databaseName, dbType, {
      onStdout: async chunk => {
        await pub.publish('my-channel', chunk.toString())
        // console.info(chunk.toString());
      },
      onStderr: chunk => {
        console.info({
          createDatabaseLogs: {
            message: chunk.toString(),
            type: 'stdout',
          },
        })
      },
    })

    debug(
      `finishing createDatabase queue for ${dbType} database called ${databaseName}`,
    )
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
  const { databaseType, databaseName } = job?.data
  // sendLog('DATABASE_CREATED', {
  //   createDatabaseLogs: {
  //     message: 'Failed to create DB',
  //     type: 'end:failure',
  //   },
  // });
  debug(
    `${job?.id} has failed for for ${databaseType} database ${databaseName}  : ${err.message}`,
  )
})
