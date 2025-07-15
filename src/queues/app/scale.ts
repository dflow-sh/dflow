import { NodeSSH } from 'node-ssh'

import { getQueue, getWorker } from '@/lib/bullmq'
import { dokku } from '@/lib/dokku'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendActionEvent, sendEvent } from '@/lib/sendEvent'
import { SSHType, dynamicSSH } from '@/lib/ssh'

interface QueueArgs {
  sshDetails: SSHType
  appName: string
  scaleArgs: string[]
  serverId: string
  tenantSlug: string
}

export const addScaleAppQueue = async (data: QueueArgs) => {
  const QUEUE_NAME = `server-${data.serverId}-scale-app`

  const scaleAppQueue = getQueue({
    name: QUEUE_NAME,
    connection: queueConnection,
  })

  getWorker<QueueArgs>({
    name: QUEUE_NAME,
    processor: async job => {
      let ssh: NodeSSH | null = null
      const { sshDetails, appName, scaleArgs, serverId, tenantSlug } = job.data

      try {
        ssh = await dynamicSSH(sshDetails)

        await dokku.process.scale(ssh, appName, scaleArgs, {
          onStdout: async chunk => {
            sendEvent({ pub, message: chunk.toString(), serverId })
          },
          onStderr: async chunk => {
            sendEvent({ pub, message: chunk.toString(), serverId })
          },
        })

        sendEvent({
          pub,
          message: `✅ Successfully scaled ${appName}`,
          serverId,
        })

        sendActionEvent({ pub, action: 'refresh', tenantSlug })
      } catch (error) {
        let message = error instanceof Error ? error.message : ''

        throw new Error(`❌ Failed scaling ${appName}: ${message}`)
      } finally {
        ssh?.dispose()
      }
    },
    connection: queueConnection,
  })

  const id = `scale-${data.appName}:${new Date().getTime()}`

  return await scaleAppQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
