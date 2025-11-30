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

export const addInstallNetdataQueue = async (data: QueueArgs) => {
  const QUEUE_NAME = `server-${data.serverDetails.id}-install-netdata`

  const installNetdataQueue = getQueue({
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

        sendEvent({
          pub,
          message: `Starting Netdata installation...`,
          serverId: serverDetails.id,
        })

        const installResponse = await netdata.core.install({
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

        if (installResponse.success) {
          sendEvent({
            pub,
            message: `✅ Successfully installed Netdata: ${installResponse.message}`,
            serverId: serverDetails.id,
          })

          // Enable and start Netdata service
          const enableResponse = await netdata.core.enable({
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

          if (enableResponse.success) {
            sendEvent({
              pub,
              message: `✅ Successfully enabled and started Netdata service`,
              serverId: serverDetails.id,
            })
          } else {
            throw new Error(
              `Failed to enable Netdata service: ${enableResponse.message}`,
            )
          }

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
            `Failed to install Netdata: ${installResponse.message}`,
          )
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : ''
        throw new Error(`❌ Failed to install Netdata: ${message}`)
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

  const id = `install-netdata:${new Date().getTime()}`

  return await installNetdataQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
