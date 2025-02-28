import { dokku } from '../lib/dokku'
import { dynamicSSH } from '../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'
import { z } from 'zod'

import { createServiceSchema } from '@/actions/service/validator'
import { redis } from '@/lib/redis'
import { DatabaseUpdateSchemaType } from '@/payload/endpoints/validator'

const queueName = 'create-database'

export type DatabaseType = Exclude<
  z.infer<typeof createServiceSchema>['databaseType'],
  undefined
>

export type PayloadType = Extract<
  DatabaseUpdateSchemaType,
  { type: 'database.update' }
>

interface QueueArgs {
  databaseName: string
  databaseType: DatabaseType
  sshDetails: {
    privateKey: string
    host: string
    username: string
    port: number
  }
  serviceDetails: {
    id: string
  }
  payloadToken: string | undefined
}

// res: {
//   code: 0,
//   signal: null,
//   stdout: 'Waiting for container to be ready\n' +
//     '=====> MongoDB container created: create-new-mongo-database\n' +
//     '=====> create-new-mongo-database mongo service information\n' +
//     '       Config dir:          /var/lib/dokku/services/mongo/create-new-mongo-database/config\n' +
//     '       Config options:       --storageEngine wiredTiger --auth \n' +
//     '       Data dir:            /var/lib/dokku/services/mongo/create-new-mongo-database/data\n' +
//     '       Dsn:                 mongodb://create-new-mongo-database:5bc069f19fb08186d13c77518acbdc58@dokku-mongo-create-new-mongo-database:27017/create_new_mongo_database\n' +
//     '       Exposed ports:       -                        \n' +
//     '       Id:                  62f93e879a9868323a50d44284ece170bda93cf939b0552bacd5c845f0a95403\n' +
//     '       Internal ip:         172.17.0.17              \n' +
//     '       Initial network:                              \n' +
//     '       Links:               -                        \n' +
//     '       Post create network:                          \n' +
//     '       Post start network:                           \n' +
//     '       Service root:        /var/lib/dokku/services/mongo/create-new-mongo-database\n' +
//     '       Status:              running                  \n' +
//     '       Version:             mongo:8.0.4',
//   stderr: ''
// }

function parseDatabaseInfo({
  stdout,
  dbType,
}: {
  stdout: string
  dbType: DatabaseType
}) {
  const lines = stdout.split('\n').map(line => line.trim())
  const data: {
    type: DatabaseType
    connectionUrl?: string
    username?: string
    password?: string
    host?: string
    port?: string
    status?: 'running' | 'missing'
    version?: string
  } = { type: dbType }

  for (const line of lines) {
    if (line.startsWith('Dsn:')) {
      const dsn = line.split('Dsn:')[1].trim()
      data.connectionUrl = dsn

      switch (dbType) {
        case 'mongo': {
          const regex = /mongodb:\/\/(.*?):(.*?)@(.*?):(.*?)\/(.*)/
          const match = dsn.match(regex)
          if (match) {
            data.username = match[1]
            data.password = match[2]
            data.host = match[3]
            data.port = match[4]
          }
          break
        }

        case 'postgres': {
          const regex = /postgres:\/\/(.*?):(.*?)@(.*?):(.*?)\/(.*)/
          const match = dsn.match(regex)
          if (match) {
            data.username = match[1]
            data.password = match[2]
            data.host = match[3]
            data.port = match[4]
          }
          break
        }

        case 'mysql':
        case 'mariadb': {
          const regex = /mysql:\/\/(.*?):(.*?)@(.*?):(.*?)\/(.*)/
          const match = dsn.match(regex)
          if (match) {
            data.username = match[1]
            data.password = match[2]
            data.host = match[3]
            data.port = match[4]
          }
          break
        }

        case 'redis': {
          const regex = /redis:\/\/(.*?):(.*?)@(.*?):(.*)/
          const match = dsn.match(regex)
          if (match) {
            data.username = match[1]
            data.password = match[2]
            data.host = match[3]
            data.port = match[4]
          }
          break
        }

        default:
          console.warn('Unknown database type:', dbType)
      }
    } else if (line.startsWith('Status:')) {
      const status = line.split('Status:')[1].trim()
      if (status === 'running' || status === 'missing') {
        data.status = status
      }
    } else if (line.startsWith('Version:')) {
      data.version = line.split('Version:')[1].trim()
    }
  }

  return data
}

export const createDatabaseQueue = new Queue<QueueArgs>(queueName, {
  connection: redis,
})

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const {
      databaseName,
      databaseType,
      sshDetails,
      payloadToken,
      serviceDetails,
    } = job.data

    console.log(
      `starting createDatabase queue for ${databaseType} database called ${databaseName}`,
    )

    const ssh = await dynamicSSH(sshDetails)
    const res = await dokku.database.create(ssh, databaseName, databaseType, {
      onStdout: async chunk => {
        await redis.publish('my-channel', chunk.toString())
        // console.info(chunk.toString());
      },
      onStderr: async chunk => {
        await redis.publish('my-channel', chunk.toString())

        console.info({
          createDatabaseLogs: {
            message: chunk.toString(),
            type: 'stdout',
          },
        })
      },
    })

    const formattedData = parseDatabaseInfo({
      stdout: res.stdout,
      dbType: databaseType,
    })

    const data: PayloadType = {
      type: 'database.update',
      data: {
        serviceId: serviceDetails.id,
        ...formattedData,
      },
    }

    await fetch(
      `http://${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/databaseUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${payloadToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    )

    console.dir({ res }, { depth: Infinity })

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
  { connection: redis },
)

worker.on('failed', async (job: Job | undefined, err) => {
  const { databaseType, databaseName } = job?.data
  // sendLog('DATABASE_CREATED', {
  //   createDatabaseLogs: {
  //     message: 'Failed to create DB',
  //     type: 'end:failure',
  //   },
  // });
})
