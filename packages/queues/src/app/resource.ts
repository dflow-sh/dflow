import { NodeSSH } from 'node-ssh'

import { getQueue, getWorker } from '@/lib/bullmq'
import { dokku } from '@/lib/dokku'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendActionEvent, sendEvent } from '@/lib/sendEvent'
import { SSHType, dynamicSSH } from '@/lib/ssh'

interface ResourceQueueArgs {
  sshDetails: SSHType
  appName: string
  resourceArgs: string[]
  processType?: string
  serverId: string
  tenantSlug: string
  action: 'limit' | 'reserve' | 'limitClear' | 'reserveClear'
}

export const addResourceAppQueue = async (data: ResourceQueueArgs) => {
  const QUEUE_NAME = `server-${data.serverId}-resource-app-${data.action}`

  const resourceAppQueue = getQueue({
    name: QUEUE_NAME,
    connection: queueConnection,
  })

  getWorker<ResourceQueueArgs>({
    name: QUEUE_NAME,
    processor: async job => {
      let ssh: NodeSSH | null = null
      const {
        sshDetails,
        appName,
        resourceArgs,
        processType,
        serverId,
        tenantSlug,
        action,
      } = job.data

      try {
        ssh = await dynamicSSH(sshDetails)
        let result

        if (action === 'limit') {
          result = await dokku.resource.limit(
            ssh,
            appName,
            resourceArgs,
            processType,
            {
              onStdout: async chunk =>
                sendEvent({ pub, message: chunk.toString(), serverId }),
              onStderr: async chunk =>
                sendEvent({ pub, message: chunk.toString(), serverId }),
            },
          )
        } else if (action === 'reserve') {
          result = await dokku.resource.reserve(
            ssh,
            appName,
            resourceArgs,
            processType,
            {
              onStdout: async chunk =>
                sendEvent({ pub, message: chunk.toString(), serverId }),
              onStderr: async chunk =>
                sendEvent({ pub, message: chunk.toString(), serverId }),
            },
          )
        } else if (action === 'limitClear') {
          result = await dokku.resource.limitClear(ssh, appName, processType, {
            onStdout: async chunk =>
              sendEvent({ pub, message: chunk.toString(), serverId }),
            onStderr: async chunk =>
              sendEvent({ pub, message: chunk.toString(), serverId }),
          })
        } else if (action === 'reserveClear') {
          result = await dokku.resource.reserveClear(
            ssh,
            appName,
            processType,
            {
              onStdout: async chunk =>
                sendEvent({ pub, message: chunk.toString(), serverId }),
              onStderr: async chunk =>
                sendEvent({ pub, message: chunk.toString(), serverId }),
            },
          )
        }

        sendEvent({
          pub,
          message: `✅ Successfully updated resource for ${appName}`,
          serverId,
        })

        sendActionEvent({ pub, action: 'refresh', tenantSlug })
      } catch (error) {
        let message = error instanceof Error ? error.message : ''

        throw new Error(`❌ Failed resource update for ${appName}: ${message}`)
      } finally {
        ssh?.dispose()
      }
    },
    connection: queueConnection,
  })

  const id = `resource-${data.action}-${data.appName}:${new Date().getTime()}`

  return await resourceAppQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
