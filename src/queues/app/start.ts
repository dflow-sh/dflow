import { dynamicSSH } from '../../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'
import { NodeSSH } from 'node-ssh'

import { dokku } from '@/lib/dokku'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendEvent } from '@/lib/sendEvent'

const queueName = 'start-app'

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

const startAppQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const { sshDetails, serviceDetails, serverDetails } = job.data
    let ssh: NodeSSH | null = null

    console.log(`starting startApp queue for ${serviceDetails.name}`)

    try {
      ssh = await dynamicSSH(sshDetails)
      const res = await dokku.process.start(ssh, serviceDetails.name, {
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
      })

      sendEvent({
        pub,
        message: `✅ Successfully started ${serviceDetails.name}`,
        serverId: serverDetails.id,
      })
    } catch (error) {
      let message = error instanceof Error ? error.message : ''
      throw new Error(`❌ Failed starting ${serviceDetails?.name} : ${message}`)
    } finally {
      ssh?.dispose()
    }
  },
  { connection: queueConnection },
)

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  console.log('Failed to start app', err)

  if (job?.data) {
    sendEvent({
      pub,
      message: err.message,
      serverId: job.data.serverDetails.id,
    })
  }
})

export const addStartAppQueue = async (data: QueueArgs) => {
  const id = `start-${data.serviceDetails.name}:${new Date().getTime()}`
  return await startAppQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
