import configPromise from '@payload-config'
import axios from 'axios'
import { getPayload } from 'payload'

import { getQueue, getWorker } from '@/lib/bullmq'
import { DFLOW_CONFIG } from '@/lib/constants'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendActionEvent } from '@/lib/sendEvent'
import { Tenant } from '@/payload-types'

import { addCheckDflowServerConnectionQueue } from './checkDflowServerConnectionQueue'

class VpsCreationError extends Error {
  constructor(
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'VpsCreationError'
  }
}

interface CreateVpsQueueArgs {
  orderId: string
  serverId: string
  accessToken: string
  tenant: Tenant
}

// Function to add a job to the create VPS queue
export const addCreateVpsQueue = async (data: CreateVpsQueueArgs) => {
  const QUEUE_NAME = `tenant-${data.tenant.slug}-create-vps`

  const createVpsQueue = getQueue({
    name: QUEUE_NAME,
    connection: queueConnection,
  })

  getWorker<CreateVpsQueueArgs>({
    name: QUEUE_NAME,
    processor: async job => {
      const { orderId, serverId, accessToken, tenant } = job.data
      const jobId = job.id

      const payload = await getPayload({ config: configPromise })

      console.log(`Updating VPS details for ${serverId} with order ${orderId}`)

      // 1. Fetch the created server details
      const createdServer = await payload.findByID({
        id: serverId,
        collection: 'servers',
      })

      try {
        // 2: Polling for public IP and Hostname
        const pollForPublicIPAndHostname = async () => {
          const maxAttempts = 30
          const delayMs = 10000
          let pollTimeout: NodeJS.Timeout | null = null

          console.log(`[${jobId}] Polling for public IP and hostname`)

          try {
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
              try {
                console.log(
                  `[${jobId}] Checking instance status (attempt ${attempt}/${maxAttempts})`,
                )

                const { data: order } = await axios.get(
                  `${DFLOW_CONFIG.URL}/api/vpsOrders/${orderId}`,
                  {
                    headers: {
                      Authorization: `${DFLOW_CONFIG.AUTH_SLUG} API-Key ${accessToken}`,
                    },
                    timeout: 10000,
                  },
                )

                console.log(
                  `[${jobId}] Order: ${JSON.stringify(order, null, 2)}`,
                )

                const newStatus = order.instanceResponse.status
                const newIp = order.instanceResponse?.ipConfig?.v4?.ip
                const newHostname = order.instanceResponse?.name

                // Build updateData based on preferConnectionType
                const updateData: any = {
                  dflowVpsDetails: {
                    status: newStatus,
                  },
                }

                let shouldUpdate = false

                if (createdServer.publicIp !== newIp && newIp) {
                  updateData.publicIp = newIp
                  shouldUpdate = true
                }

                if (createdServer.hostname !== newHostname && newHostname) {
                  updateData.hostname = newHostname
                  shouldUpdate = true
                }

                if (createdServer.dflowVpsDetails?.status !== newStatus) {
                  shouldUpdate = true
                }

                console.log(`[${jobId}] Should update: ${shouldUpdate}`)

                console.log(
                  `[${jobId}] Update data: ${JSON.stringify(updateData, null, 2)}`,
                )

                if (shouldUpdate) {
                  await payload.update({
                    collection: 'servers',
                    id: createdServer.id,
                    data: updateData,
                  })

                  console.log(
                    `[${jobId}] Server updated - Status: ${newStatus}, IP: ${newIp || 'not assigned'}, Hostname: ${newHostname || 'not assigned'}`,
                  )

                  sendActionEvent({
                    pub,
                    action: 'refresh',
                    tenantSlug: tenant.slug,
                  })
                }

                if (order.status === 'failed' || order.status === 'error') {
                  throw new VpsCreationError(
                    `VPS creation failed: ${order.message || 'No details provided'}`,
                    { orderStatus: order.status },
                  )
                }

                if (newStatus === 'running' && newHostname && newIp) {
                  console.log(
                    `[${jobId}] VPS is ready with Public IP: ${newIp}, Hostname: ${newHostname}`,
                  )

                  return {
                    publicIp: newIp,
                    hostname: newHostname,
                    status: newStatus,
                  }
                }
              } catch (error) {
                console.error(
                  `[${jobId}] Error checking instance status:`,
                  error,
                )
              }

              await new Promise(resolve => {
                pollTimeout = setTimeout(resolve, delayMs)
              })
            }

            throw new VpsCreationError(
              'VPS did not get a public IP within the expected time',
            )
          } finally {
            if (pollTimeout) clearTimeout(pollTimeout)
          }
        }

        const pollResult = await pollForPublicIPAndHostname()

        // Trigger connection attempts queue if server is ready (status running, has publicIp/hostname)
        if (
          pollResult.status === 'running' &&
          pollResult.publicIp &&
          pollResult.hostname
        ) {
          await addCheckDflowServerConnectionQueue({
            serverId: createdServer.id,
          })
        }

        console.log(`[${jobId}] VPS creation completed successfully`)
      } catch (error) {
        console.error(`[${jobId}] VPS creation failed:`, error)

        if (error instanceof VpsCreationError) {
          throw error
        }

        throw new VpsCreationError(
          'VPS creation failed: ' +
            (error instanceof Error ? error.message : 'Unknown error'),
          { originalError: error },
        )
      }
    },
    connection: queueConnection,
  })

  const id = `create-vps:${new Date().getTime()}`

  return await createVpsQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
