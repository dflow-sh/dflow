import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import { Job } from 'bullmq'
import { NodeSSH } from 'node-ssh'
import { z } from 'zod'

import { createServiceSchema } from '@/actions/service/validator'
import { getQueue, getWorker } from '@/lib/bullmq'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendEvent } from '@/lib/sendEvent'

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
    ports: Array<string>
    previousPorts?: Array<string>
  }
  serverDetails: {
    id: string
  }
}

export const addExposeDatabasePortQueue = async (data: QueueArgs) => {
  const QUEUE_NAME = `server-${data.serverDetails.id}-expose-database`

  const exposeDatabasePortQueue = getQueue({
    name: QUEUE_NAME,
    connection: queueConnection,
  })

  const worker = getWorker<QueueArgs>({
    name: QUEUE_NAME,
    processor: async job => {
      const {
        databaseName,
        databaseType,
        sshDetails,
        serviceDetails,
        serverDetails,
      } = job.data
      let ssh: NodeSSH | null = null

      console.log(
        `starting exposeDatabasePort queue for ${databaseType} database called ${databaseName}`,
      )

      try {
        ssh = await dynamicSSH(sshDetails)
        console.log('previous port', serviceDetails.previousPorts)

        // If already ports exposed, un-exposing them before re-exposing new ports
        if (serviceDetails.previousPorts?.length) {
          sendEvent({
            pub,
            message: `Un-exposing previous ports ${serviceDetails.ports.join(
              ', ',
            )} of ${databaseName}-database`,
            serverId: serverDetails.id,
          })

          await dokku.database.unexpose({
            ssh,
            name: databaseName,
            databaseType,
            ports: serviceDetails.previousPorts,
            options: {
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
            },
          })

          sendEvent({
            pub,
            message: `✅ Successfully Un-exposed previous ports ${serviceDetails.ports.join(
              ', ',
            )} of ${databaseName}-database`,
            serverId: serverDetails.id,
          })
        }

        const res = await dokku.database.expose({
          ssh,
          name: databaseName,
          databaseType,
          ports: serviceDetails.ports,
          options: {
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
          },
        })

        if (res.code === 0) {
          sendEvent({
            pub,
            message: `✅ Successfully exposed ${databaseName} on port ${serviceDetails.ports.join(', ')}`,
            serverId: serverDetails.id,
          })
        }
      } catch (error) {
        let message = error instanceof Error ? error.message : ''
        throw new Error(
          `❌ Failed attaching ports ${databaseName}-database: ${message}`,
        )
      } finally {
        ssh?.dispose()
      }
    },
    connection: queueConnection,
  })

  worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
    if (job?.data) {
      sendEvent({
        pub,
        message: err.message,
        serverId: job.data.serverDetails.id,
      })
    }
  })

  const id = `expose-database-${data.databaseName}:${new Date().getTime()}`

  return exposeDatabasePortQueue.add(id, data, {
    ...jobOptions,
    jobId: id,
  })
}
