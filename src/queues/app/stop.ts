import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'
import { NodeSSH } from 'node-ssh'

import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendEvent } from '@/lib/sendEvent'

const queueName = 'stop-app'

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
  }
  serverDetails: {
    id: string
  }
}

const stopAppQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const { sshDetails, serviceDetails, serverDetails } = job.data

    let ssh: NodeSSH | null = null

    console.log(`starting stopApp queue for ${serviceDetails.name}`)

    try {
      ssh = await dynamicSSH(sshDetails)
      await dokku.process.stop(ssh, serviceDetails.name, {
        onStdout: async chunk => {
          await sendEvent({
            pub,
            message: chunk.toString(),
            serverId: serverDetails.id,
          })
        },
        onStderr: async chunk => {
          await sendEvent({
            pub,
            message: chunk.toString(),
            serverId: serverDetails.id,
          })
        },
      })

      await sendEvent({
        pub,
        message: `✅ Successfully stopped ${serviceDetails.name}`,
        serverId: serverDetails.id,
      })
    } catch (error) {
      let message = error instanceof Error ? error.message : ''
      throw new Error(`❌ Failed stopping ${serviceDetails?.name}: ${message}`)
    } finally {
      ssh?.dispose()
    }
  },
  { connection: queueConnection },
)

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  console.log('Failed to stop app', err)

  if (job?.data) {
    await sendEvent({
      pub,
      message: err.message,
      serverId: job.data.serverDetails.id,
    })
  }
})

export const addStopAppQueue = async (data: QueueArgs) => {
  const id = `stop-${data.serviceDetails.name}:${new Date().getTime()}`
  return await stopAppQueue.add(queueName, data, {
    jobId: id,
    ...jobOptions,
  })
}
