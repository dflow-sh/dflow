import { dynamicSSH } from '../../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'
import { NodeSSH } from 'node-ssh'

import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendEvent } from '@/lib/sendEvent'
import { server } from '@/lib/server'

interface QueueArgs {
  sshDetails: {
    host: string
    port: number
    username: string
    privateKey: string
  }
  serverDetails: {
    id: string
  }
}

const queueName = 'install-railpack'

export const installRailpackQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const { sshDetails, serverDetails } = job.data
    let ssh: NodeSSH | null = null

    console.log('inside install railpack queue')

    try {
      ssh = await dynamicSSH(sshDetails)

      const installationResponse = await server.railpack.install({
        ssh,
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

      if (installationResponse.code === 0) {
        sendEvent({
          pub,
          message: `✅ Successfully installed builder`,
          serverId: serverDetails.id,
        })

        sendEvent({
          pub,
          message: `Syncing changes...`,
          serverId: serverDetails.id,
        })

        await pub.publish('refresh-channel', JSON.stringify({ refresh: true }))
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      throw new Error(`❌ failed to install builder: ${message}`)
    } finally {
      if (ssh) {
        ssh.dispose()
      }
    }
  },
  {
    connection: queueConnection,
    // Add concurrency limit
    concurrency: 1,
  },
)

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  console.log('Failed to install railpack', err)

  if (job?.data) {
    sendEvent({
      pub,
      message: err.message,
      serverId: job.data.serverDetails.id,
    })
  }
})

export const addInstallRailpackQueue = async (data: QueueArgs) => {
  const id = `install-railpack:${new Date().getTime()}`

  return await installRailpackQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
