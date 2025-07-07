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

      try {
        while (attempt < maxAttempts && !connected) {
          server = await payload.findByID({
            collection: 'servers',
            id: serverId,
          })

          if (!server) break

          // Only run if dflow, status is running, and not already connected
          if (
            server.provider !== 'dflow' ||
            server.connection?.status === 'success'
          )
            break

          // Only run if dflow, status is running, and not already connected
          if (server.dflowVpsDetails?.status !== 'running') break

          const prevStatus = server.connection?.status

          try {
            const sshDetails = extractSSHDetails({ server })

            const ssh = await dynamicSSH(sshDetails)

            if (ssh.isConnected()) {
              // If previous status is 'not-checked-yet', only update to 'success' if connected
              // If previous status is 'failed' or 'success', always update to 'success' if connected
              if (
                typeof prevStatus === 'string' &&
                (prevStatus === 'not-checked-yet' ||
                  prevStatus === 'failed' ||
                  prevStatus === 'success')
              ) {
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
              }
              break
            }
          } catch (e) {
            // ignore, will retry
            console.log(`[${job.id}] Error connecting to server ${serverId}`, e)
          }

          attempt = (server.connectionAttempts ?? 0) + 1

          // If previous status is 'not-checked-yet', do not update on failure
          // If previous status is 'failed' or 'success', update to 'failed' on failure
          if (
            typeof prevStatus === 'string' &&
            prevStatus !== 'not-checked-yet'
          ) {
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
          }

          if (attempt >= maxAttempts) break

          console.log(
            `[${job.id}] Server ${serverId} not connected, retrying...`,
          )

          await new Promise(res => setTimeout(res, delayMs))
        }

        console.log(
          `[${job.id}] Connection check completed for server ${serverId}`,
        )
        return { connected, attempt }
      } catch (error) {
        console.error(`[${job.id}] Error checking server connection`, error)
        throw error
      }
    },

    connection: queueConnection,
  })

  const id = `check-${data.serverId}-server-connection`

  console.log(`[${id}] Adding job to queue`)

  return await queue.add(id, data, { jobId: id, ...jobOptions })
}
