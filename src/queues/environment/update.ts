import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'
import { NodeSSH } from 'node-ssh'
import { z } from 'zod'

import { createServiceSchema } from '@/actions/service/validator'
import { pub, queueConnection } from '@/lib/redis'
import { sendEvent } from '@/lib/sendEvent'

const queueName = 'update-environment-variables'

export type DatabaseType = Exclude<
  z.infer<typeof createServiceSchema>['databaseType'],
  undefined
>

interface QueueArgs {
  sshDetails: {
    privateKey: string
    host: string
    username: string
    port: number
  }
  serviceDetails: {
    name: string
    environmentVariables: Record<string, unknown>
    noRestart: boolean
  }
  serverDetails: {
    id: string
  }
}

const updateEnvironmentVariablesQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const { sshDetails, serviceDetails, serverDetails } = job.data
    let ssh: NodeSSH | null = null

    console.log(
      `starting updateEnvironmentVariables queue database for service: ${serviceDetails.name}`,
    )

    try {
      ssh = await dynamicSSH(sshDetails)

      const appResponse = await dokku.apps.list(ssh)

      if (appResponse.includes(serviceDetails.name)) {
        const envResponse = await dokku.config.set({
          ssh,
          name: serviceDetails.name,
          values: Object.entries(serviceDetails.environmentVariables).map(
            ([key, value]) => {
              const formattedValue =
                value && typeof value === 'object' && 'value' in value
                  ? value.value
                  : value
              return {
                key,
                value: `${formattedValue}`,
              }
            },
          ),
          noRestart: serviceDetails.noRestart,
          options: {
            onStdout: async chunk => {
              console.info(chunk.toString())
              sendEvent({
                pub,
                message: chunk.toString(),
                serverId: serverDetails.id,
              })
            },
            onStderr: async chunk => {
              console.info(chunk.toString())
              sendEvent({
                pub,
                message: chunk.toString(),
                serverId: serverDetails.id,
              })
            },
          },
        })

        if (envResponse) {
          sendEvent({
            pub,
            message: `✅ Successfully updated environment variables for ${serviceDetails.name}`,
            serverId: serverDetails.id,
          })

          sendEvent({
            pub,
            message: `Syncing details...`,
            serverId: serverDetails.id,
          })

          await pub.publish(
            'refresh-channel',
            JSON.stringify({ refresh: true }),
          )
        } else {
          sendEvent({
            pub,
            message: `❌ Failed update environment variables for ${serviceDetails.name}`,
            serverId: serverDetails.id,
          })
        }
      } else {
        sendEvent({
          pub,
          message: `❌ Failed to update environment variables for ${serviceDetails.name}. App not found`,
          serverId: serverDetails.id,
        })
      }
    } catch (error) {
      let message = error instanceof Error ? error.message : ''
      throw new Error(
        `❌ Failed update environment variables for ${serviceDetails?.name}: ${message}`,
      )
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

export const addUpdateEnvironmentVariablesQueue = async (data: QueueArgs) =>
  await updateEnvironmentVariablesQueue.add(queueName, data)
