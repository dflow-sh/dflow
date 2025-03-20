import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'
import { NodeSSH, SSHExecCommandResponse } from 'node-ssh'
import { z } from 'zod'

import { createServiceSchema } from '@/actions/service/validator'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendEvent } from '@/lib/sendEvent'

const queueName = 'manage-server-domain'

export type DatabaseType = Exclude<
  z.infer<typeof createServiceSchema>['databaseType'],
  undefined
>

interface QueueArgs {
  sshDetails: {
    privateKey: string
    host: string
    username: string
    port: number
  }
  serverDetails: {
    global: {
      domain: string
      action: 'add' | 'remove' | 'set'
    }
    id: string
  }
}

const manageServerDomainQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const { sshDetails, serverDetails } = job.data
    const { global } = job.data.serverDetails
    let ssh: NodeSSH | null = null

    try {
      ssh = await dynamicSSH(sshDetails)

      let executionResponse: SSHExecCommandResponse = {
        code: -1,
        signal: null,
        stdout: '',
        stderr: '',
      }

      if (global) {
        switch (global.action) {
          case 'add':
            executionResponse = await dokku.domains.addGlobal(
              ssh,
              global.domain,
              {
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
            )
            break
          case 'remove':
            executionResponse = await dokku.domains.removeGlobal(
              ssh,
              global.domain,
              {
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
            )
            break
          case 'set':
            executionResponse = await dokku.domains.setGlobal(
              ssh,
              global.domain,
              {
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
            )
            break
          default:
            break
        }

        if (executionResponse.code === 0) {
          await sendEvent({
            pub,
            message: `✅ Successfully ${global.action}ed global domain ${global.domain}`,
            serverId: serverDetails.id,
          })
        }
      }
    } catch (error) {
      let message = error instanceof Error ? error.message : ''
      throw new Error(
        `❌ failed to ${serverDetails?.global.action} for domain ${serverDetails?.global?.domain}: ${message}`,
      )
    } finally {
      ssh?.dispose()
    }
  },
  { connection: queueConnection },
)

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  console.log('Failed during global-domain operation', err)

  if (job?.data) {
    await sendEvent({
      pub,
      message: err.message,
      serverId: job.data.serverDetails.id,
    })
  }
})

export const addManageServerDomainQueue = async (data: QueueArgs) => {
  const id = `manage-global-domain-${data.serverDetails.global?.domain}-:${new Date().getTime()}`

  return await manageServerDomainQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
