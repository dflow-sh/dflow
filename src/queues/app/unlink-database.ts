import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import configPromise from '@payload-config'
import { Job, Queue, Worker } from 'bullmq'
import { NodeSSH } from 'node-ssh'
import { getPayload } from 'payload'

import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendEvent } from '@/lib/sendEvent'

const queueName = 'unlink-database'

interface QueueArgs {
  sshDetails: {
    privateKey: string
    host: string
    username: string
    port: number
  }
  serviceDetails: {
    id: string
    name: string
    environmentVariableName: string
  }
  databaseDetails: {
    name: string
    type: string
  }
  serverDetails: {
    id: string
  }
}

const unlinkDatabaseQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const { sshDetails, serviceDetails, databaseDetails, serverDetails } =
      job.data

    let ssh: NodeSSH | null = null

    console.log(`starting database-unlinking queue for ${serviceDetails.name}`)

    try {
      ssh = await dynamicSSH(sshDetails)
      const payload = await getPayload({ config: configPromise })

      sendEvent({
        message: `Starting unlinking database to ${serviceDetails.name}`,
        pub,
        serverId: serverDetails.id,
      })

      // 1. unlink database to app
      const databaseUnlinkResponse = await dokku.database.unlink({
        ssh,
        databaseName: databaseDetails.name,
        databaseType: databaseDetails.type,
        appName: serviceDetails.name,
        options: {
          onStdout: async chunk => {
            sendEvent({
              message: chunk.toString(),
              pub,
              serverId: serverDetails.id,
            })
          },
          onStderr: async chunk => {
            sendEvent({
              message: chunk.toString(),
              pub,
              serverId: serverDetails.id,
            })
          },
        },
      })

      if (databaseUnlinkResponse.code === 0) {
        sendEvent({
          message: `✅ Successfully unlinked database from ${serviceDetails.name}-app, updating environment variables...`,
          pub,
          serverId: serverDetails.id,
        })

        // 2. unset the environment variable for the app
        const envResponse = await dokku.config.unset({
          ssh,
          name: serviceDetails.name,
          keys: [serviceDetails.environmentVariableName],
          options: {
            onStdout: async chunk => {
              sendEvent({
                message: chunk.toString(),
                pub,
                serverId: serverDetails.id,
              })
            },
            onStderr: async chunk => {
              sendEvent({
                message: chunk.toString(),
                pub,
                serverId: serverDetails.id,
              })
            },
          },
        })

        if (envResponse.code === 0) {
          //   3. getting the previous service details
          const previousServiceDetails = await payload.findByID({
            collection: 'services',
            id: serviceDetails.id,
          })

          const environmentVariables =
            typeof previousServiceDetails?.environmentVariables === 'object' &&
            !Array.isArray(previousServiceDetails?.environmentVariables)
              ? previousServiceDetails.environmentVariables
              : null

          //   4. Removing the environment variable after unsetting it
          if (environmentVariables) {
            delete environmentVariables[serviceDetails.environmentVariableName]
          }

          //   4. set the environment variable for the database
          await payload.update({
            collection: 'services',
            id: serviceDetails.id,
            data: {
              environmentVariables,
            },
          })

          sendEvent({
            message: `✅ Successfully updated environment variables for ${serviceDetails.name}`,
            pub,
            serverId: serverDetails.id,
          })
        }
      } else {
        sendEvent({
          message: `❌ Failed to unlink database to ${serviceDetails.name}`,
          pub,
          serverId: serverDetails.id,
        })
      }

      await pub.publish('refresh-channel', JSON.stringify({ refresh: true }))
    } catch (error) {
      let message = error instanceof Error ? error.message : ''
      throw new Error(`❌ Failed to unlink database: ${message}`)
    } finally {
      if (ssh) {
        ssh.dispose()
      }
    }
  },
  { connection: queueConnection },
)

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  console.log('Failed to unlink database', err)
})

export const addUnlinkDatabaseQueueQueue = async (data: QueueArgs) => {
  const id = `unlink-database-${data.serviceDetails.name}:${new Date().getTime()}`

  return await unlinkDatabaseQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
