import { Job } from 'bullmq'
import { NodeSSH } from 'node-ssh'

import { getQueue, getWorker } from '@/lib/bullmq'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendActionEvent, sendEvent } from '@/lib/sendEvent'
import { server } from '@/lib/server'
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

export const addUninstallRailpackQueue = async (data: QueueArgs) => {
  const QUEUE_NAME = `server-${data.serverDetails.id}-uninstall-railpack`

  const uninstallRailpackQueue = getQueue({
    name: QUEUE_NAME,
    connection: queueConnection,
  })

  const worker = getWorker<QueueArgs>({
    name: QUEUE_NAME,
    processor: async job => {
      const { sshDetails, serverDetails, tenant } = job.data
      let ssh: NodeSSH | null = null

      try {
        ssh = await dynamicSSH(sshDetails)

        const uninstallResponse = await server.railpack.uninstall({
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

        if (uninstallResponse.code === 0) {
          sendEvent({
            pub,
            message: '✅ Successfully uninstalled builder',
            serverId: serverDetails.id,
          })

          sendEvent({
            pub,
            message: 'Syncing changes...',
            serverId: serverDetails.id,
          })

          sendActionEvent({
            pub,
            action: 'refresh',
            tenantSlug: tenant.slug,
          })
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : ''
        throw new Error(`❌ failed to uninstall builder: ${message}`)
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

  const id = `uninstall-railpack:${new Date().getTime()}`

  return await uninstallRailpackQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
