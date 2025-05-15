import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import { Job } from 'bullmq'
import { NodeSSH, SSHExecCommandResponse } from 'node-ssh'

import { getQueue, getWorker } from '@/lib/bullmq'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendEvent } from '@/lib/sendEvent'

interface QueueArgs {
  sshDetails: {
    privateKey: string
    host: string
    username: string
    port: number
  }
  serviceDetails: {
    action: 'add' | 'remove' | 'set'
    domain: string
    name: string
    certificateType: 'letsencrypt' | 'none'
    autoRegenerateSSL: boolean
  }
  serverDetails: {
    id: string
  }
}

const operation = {
  add: 'added',
  remove: 'removed',
  set: 'setted',
} as const

export const addManageServiceDomainQueue = async (data: QueueArgs) => {
  const QUEUE_NAME = `server-${data.serverDetails.id}-manage-service-domain`

  const manageServiceDomainQueue = getQueue({
    name: QUEUE_NAME,
    connection: queueConnection,
  })

  const worker = getWorker<QueueArgs>({
    name: QUEUE_NAME,
    processor: async job => {
      const { sshDetails, serverDetails } = job.data
      const { domain, name, action, certificateType } = job.data.serviceDetails
      let ssh: NodeSSH | null = null

      try {
        ssh = await dynamicSSH(sshDetails)

        let executionResponse: SSHExecCommandResponse = {
          code: -1,
          signal: null,
          stdout: '',
          stderr: '',
        }

        switch (action) {
          case 'add':
            executionResponse = await dokku.domains.add(ssh, name, domain, {
              onStdout: async chunk => {
                console.info(chunk.toString())
                sendEvent({
                  pub,
                  message: chunk.toString(),
                  serverId: serverDetails.id,
                })
              },
              onStderr: async chunk => {
                console.info({
                  addGlobalDomainLogs: {
                    message: chunk.toString(),
                    type: 'stdout',
                  },
                })
                sendEvent({
                  pub,
                  message: chunk.toString(),
                  serverId: serverDetails.id,
                })
              },
            })
            break
          case 'remove':
            executionResponse = await dokku.domains.remove(ssh, name, domain, {
              onStdout: async chunk => {
                console.info(chunk.toString())
                sendEvent({
                  pub,
                  message: chunk.toString(),
                  serverId: serverDetails.id,
                })
              },
              onStderr: async chunk => {
                console.info({
                  removeGlobalDomainLogs: {
                    message: chunk.toString(),
                    type: 'stdout',
                  },
                })
                sendEvent({
                  pub,
                  message: chunk.toString(),
                  serverId: serverDetails.id,
                })
              },
            })
            break
          case 'set':
            executionResponse = await dokku.domains.set(ssh, name, domain, {
              onStdout: async chunk => {
                console.info(chunk.toString())
                sendEvent({
                  pub,
                  message: chunk.toString(),
                  serverId: serverDetails.id,
                })
              },
              onStderr: async chunk => {
                console.info({
                  setGlobalDomainLogs: {
                    message: chunk.toString(),
                    type: 'stdout',
                  },
                })
                sendEvent({
                  pub,
                  message: chunk.toString(),
                  serverId: serverDetails.id,
                })
              },
            })
            break
          default:
            break
        }

        if (executionResponse.code === 0) {
          sendEvent({
            pub,
            message: `✅ Successfully ${operation[action]} domain ${domain}`,
            serverId: serverDetails.id,
          })
        }

        if (certificateType === 'letsencrypt') {
          sendEvent({
            pub,
            message: `Started adding SSL Certificate to domain ${domain}`,
            serverId: serverDetails.id,
          })

          const letsencryptResponse = await dokku.letsencrypt.enable(
            ssh,
            name,
            {
              onStdout: async chunk => {
                console.info(chunk.toString())
                sendEvent({
                  pub,
                  message: chunk.toString(),
                  serverId: serverDetails.id,
                })
              },
              onStderr: async chunk => {
                console.info({
                  setGlobalDomainLogs: {
                    message: chunk.toString(),
                    type: 'stdout',
                  },
                })
                sendEvent({
                  pub,
                  message: chunk.toString(),
                  serverId: serverDetails.id,
                })
              },
            },
          )

          if (letsencryptResponse.code === 0) {
            sendEvent({
              pub,
              message: `✅ Successfully added SSL Certificate to domain ${domain}`,
              serverId: serverDetails.id,
            })
          }
        }
      } catch (error) {
        let message = error instanceof Error ? error.message : ''
        throw new Error(
          `❌ Failed ${operation[action]} domain ${domain}: ${message}`,
        )
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

  const id = `manage-domain-${data.serviceDetails.domain}:${new Date().getTime()}`

  return await manageServiceDomainQueue.add(id, data, {
    ...jobOptions,
    jobId: id,
  })
}
