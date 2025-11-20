import configPromise from '@payload-config'
import { Job } from 'bullmq'
import { getPayload } from 'payload'

import { getQueue, getWorker } from '@dflow/shared/bullmq'
import { jobOptions, pub, queueConnection } from '@dflow/shared/redis'
import { sendEvent } from '@dflow/shared/sendEvent'
import { deleteMachine } from '@dflow/shared/tailscale/deleteMachine'
import { waitForJobIdCompletion } from '@dflow/shared/utils/waitForJobCompletion'

interface QueueArgs {
  serverDetails: {
    id: string
    name: string
  }
  projectsQueueIDs: string[]
}

export const addDeleteMachineQueue = async (data: QueueArgs) => {
  const QUEUE_NAME = `server-${data.serverDetails.id}-tailscale-machine-delete`

  const deleteProjectQueue = getQueue({
    name: QUEUE_NAME,
    connection: queueConnection,
  })

  const worker = getWorker<QueueArgs>({
    name: QUEUE_NAME,
    processor: async job => {
      const { serverDetails, projectsQueueIDs } = job.data
      const payload = await getPayload({ config: configPromise })

      console.log('inside delete machine queue')

      try {
        sendEvent({
          pub,
          message: 'Starting delete machine process...',
          serverId: serverDetails.id,
        })

        await Promise.allSettled(
          projectsQueueIDs.map(id => {
            const projectDeleteQueue = getQueue({
              name: `server-${data.serverDetails.id}-project-delete`, // or whatever you used
              connection: queueConnection,
            })

            console.log({ projectDeleteQueue, id })

            return waitForJobIdCompletion(projectDeleteQueue, id)
          }),
        )

        const response = await deleteMachine({
          payload,
          serverId: serverDetails.id,
        })

        if (response?.success) {
          sendEvent({
            pub,
            message: `🌐 Removed ${serverDetails.name} server from network!`,
            serverId: serverDetails.id,
          })
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : ''
        throw new Error(`❌ Failed to delete machine: ${message}`)
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

  const id = `delete-machine:${new Date().getTime()}`

  return await deleteProjectQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
