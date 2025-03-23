import { netdata } from '../../lib/netdata'
import { dynamicSSH } from '../../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'
import { NodeSSH } from 'node-ssh'

import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendEvent } from '@/lib/sendEvent'

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

const queueName = 'uninstall-netdata'

export const uninstallNetdataQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const { sshDetails, serverDetails } = job.data
    let ssh: NodeSSH | null = null

    console.log('inside uninstall netdata queue')

    try {
      ssh = await dynamicSSH(sshDetails)

      await sendEvent({
        pub,
        message: `Starting Netdata uninstallation...`,
        serverId: serverDetails.id,
      })

      const uninstallResponse = await netdata.core.uninstall({
        ssh,
        options: {
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
        },
      })

      if (uninstallResponse.success) {
        await sendEvent({
          pub,
          message: `✅ Successfully uninstalled Netdata: ${uninstallResponse.message}`,
          serverId: serverDetails.id,
        })

        await sendEvent({
          pub,
          message: `Syncing changes...`,
          serverId: serverDetails.id,
        })

        await pub.publish('refresh-channel', JSON.stringify({ refresh: true }))
      } else {
        throw new Error(
          `Failed to uninstall Netdata: ${uninstallResponse.message}`,
        )
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      throw new Error(`❌ Failed to uninstall Netdata: ${message}`)
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
  console.log('Failed to uninstall Netdata', err)

  if (job?.data) {
    await sendEvent({
      pub,
      message: err.message,
      serverId: job.data.serverDetails.id,
    })
  }
})

export const addUninstallNetdataQueue = async (data: QueueArgs) => {
  const id = `uninstall-netdata:${new Date().getTime()}`

  return await uninstallNetdataQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
