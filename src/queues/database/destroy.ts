import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'
import { z } from 'zod'

import { createServiceSchema } from '@/actions/service/validator'
import { jobOptions, pub, queueConnection } from '@/lib/redis'

const queueName = 'destroy-database'

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
}

const destroyDatabaseQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const { databaseName, databaseType, sshDetails } = job.data

    console.log(
      `starting deletingDatabase queue for ${databaseType} database called ${databaseName}`,
    )

    const ssh = await dynamicSSH(sshDetails)
    const deletedResponse = await dokku.database.destroy(
      ssh,
      databaseName,
      databaseType,
      {
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
      },
    )

    if (deletedResponse) {
      await pub.publish(
        'my-channel',
        `✅ Successfully deleted ${databaseName}-database`,
      )
    }

    ssh.dispose()
  },
  { connection: queueConnection },
)

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  console.log('Failed to delete database', err)

  const databaseDetails = job?.data

  await pub.publish(
    'my-channel',
    `❌ Failed deleting ${databaseDetails?.databaseName}-database`,
  )
})

export const addDestroyDatabaseQueue = async (data: QueueArgs) => {
  const id = `destroy-app-${data.databaseName}:${new Date().getTime()}`
  return await destroyDatabaseQueue.add(id, data, {
    ...jobOptions,
    jobId: id,
  })
}
