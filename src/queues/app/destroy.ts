import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'
import { NodeSSH } from 'node-ssh'

import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendEvent } from '@/lib/sendEvent'

const queueName = 'destroy-application'

interface QueueArgs {
  sshDetails: {
    privateKey: string
    host: string
    username: string
    port: number
  }
  serviceDetails: {
    name: string
  }
  serverDetails: {
    id: string
  }
}

const destroyApplicationQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const { sshDetails, serviceDetails, serverDetails } = job.data
    let ssh: NodeSSH | null = null

    console.log(`starting deletingApplication queue for ${serviceDetails.name}`)

    try {
      ssh = await dynamicSSH(sshDetails)

      const deletedResponse = await dokku.apps.destroy(
        ssh,
        serviceDetails.name,
        {
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

            console.info({
              deleteApplicationLogs: {
                message: chunk.toString(),
                type: 'stdout',
              },
            })
          },
        },
      )

      if (deletedResponse) {
        sendEvent({
          pub,
          message: `✅ Successfully deleted ${serviceDetails.name}`,
          serverId: serverDetails.id,
        })
      }
    } catch (error) {
      let message = error instanceof Error ? error.message : ''
      throw new Error(`❌ Failed deleting ${serviceDetails?.name}: ${message}`)
    } finally {
      if (ssh) {
        ssh.dispose()
      }
    }
  },
  { connection: queueConnection },
)

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  console.log('Failed to delete app', err)

  const serverDetails = job?.data?.serverDetails

  if (serverDetails) {
    sendEvent({
      pub,
      message: err.message,
      serverId: serverDetails.id,
    })
  }
})

export const addDestroyApplicationQueue = async (data: QueueArgs) => {
  const id = `destroy-app-${data.serviceDetails.name}:${new Date().getTime()}`
  return await destroyApplicationQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
