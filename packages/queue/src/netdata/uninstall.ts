import { Job } from 'bullmq'
import { NodeSSH } from 'node-ssh'

import { getQueue, getWorker } from '@/lib/bullmq'
import { netdata } from '@/lib/netdata'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendActionEvent, sendEvent } from '@/lib/sendEvent'
import { SSHType, dynamicSSH } from '@/lib/ssh'

interface QueueArgs {
  sshDetails: SSHType
  serverDetails: {
    id: string
  }
  tenant: {
    slug: string
  }
}

export const addUninstallNetdataQueue = async (data: QueueArgs) => {
  const QUEUE_NAME = `server-${data.serverDetails.id}-uninstall-netdata`

  const uninstallNetdataQueue = getQueue({
    name: QUEUE_NAME,
    connection: queueConnection,
  })

  const worker = getWorker<QueueArgs>({
    name: QUEUE_NAME,
    processor: async job => {
      const { sshDetails, serverDetails, tenant } = job.data
      let ssh: NodeSSH | null = null

      console.log('inside uninstall netdata queue')

      try {
        ssh = await dynamicSSH(sshDetails)

        sendEvent({
          pub,
          message: `Starting Netdata uninstallation...`,
          serverId: serverDetails.id,
        })

        const uninstallResponse = await netdata.core.uninstall({
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

        if (uninstallResponse.success) {
          sendEvent({
            pub,
            message: `✅ Successfully uninstalled Netdata: ${uninstallResponse.message}`,
            serverId: serverDetails.id,
          })

          sendEvent({
            pub,
            message: `Syncing changes...`,
            serverId: serverDetails.id,
          })

          sendActionEvent({
            pub,
            action: 'refresh',
            tenantSlug: tenant.slug,
          })
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

  const id = `uninstall-netdata:${new Date().getTime()}`

  return await uninstallNetdataQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
