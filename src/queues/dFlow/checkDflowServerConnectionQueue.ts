import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { getQueue, getWorker } from '@/lib/bullmq'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendActionEvent, sendEvent } from '@/lib/sendEvent'
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
      const { serverId, maxAttempts = 30, delayMs = 10000 } = job.data

      const payload = await getPayload({ config: configPromise })

      sendEvent({
        pub,
        message: `🔍 Starting connection check for server ${serverId}`,
        serverId,
      })

      // Helper to extract tenantSlug from server object
      const getTenantSlug = (server: Server): string | undefined => {
        if (
          server?.tenant &&
          typeof server.tenant === 'object' &&
          'slug' in server.tenant
        ) {
          return server.tenant.slug
        }

        return undefined
      }

      try {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          sendEvent({
            pub,
            message: `Attempt ${attempt + 1} of ${maxAttempts} for server ${serverId}`,
            serverId,
          })
          // Get the server details on each loop
          const server = await payload.findByID({
            collection: 'servers',
            id: serverId,
          })

          const tenantSlug = getTenantSlug(server)

          if (!server) {
            sendEvent({
              pub,
              message: `❌ Server not found, aborting connection check for server ${serverId}`,
              serverId,
            })
            break
          }

          const isDflow = server.provider === 'dflow'
          const dflowStatus = server.dflowVpsDetails?.status
          const connectionAttempts = server.connectionAttempts ?? 0
          const connectionStatus = server.connection?.status

          // Only continue if all conditions are met
          if (
            !(
              isDflow &&
              dflowStatus === 'running' &&
              connectionAttempts < 30 &&
              connectionStatus === 'not-checked-yet'
            )
          ) {
            sendEvent({
              pub,
              message: `ℹ️ Conditions not met, exiting connection check for server ${serverId}`,
              serverId,
            })

            // If already connected or failed, update attempts only and exit
            await payload.update({
              collection: 'servers',
              id: serverId,
              data: {
                connectionAttempts: attempt,
              },
            })

            if (tenantSlug) {
              sendActionEvent({
                pub,
                action: 'refresh',
                tenantSlug,
              })
            }

            break
          }

          // Check the server connection
          try {
            const sshDetails = extractSSHDetails({ server })
            const ssh = await dynamicSSH(sshDetails)

            if (ssh.isConnected()) {
              // If connected, update connection status and attempts then exit
              sendEvent({
                pub,
                message: `✅ SSH connected successfully for server ${serverId}`,
                serverId,
              })

              await payload.update({
                collection: 'servers',
                id: serverId,
                data: {
                  cloudInitStatus: 'running',
                  connection: {
                    status: 'success',
                    lastChecked: new Date().toISOString(),
                  },
                  connectionAttempts: attempt + 1,
                },
              })

              if (tenantSlug) {
                sendActionEvent({
                  pub,
                  action: 'refresh',
                  tenantSlug,
                })
              }

              break
            } else {
              sendEvent({
                pub,
                message: `❌ SSH not connected for server ${serverId} (attempt ${attempt + 1})`,
                serverId,
              })
            }
          } catch (error) {
            sendEvent({
              pub,
              message: `⚠️ Error connecting to server ${serverId}: ${error instanceof Error ? error.message : String(error)}`,
              serverId,
            })
          }

          // If not connected, continue with next attempt
          await new Promise(resolve => setTimeout(resolve, delayMs))
        }

        // If not connected after 30 attempts, update server with attempts only and exit
        const server = await payload.findByID({
          collection: 'servers',
          id: serverId,
        })
        const tenantSlug = getTenantSlug(server)

        await payload.update({
          collection: 'servers',
          id: serverId,
          data: {
            connectionAttempts: maxAttempts,
          },
        })

        if (tenantSlug) {
          sendActionEvent({
            pub,
            action: 'refresh',
            tenantSlug,
          })
        }

        sendEvent({
          pub,
          message: `🔁 Connection check completed for server ${serverId}`,
          serverId,
        })

        return { completed: true }
      } catch (error) {
        sendEvent({
          pub,
          message: `❌ Error checking server connection for ${serverId}: ${error instanceof Error ? error.message : String(error)}`,
          serverId,
        })
        throw error
      }
    },

    connection: queueConnection,
  })

  const id = `check-${data.serverId}-server-connection`

  console.log(`[${id}] Adding job to queue`)

  return await queue.add(id, data, { jobId: id, ...jobOptions })
}
