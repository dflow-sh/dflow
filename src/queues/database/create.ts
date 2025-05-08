import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import configPromise from '@payload-config'
import { Job, Queue, Worker } from 'bullmq'
import { NodeSSH } from 'node-ssh'
import { getPayload } from 'payload'
import { z } from 'zod'

import { createServiceSchema } from '@/actions/service/validator'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendEvent } from '@/lib/sendEvent'

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
    serverId: string
  }
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
    const payload = await getPayload({ config: configPromise })
    const { databaseName, databaseType, sshDetails, serviceDetails } = job.data
    const { id: serviceId, serverId, deploymentId } = serviceDetails
    let ssh: NodeSSH | null = null

    try {
      console.log(
        `starting createDatabase queue for ${databaseType} database called ${databaseName}`,
      )

      // updating the deployment status to building
      await payload.update({
        collection: 'deployments',
        id: serviceDetails.deploymentId,
        data: {
          status: 'building',
        },
      })
      await pub.publish('refresh-channel', JSON.stringify({ refresh: true }))

      ssh = await dynamicSSH(sshDetails)

      const res = await dokku.database.create(ssh, databaseName, databaseType, {
        onStdout: async chunk => {
          sendEvent({
            message: chunk.toString(),
            pub,
            serverId,
            serviceId,
            channelId: serviceDetails.deploymentId,
          })
        },
        onStderr: async chunk => {
          sendEvent({
            message: chunk.toString(),
            pub,
            serverId,
            serviceId,
            channelId: serviceDetails.deploymentId,
          })

          console.info({
            createDatabaseLogs: {
              message: chunk.toString(),
              type: 'stdout',
            },
          })
        },
      })

      sendEvent({
        message: `✅ Successfully created ${databaseName}-database, updated details...`,
        pub,
        serverId,
        serviceId,
      })

      sendEvent({
        message: `Syncing details...`,
        pub,
        serverId,
        serviceId,
      })

      const formattedData = parseDatabaseInfo({
        stdout: res.stdout,
        dbType: databaseType,
      })

      await payload.update({
        collection: 'services',
        id: serviceId,
        data: {
          databaseDetails: {
            ...formattedData,
          },
        },
      })

      const logs = await pub.lrange(deploymentId, 0, -1)

      await payload.update({
        collection: 'deployments',
        id: serviceDetails.deploymentId,
        data: {
          status: 'success',
          logs,
        },
      })
    } catch (error) {
      let message = error instanceof Error ? error.message : ''

      sendEvent({
        message,
        pub,
        serverId,
        serviceId,
        channelId: serviceDetails.deploymentId,
      })

      const logs = await pub.lrange(deploymentId, 0, -1)

      await payload.update({
        collection: 'deployments',
        id: serviceDetails.deploymentId,
        data: {
          status: 'failed',
          logs,
        },
      })

      throw new Error(`❌ Failed creating ${databaseName}-database: ${message}`)
    } finally {
      await pub.publish('refresh-channel', JSON.stringify({ refresh: true }))

      if (ssh) {
        ssh.dispose()
      }
    }
  },
  { connection: queueConnection },
)

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  console.log('Failed to deploy database', err)
})

export const addCreateDatabaseQueue = async (data: QueueArgs) => {
  const id = `create-database-${data.databaseName}-${data.databaseType}:${new Date().getTime()}`
  return await createDatabaseQueue.add(id, data, { ...jobOptions, jobId: id })
}
