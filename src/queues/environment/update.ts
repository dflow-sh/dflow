import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'
import { z } from 'zod'

import { createServiceSchema } from '@/actions/service/validator'
import { pub, queueConnection } from '@/lib/redis'

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
    environmentVariables: Record<string, string>
    noRestart: boolean
  }
}

const updateEnvironmentVariablesQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const { sshDetails, serviceDetails } = job.data

    console.log(
      `starting updateEnvironmentVariables queue database for service: ${serviceDetails.name}`,
    )

    const ssh = await dynamicSSH(sshDetails)

    const appResponse = await dokku.apps.list(ssh)

    if (appResponse.includes(serviceDetails.name)) {
      const envResponse = await dokku.config.set({
        ssh,
        name: serviceDetails.name,
        values: Object.entries(serviceDetails.environmentVariables).map(
          ([key, value]) => ({
            key,
            value: value as string,
          }),
        ),
        noRestart: serviceDetails.noRestart,
        options: {
          onStdout: async chunk => {
            await pub.publish('my-channel', chunk.toString())
            console.info(chunk.toString())
          },
          onStderr: async chunk => {
            await pub.publish('my-channel', chunk.toString())
            console.info(chunk.toString())
          },
        },
      })

      if (envResponse) {
        await pub.publish(
          'my-channel',
          `✅ Successfully updated environment variables for ${serviceDetails.name}`,
        )

        await pub.publish('my-channel', `Syncing details...`)
        await pub.publish('refresh-channel', JSON.stringify({ refresh: true }))
      } else {
        await pub.publish(
          'my-channel',
          `❌ Failed update environment variables for ${serviceDetails.name}`,
        )
      }
    } else {
      await pub.publish(
        'my-channel',
        `❌ Failed to update environment variables for ${serviceDetails.name}. App not found`,
      )
    }

    ssh.dispose()
  },
  { connection: queueConnection },
)

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  console.log('Failed to stop database', err)

  const serviceDetails = job?.data?.serviceDetails

  await pub.publish(
    'my-channel',
    `❌ Failed update environment variables for ${serviceDetails?.name}`,
  )
})

export const addUpdateEnvironmentVariablesQueue = async (data: QueueArgs) =>
  await updateEnvironmentVariablesQueue.add(queueName, data)
