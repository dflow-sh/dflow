import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'
import { SSHExecCommandResponse } from 'node-ssh'

import { jobOptions, pub, queueConnection } from '@/lib/redis'

const queueName = 'manage-service-domain'

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
}

const operation = {
  add: 'added',
  remove: 'removed',
  set: 'setted',
} as const

const manageServiceDomainQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const { sshDetails } = job.data
    const { domain, name, action, certificateType } = job.data.serviceDetails

    const ssh = await dynamicSSH(sshDetails)

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
        })
        break
      case 'remove':
        executionResponse = await dokku.domains.remove(ssh, name, domain, {
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
        })
        break
      case 'set':
        executionResponse = await dokku.domains.set(ssh, name, domain, {
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
        })
        break
      default:
        break
    }

    if (executionResponse.code === 0) {
      await pub.publish(
        'my-channel',
        `✅ Successfully ${operation[action]} domain ${domain}`,
      )
    }

    if (certificateType === 'letsencrypt') {
      await pub.publish(
        'my-channel',
        `Started adding SSL Certificate to domain ${domain}`,
      )

      const letsencryptResponse = await dokku.letsencrypt.enable(ssh, name, {
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
      })

      if (letsencryptResponse.code === 0) {
        await pub.publish(
          'my-channel',
          `✅ Successfully added SSL Certificate to domain ${domain}`,
        )
      }
    }

    ssh.dispose()
  },
  { connection: queueConnection },
)

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  console.log('Failed during service-domain operation', err)

  const serverDetails = job?.data?.serviceDetails

  await pub.publish(
    'my-channel',
    `Failed ${operation[serverDetails?.action!]} domain ${serverDetails?.domain}`,
  )
})

export const addManageServiceDomainQueue = async (data: QueueArgs) => {
  const id = `manage-domain-${data.serviceDetails.domain}:${new Date().getTime()}`
  return await manageServiceDomainQueue.add(id, data, {
    ...jobOptions,
    jobId: id,
  })
}
