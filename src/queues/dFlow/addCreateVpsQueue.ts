import configPromise from '@payload-config'
import axios from 'axios'
import { RequiredDataFromCollection, getPayload } from 'payload'

import { getQueue, getWorker } from '@/lib/bullmq'
import { DFLOW_CONFIG } from '@/lib/constants'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendActionEvent } from '@/lib/sendEvent'
import { Server, SshKey, Tenant } from '@/payload-types'

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
  sshKeys: SshKey[]
  vps: {
    plan: string
    displayName: string
    image: {
      imageId: string
      priceId: string
    }
    product: {
      productId: string
      priceId: string
    }
    region: {
      code: string
      priceId: string
    }
    defaultUser: string
    rootPassword: number
    period: {
      months: number
      priceId: string
    }
    addOns?: {
      backup?: {}
      priceId?: string
    }
    estimatedCost: number
  }
  accountDetails: {
    id: string
    accessToken: string
  }
  tenant: Tenant
  preferConnectionType: 'ssh' | 'tailscale'
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
      const { sshKeys, vps, accountDetails, tenant, preferConnectionType } =
        job.data
      const token = accountDetails.accessToken
      const jobId = job.id

      const payload = await getPayload({ config: configPromise })

      console.log(
        `[${jobId}] VPS creation worker started for tenant ${tenant.slug}`,
      )

      try {
        if (!vps.plan || !vps.displayName) {
          throw new VpsCreationError('VPS plan and display name are required')
        }

        // Step 1: Create VPS order
        const vpsData = {
          plan: vps.plan,
          userData: {
            image: vps.image,
            product: vps.product,
            displayName: vps.displayName,
            region: vps.region,
            card: '',
            defaultUser: vps.defaultUser,
            rootPassword: vps.rootPassword,
            period: vps.period,
            plan: vps.plan,
            addOns: vps.addOns || {},
          },
        }

        console.log(
          `[${jobId}] Creating VPS order with data:`,
          JSON.stringify(vpsData, null, 2),
        )

        const { data: createdVpsOrderRes } = await axios.post(
          `${DFLOW_CONFIG.URL}/api/vpsOrders`,
          vpsData,
          {
            headers: {
              Authorization: `${DFLOW_CONFIG.AUTH_SLUG} API-Key ${token}`,
            },
            timeout: 200000, // 2 mins of timeout!
          },
        )

        const { doc: createdVpsOrder } = createdVpsOrderRes

        console.log(
          `[${jobId}] VPS order created: ${JSON.stringify(createdVpsOrder, null, 2)}`,
        )

        // Step 2: Create server record in Payload
        let serverData: RequiredDataFromCollection<Server>
        if (preferConnectionType === 'ssh') {
          serverData = {
            name: vps.displayName,
            description: '',
            ip: createdVpsOrder?.instanceResponse?.ipConfig?.v4?.ip || '',
            port: 22,
            username: 'root',
            provider: 'dflow',
            tenant: tenant.id,
            cloudProviderAccount: accountDetails.id,
            preferConnectionType: 'ssh',
            dflowVpsDetails: {
              orderId: createdVpsOrder.id,
              instanceId: createdVpsOrder.instanceId,
              status: createdVpsOrder.instanceResponse.status as NonNullable<
                Server['dflowVpsDetails']
              >['status'],
            },
            cloudInitStatus: 'running',
            connectionAttempts: 0,
          }
        } else {
          serverData = {
            name: vps.displayName,
            description: '',
            publicIp: createdVpsOrder?.instanceResponse?.ipConfig?.v4?.ip || '',
            hostname:
              createdVpsOrder?.instanceResponse?.name || 'pending-hostname',
            username: 'root',
            provider: 'dflow',
            tenant: tenant.id,
            cloudProviderAccount: accountDetails.id,
            preferConnectionType: 'tailscale',
            dflowVpsDetails: {
              orderId: createdVpsOrder.id,
              instanceId: createdVpsOrder.instanceId,
              status: createdVpsOrder.instanceResponse.status as NonNullable<
                Server['dflowVpsDetails']
              >['status'],
            },
            cloudInitStatus: 'running',
            connectionAttempts: 0,
          }
        }

        console.log(
          `[${jobId}] Server data to create: ${JSON.stringify(serverData, null, 2)}`,
        )

        const createdServer = await payload.create({
          collection: 'servers',
          data: serverData,
        })

        console.log(
          `[${jobId}] Server record created with ID: ${JSON.stringify(createdServer, null, 2)}`,
        )

        // Step 5: Improved polling for public IP and Hostname
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

                const { data: instanceStatusRes } = await axios.get(
                  `${DFLOW_CONFIG.URL}/api/vpsOrders?where[instanceId][equals]=${createdVpsOrder.instanceId}`,
                  {
                    headers: {
                      Authorization: `${DFLOW_CONFIG.AUTH_SLUG} API-Key ${token}`,
                    },
                    timeout: 10000,
                  },
                )

                console.log(
                  `[${jobId}] Instance status response: ${JSON.stringify(
                    instanceStatusRes,
                    null,
                    2,
                  )}`,
                )

                const orders = instanceStatusRes?.docs || []
                if (orders.length === 0) {
                  console.log(
                    `[${jobId}] No orders found for instance ${createdVpsOrder.instanceId}`,
                  )
                  continue
                }

                const order = orders[0]

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

                if (preferConnectionType === 'ssh') {
                  if (createdServer.ip !== newIp && newIp) {
                    updateData.ip = newIp
                    shouldUpdate = true
                  }
                } else if (preferConnectionType === 'tailscale') {
                  if (createdServer.publicIp !== newIp && newIp) {
                    updateData.publicIp = newIp
                    shouldUpdate = true
                  }
                  if (createdServer.hostname !== newHostname && newHostname) {
                    updateData.hostname = newHostname
                    shouldUpdate = true
                  }
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

                // Check if ready and return correct fields based on connection type
                if (preferConnectionType === 'ssh') {
                  if (newStatus === 'running' && newIp) {
                    console.log(`[${jobId}] VPS is ready with IP: ${newIp}`)
                    return {
                      ip: newIp,
                      status: newStatus,
                    }
                  }
                } else if (preferConnectionType === 'tailscale') {
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
          ((preferConnectionType === 'ssh' && pollResult.ip) ||
            (preferConnectionType === 'tailscale' &&
              pollResult.publicIp &&
              pollResult.hostname))
        ) {
          await addCheckDflowServerConnectionQueue({
            serverId: createdServer.id,
          })
        }

        sendActionEvent({
          pub,
          action: 'redirect',
          tenantSlug: tenant.slug,
          url: `/${tenant.slug}/servers/${createdServer.id}`,
        })

        // Build result object based on connection type
        let result: any = {
          success: true,
          orderId: createdVpsOrder.id,
          serverId: createdServer.id,
          status: pollResult.status,
        }
        if (preferConnectionType === 'ssh') {
          result.ip = pollResult.ip
        } else if (preferConnectionType === 'tailscale') {
          result.publicIp = pollResult.publicIp
          result.hostname = pollResult.hostname
        }

        console.log(`[${jobId}] VPS creation completed successfully`)
        return result
      } catch (error) {
        console.error(`[${jobId}] VPS creation failed:`, error)

        sendActionEvent({
          pub,
          action: 'redirect',
          tenantSlug: tenant.slug,
          url: `/${tenant.slug}/servers`,
        })

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
