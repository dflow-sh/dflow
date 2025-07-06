import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { getQueue, getWorker } from '@/lib/bullmq'
import { jobOptions, queueConnection } from '@/lib/redis'
import { dynamicSSH, extractSSHDetails } from '@/lib/ssh'
import { Server } from '@/payload-types'

interface CheckDflowServerConnectionQueueArgs {
  serverId: string
  maxAttempts?: number
  delayMs?: number
}

export const addCheckDflowServerConnectionQueue = async (
  data: CheckDflowServerConnectionQueueArgs,
) => {
  const QUEUE_NAME = `check-${data.serverId}-server-connection`

  const queue = getQueue({ name: QUEUE_NAME, connection: queueConnection })

  getWorker<CheckDflowServerConnectionQueueArgs>({
    name: QUEUE_NAME,

    processor: async job => {
      const { serverId, maxAttempts = 30, delayMs = 5000 } = job.data

      const payload = await getPayload({ config: configPromise })

      let attempt = 0
      let connected = false
      let server: Server | null = null

      while (attempt < maxAttempts && !connected) {
        server = await payload.findByID({ collection: 'servers', id: serverId })

        if (!server) break

        // Only run if dflow, status is running, and not already connected
        if (
          server.provider !== 'dflow' ||
          server.connection?.status === 'success'
        )
          break

        // Only run if dflow, status is running, and not already connected
        if (server.dflowVpsDetails?.status !== 'running') break

        try {
          const sshDetails = extractSSHDetails({ server })

          const ssh = await dynamicSSH(sshDetails)

          if (ssh.isConnected()) {
            connected = true

            console.log(`[${job.id}] Server ${serverId} connected`)

            await payload.update({
              collection: 'servers',
              id: serverId,
              data: {
                cloudInitStatus: 'running',
                connection: {
                  status: 'success',
                  lastChecked: new Date().toISOString(),
                },
                connectionAttempts: attempt,
              },
            })
            break
          }
        } catch (e) {
          // ignore, will retry
          console.log(`[${job.id}] Error connecting to server ${serverId}`, e)
        }

        attempt = (server.connectionAttempts ?? 0) + 1

        await payload.update({
          collection: 'servers',
          id: serverId,
          data: {
            cloudInitStatus: 'running',
            connection: {
              status: attempt >= maxAttempts ? 'failed' : 'not-checked-yet',
              lastChecked: new Date().toISOString(),
            },
            connectionAttempts: attempt,
          },
        })

        if (attempt >= maxAttempts) break

        console.log(`[${job.id}] Server ${serverId} not connected, retrying...`)

        await new Promise(res => setTimeout(res, delayMs))
      }
    },

    connection: queueConnection,
  })

  const id = `check-${data.serverId}-server-connection`

  console.log(`[${id}] Adding job to queue`)

  return await queue.add(id, data, { jobId: id, ...jobOptions })
}
