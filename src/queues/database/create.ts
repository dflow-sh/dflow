import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'
import { z } from 'zod'

import { createServiceSchema } from '@/actions/service/validator'
import { payloadWebhook } from '@/lib/payloadWebhook'
import { jobOptions, pub, queueConnection } from '@/lib/redis'

const queueName = 'create-database'

export type DatabaseType = Exclude<
  z.infer<typeof createServiceSchema>['databaseType'],
  undefined
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
    deploymentId: string
  }
  payloadToken: string | undefined
}

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
    status?: 'running' | 'missing' | 'exited'
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
      if (status === 'running' || status === 'missing' || status === 'exited') {
        data.status = status
      }
    } else if (line.startsWith('Version:')) {
      data.version = line.split('Version:')[1].trim()
    }
  }

  return data
}

export const createDatabaseQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
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

    console.dir(
      {
        databaseName,
        databaseType,
        sshDetails,
        payloadToken,
        serviceDetails,
      },
      { depth: Infinity },
    )

    console.log(
      `starting createDatabase queue for ${databaseType} database called ${databaseName}`,
    )

    const ssh = await dynamicSSH(sshDetails)
    const res = await dokku.database.create(ssh, databaseName, databaseType, {
      onStdout: async chunk => {
        await pub.publish('my-channel', chunk.toString())
        // console.info(chunk.toString());
      },
      onStderr: async chunk => {
        await pub.publish('my-channel', chunk.toString())

        console.info({
          createDatabaseLogs: {
            message: chunk.toString(),
            type: 'stdout',
          },
        })
      },
    })

    await pub.publish(
      'my-channel',
      `✅ Successfully created ${databaseName}-database, updated details...`,
    )

    await pub.publish('my-channel', `Syncing details...`)

    const formattedData = parseDatabaseInfo({
      stdout: res.stdout,
      dbType: databaseType,
    })

    try {
      const webhookResponse = await payloadWebhook({
        payloadToken: `${payloadToken}`,
        data: {
          type: 'database.update',
          data: {
            serviceId: serviceDetails.id,
            ...formattedData,
          },
        },
      })

      const deploymentResponse = await payloadWebhook({
        payloadToken: `${payloadToken}`,
        data: {
          type: 'deployment.update',
          data: {
            deployment: {
              id: serviceDetails.deploymentId,
              status: 'success',
            },
          },
        },
      })

      console.log({ webhookResponse, deploymentResponse })
    } catch (error) {
      console.log('Webhook Error: ', error)
    }

    const publishedResponse = await pub.publish(
      'refresh-channel',
      JSON.stringify({ refresh: true }),
    )

    console.dir({ res, publishedResponse }, { depth: Infinity })

    ssh.dispose()
  },
  { connection: queueConnection },
)

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  const databaseDetails = job?.data

  await pub.publish(
    'my-channel',
    `❌ Failed creating ${databaseDetails?.databaseName}-database`,
  )

  // sendLog('DATABASE_CREATED', {
  //   createDatabaseLogs: {
  //     message: 'Failed to create DB',
  //     type: 'end:failure',
  //   },
  // });
})

export const addCreateDatabaseQueue = async (data: QueueArgs) => {
  const id = `create-database-${data.databaseName}-${data.databaseType}:${new Date().getTime()}`
  return await createDatabaseQueue.add(id, data, { ...jobOptions, jobId: id })
}
