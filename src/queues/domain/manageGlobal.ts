import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'
import { SSHExecCommandResponse } from 'node-ssh'
import { z } from 'zod'

import { createServiceSchema } from '@/actions/service/validator'
import { pub, queueConnection } from '@/lib/redis'

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
    global?: {
      domain: string
      action: 'add' | 'remove' | 'set'
    }
  }
}

const manageServerDomainQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const { sshDetails } = job.data
    const { global } = job.data.serverDetails

    const ssh = await dynamicSSH(sshDetails)

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
                await pub.publish('my-channel', chunk.toString())
                console.info(chunk.toString())
              },
              onStderr: async chunk => {
                await pub.publish('my-channel', chunk.toString())
                console.info({
                  addGlobalDomainLogs: {
                    message: chunk.toString(),
                    type: 'stdout',
                  },
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
                await pub.publish('my-channel', chunk.toString())
                console.info(chunk.toString())
              },
              onStderr: async chunk => {
                await pub.publish('my-channel', chunk.toString())
                console.info({
                  removeGlobalDomainLogs: {
                    message: chunk.toString(),
                    type: 'stdout',
                  },
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
                await pub.publish('my-channel', chunk.toString())
                console.info(chunk.toString())
              },
              onStderr: async chunk => {
                await pub.publish('my-channel', chunk.toString())
                console.info({
                  setGlobalDomainLogs: {
                    message: chunk.toString(),
                    type: 'stdout',
                  },
                })
              },
            },
          )
          break
        default:
          break
      }

      if (executionResponse.code === 0) {
        await pub.publish(
          'my-channel',
          `✅ Successfully ${global.action}ed global domain ${global.domain}`,
        )
      }
    }

    ssh.dispose()
  },
  { connection: queueConnection },
)

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  console.log('Failed during global-domain operation', err)

  const serverDetails = job?.data?.serverDetails?.global

  await pub.publish(
    'my-channel',
    `✅ Successfully ${serverDetails?.action}ed global domain ${serverDetails?.domain}`,
  )
})

export const addManageServerDomainQueue = async (data: QueueArgs) =>
  await manageServerDomainQueue.add(queueName, data)
