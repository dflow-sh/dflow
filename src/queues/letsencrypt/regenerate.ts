import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import { Job } from 'bullmq'
import { NodeSSH } from 'node-ssh'

import { getQueue, getWorker } from '@/lib/bullmq'
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
  serviceDetails: {
    name: string
    email?: string
  }
}

export const addLetsencryptRegenerateQueueQueue = async (data: QueueArgs) => {
  const QUEUE_NAME = `server-${data.serverDetails.id}-letsencrypt-regenerate`

  const letsencryptRegenerateQueue = getQueue({
    name: QUEUE_NAME,
    connection: queueConnection,
  })

  const worker = getWorker<QueueArgs>({
    name: QUEUE_NAME,
    processor: async job => {
      const { sshDetails, serverDetails, serviceDetails } = job.data
      const { email, name } = serviceDetails
      let ssh: NodeSSH | null = null

      try {
        ssh = await dynamicSSH(sshDetails)

        if (email) {
          // add letsencrypt generation through this email for app
          const emailResponse = await dokku.letsencrypt.addEmail({
            ssh,
            email,
            appName: name,
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
        }

        const letsencryptEmailResponse = await dokku.letsencrypt.enable(
          ssh,
          name,
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
            },
          },
        )

        if (letsencryptEmailResponse.code === 0) {
          sendEvent({
            pub,
            message: `✅ Successfully regenerated SSL certificates for service: ${name}`,
            serverId: serverDetails.id,
          })

          // remove email from the letsencrypt config for service
          if (email) {
            const removeEmailResponse = await dokku.letsencrypt.addEmail({
              ssh,
              email: '',
              appName: name,
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
          }
        }
      } catch (error) {
        let message = error instanceof Error ? error.message : ''
        throw new Error(`❌ failed to regenerate SSL certificates: ${message}`)
      } finally {
        ssh?.dispose()
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

  const id = `letsencrypt-regenerate:${new Date().getTime()}`

  return await letsencryptRegenerateQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
