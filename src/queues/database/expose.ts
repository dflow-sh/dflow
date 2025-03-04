import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'
import { z } from 'zod'

import { createServiceSchema } from '@/actions/service/validator'
import { pub, queueConnection } from '@/lib/redis'

const queueName = 'expose-database'

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
    ports: Array<string>
    previousPorts?: Array<string>
  }
}

export const exposeDatabasePortQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const { databaseName, databaseType, sshDetails, serviceDetails } = job.data

    console.log(
      `starting exposeDatabasePort queue for ${databaseType} database called ${databaseName}`,
    )

    const ssh = await dynamicSSH(sshDetails)

    console.log('previous port', serviceDetails.previousPorts)

    // If already ports exposed, un-exposing them before re-exposing new ports
    if (serviceDetails.previousPorts?.length) {
      await pub.publish(
        'my-channel',
        `Un-exposing previous ports ${serviceDetails.ports.join(
          ', ',
        )} of ${databaseName}-database`,
      )

      await dokku.database.unexpose({
        ssh,
        name: databaseName,
        databaseType,
        ports: serviceDetails.previousPorts,
        options: {
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
      })

      await pub.publish(
        'my-channel',
        `✅ Successfully Un-exposed previous ports ${serviceDetails.ports.join(
          ', ',
        )} of ${databaseName}-database`,
      )
    }

    const res = await dokku.database.expose({
      ssh,
      name: databaseName,
      databaseType,
      ports: serviceDetails.ports,
      options: {
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
    })

    if (res.code === 0) {
      await pub.publish(
        'my-channel',
        `✅ Successfully exposed ${databaseName} on port ${serviceDetails.ports.join(
          ', ',
        )}`,
      )
    }

    ssh.dispose()
  },
  { connection: queueConnection },
)

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  console.log('Failed to expose ports', err)

  const databaseDetails = job?.data

  await pub.publish(
    'my-channel',
    `❌ Failed attaching ports ${databaseDetails?.databaseName}-database`,
  )
})

export const addExposeDatabasePortQueue = async (data: QueueArgs) =>
  exposeDatabasePortQueue.add(queueName, data)
