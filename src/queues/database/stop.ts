import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'
import { z } from 'zod'

import { createServiceSchema } from '@/actions/service/validator'
import { payloadWebhook } from '@/lib/payloadWebhook'
import { pub, queueConnection } from '@/lib/redis'
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
    } = job.data

    console.log(
      `starting stopDatabase queue for ${databaseType} database called ${databaseName}`,
    )

    const ssh = await dynamicSSH(sshDetails)
    const res = await dokku.database.stop(ssh, databaseName, databaseType, {
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

    const databaseInfoResponse = await dokku.database.info(
      ssh,
      databaseName,
      databaseType,
    )

    await pub.publish(
      'my-channel',
      `✅ Successfully stopped ${databaseName}-database, updated details...`,
    )

    await pub.publish('my-channel', `Syncing details...`)

    const formattedData = parseDatabaseInfo({
      stdout: databaseInfoResponse.stdout,
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

      console.log({ webhookResponse })
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
  console.log('Failed to stop database', err)

  const databaseDetails = job?.data

  await pub.publish(
    'my-channel',
    `❌ Failed stop ${databaseDetails?.databaseName}-database`,
  )
})

export const addStopDatabaseQueue = async (data: QueueArgs) =>
  await stopDatabaseQueue.add(queueName, data)
