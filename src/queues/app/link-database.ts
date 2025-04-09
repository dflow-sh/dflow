import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import configPromise from '@payload-config'
import { Job, Queue, Worker } from 'bullmq'
import { NodeSSH } from 'node-ssh'
import { getPayload } from 'payload'

import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendEvent } from '@/lib/sendEvent'

const queueName = 'link-database'

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

const linkDatabaseQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const { sshDetails, serviceDetails, databaseDetails, serverDetails } =
      job.data

    let ssh: NodeSSH | null = null
    const formattedDatabaseName = `${databaseDetails.name}-db`

    console.log(`starting deletingApplication queue for ${serviceDetails.name}`)

    try {
      ssh = await dynamicSSH(sshDetails)
      const payload = await getPayload({ config: configPromise })

      //   converting 'mongo-database-db' to 'MONGO_DATABASE_DB'
      const envAlias = formattedDatabaseName
        .replace(/-([a-z])/g, (_, char) => '_' + char.toUpperCase())
        .toUpperCase()

      sendEvent({
        message: `Starting linking database to ${serviceDetails.name}`,
        pub,
        serverId: serverDetails.id,
      })

      // 1. link database to app
      const databaseLinkResponse = await dokku.database.link({
        ssh,
        databaseName: databaseDetails.name,
        databaseType: databaseDetails.type,
        appName: serviceDetails.name,
        alias: envAlias,
        noRestart: true,
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

      if (databaseLinkResponse.code === 0) {
        sendEvent({
          message: `✅ Successfully linked database to ${serviceDetails.name}-app, updating environment variables...`,
          pub,
          serverId: serverDetails.id,
        })

        // 2. set the environment variable for the app
        const envResponse = await dokku.config.set({
          ssh,
          name: serviceDetails.name,
          values: [
            {
              key: serviceDetails.environmentVariableName,
              value: `$(dokku config:get ${serviceDetails.name} ${envAlias}_URL)`,
            },
          ],
          noRestart: true,
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

        if (envResponse) {
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

          const variable = databaseLinkResponse.stdout
            ?.split('\n')?.[1]
            ?.split(': ')?.[1]
            ?.trim()

          //   4. set the environment variable for the database
          await payload.update({
            collection: 'services',
            id: serviceDetails.id,
            data: {
              environmentVariables: {
                ...environmentVariables,
                [serviceDetails.environmentVariableName]: {
                  type: 'reference',
                  value: variable,
                  linkedService: databaseDetails.name,
                  dokkuAlias: envAlias,
                },
              },
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
          message: `❌ Failed to link database to ${serviceDetails.name}`,
          pub,
          serverId: serverDetails.id,
        })
      }

      await pub.publish('refresh-channel', JSON.stringify({ refresh: true }))
    } catch (error) {
      let message = error instanceof Error ? error.message : ''
      console.log('Error in deletingApplication queue', message)
    } finally {
      if (ssh) {
        ssh.dispose()
      }
    }
  },
  { connection: queueConnection },
)

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  console.log('Failed to link database', err)

  //   const serverDetails = job?.data?.serverDetails

  //   if (serverDetails) {
  //     sendEvent({
  //       pub,
  //       message: err.message,
  //       serverId: serverDetails.id,
  //     })
  //   }
})

export const addLinkDatabaseQueueQueue = async (data: QueueArgs) => {
  const id = `link-database-${data.serviceDetails.name}:${new Date().getTime()}`

  return await linkDatabaseQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
