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

const queueName = 'restart-database'

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
  payloadToken: string | undefined
  serverDetails: {
    id: string
  }
}

const restartDatabaseQueue = new Queue<QueueArgs>(queueName, {
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
      `starting restartDatabase queue for ${databaseType} database called ${databaseName}`,
    )

    try {
      ssh = await dynamicSSH(sshDetails)
      const res = await dokku.database.restart(
        ssh,
        databaseName,
        databaseType,
        {
          onStdout: async chunk => {
            await sendEvent({
              pub,
              message: chunk.toString(),
              serverId: serverDetails.id,
            })
          },
          onStderr: async chunk => {
            await sendEvent({
              pub,
              message: chunk.toString(),
              serverId: serverDetails.id,
            })

            console.info({
              createDatabaseLogs: {
                message: chunk.toString(),
                type: 'stdout',
              },
            })
          },
        },
      )

      await sendEvent({
        pub,
        message: `✅ Successfully restarted ${databaseName}-database`,
        serverId: serverDetails.id,
      })

      await sendEvent({
        pub,
        message: `Syncing details...`,
        serverId: serverDetails.id,
      })

      const formattedData = parseDatabaseInfo({
        stdout: res.stdout,
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
      throw new Error(
        `❌ Failed restarting ${databaseName}-database: ${message}`,
      )
    } finally {
      if (ssh) {
        ssh.dispose()
      }
    }
  },
  { connection: queueConnection },
)

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  console.log('Failed to restart database', err)

  if (job?.data) {
    await sendEvent({
      pub,
      message: err.message,
      serverId: job.data.serverDetails.id,
    })
  }
})

export const addRestartDatabaseQueue = async (data: QueueArgs) => {
  const id = `restart-${data.databaseName}:${new Date().getTime()}`

  return await restartDatabaseQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
