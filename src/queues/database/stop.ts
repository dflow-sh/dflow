import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'
import { NodeSSH } from 'node-ssh'
import { z } from 'zod'

import { createServiceSchema } from '@/actions/service/validator'
import { payloadWebhook } from '@/lib/payloadWebhook'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendEvent } from '@/lib/sendEvent'
import { parseDatabaseInfo } from '@/lib/utils'

const queueName = 'stop-database'

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
  }
  serverDetails: {
    id: string
  }
  payloadToken: string | undefined
}

const stopDatabaseQueue = new Queue<QueueArgs>(queueName, {
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
      serverDetails,
    } = job.data

    let ssh: NodeSSH | null = null

    console.log(
      `starting stopDatabase queue for ${databaseType} database called ${databaseName}`,
    )

    try {
      ssh = await dynamicSSH(sshDetails)
      await dokku.database.stop(ssh, databaseName, databaseType, {
        onStdout: async chunk => {
          sendEvent({
            pub,
            message: chunk.toString(),
            serverId: serverDetails.id,
          })
        },
        onStderr: async chunk => {
          sendEvent({
            pub,
            message: chunk.toString(),
            serverId: serverDetails.id,
          })
        },
      })

      const databaseInfoResponse = await dokku.database.info(
        ssh,
        databaseName,
        databaseType,
      )

      sendEvent({
        pub,
        message: `✅ Successfully stopped ${databaseName}-database`,
        serverId: serverDetails.id,
      })

      sendEvent({
        pub,
        message: `Syncing details...`,
        serverId: serverDetails.id,
      })

      const formattedData = parseDatabaseInfo({
        stdout: databaseInfoResponse.stdout,
        dbType: databaseType,
      })

      await payloadWebhook({
        payloadToken: `${payloadToken}`,
        data: {
          type: 'database.update',
          data: {
            serviceId: serviceDetails.id,
            ...formattedData,
          },
        },
      })

      await pub.publish('refresh-channel', JSON.stringify({ refresh: true }))
    } catch (error) {
      let message = error instanceof Error ? error.message : ''
      throw new Error(`❌ Failed stop ${databaseName}-database: ${message}`)
    } finally {
      ssh?.dispose()
    }
  },
  { connection: queueConnection },
)

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  console.log('Failed to stop database', err)

  if (job?.data) {
    sendEvent({
      pub,
      message: err.message,
      serverId: job.data.serverDetails.id,
    })
  }
})

export const addStopDatabaseQueue = async (data: QueueArgs) => {
  const id = `stop-${data.databaseName}:${new Date().getTime()}`
  return await stopDatabaseQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
