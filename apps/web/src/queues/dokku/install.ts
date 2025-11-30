import { Job } from 'bullmq'
import { NodeSSH } from 'node-ssh'

import { getQueue, getWorker } from '@/lib/bullmq'
import { dokku } from '@/lib/dokku'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendActionEvent, sendEvent } from '@/lib/sendEvent'
import { SSHType, dynamicSSH } from '@/lib/ssh'
import { Server } from '@/payload-types'

interface QueueArgs {
  sshDetails: SSHType
  serverDetails: {
    id: string
    provider: Server['provider']
  }
  tenant: {
    slug: string
  }
}

export const addInstallDokkuQueue = async (data: QueueArgs) => {
  const QUEUE_NAME = `server-${data.serverDetails.id}-install-dokku`

  const installDokkuQueue = getQueue({
    name: QUEUE_NAME,
    connection: queueConnection,
  })

  const worker = getWorker<QueueArgs>({
    name: QUEUE_NAME,
    processor: async job => {
      const { sshDetails, serverDetails, tenant } = job.data
      let ssh: NodeSSH | null = null

      console.log('inside install dokku queue')

      try {
        ssh = await dynamicSSH(sshDetails)

        const installationResponse = await dokku.version.install(ssh, {
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

        console.dir({ installationResponse }, { depth: Infinity })

        if (installationResponse.code === 0) {
          // For AWS, add the dokku permission to ubuntu user
          if (serverDetails.provider === 'aws') {
            await ssh.execCommand('sudo usermod -aG dokku ubuntu')
          }

          sendEvent({
            pub,
            message: `✅ Successfully installed dokku`,
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
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : ''
        throw new Error(`❌ failed to install dokku: ${message}`)
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

  const id = `install-dokku:${new Date().getTime()}`

  return await installDokkuQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
