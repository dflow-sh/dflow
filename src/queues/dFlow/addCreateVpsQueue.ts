import configPromise from '@payload-config'
import axios from 'axios'
import { Job } from 'bullmq'
import { env } from 'env'
import { getPayload } from 'payload'

import { getQueue, getWorker } from '@/lib/bullmq'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendEvent } from '@/lib/sendEvent'
import { Tenant } from '@/payload-types'

import { createdVpsOrderRes } from './data'

interface CreateVpsQueueArgs {
  sshKeys: {
    name: string
    publicSshKey: string
    privateSshKey: string
  }[]
  vps: {
    name: string
  }
  accountDetails: {
    id: string
    accessToken: string
  }
  tenant: Tenant
}

// Function to add a job to the create VPS queue
export const addCreateVpsQueue = async (data: CreateVpsQueueArgs) => {
  const QUEUE_NAME = `tenant-${data.tenant.slug}-create-vps`

  const createVpsQueue = getQueue({
    name: QUEUE_NAME,
    connection: queueConnection,
  })

  const worker = getWorker<CreateVpsQueueArgs>({
    name: QUEUE_NAME,
    processor: async job => {
      const { sshKeys, vps, accountDetails } = job.data
      const token = accountDetails.accessToken

      console.log('queue triggered...')

      try {
        const payload = await getPayload({ config: configPromise })
        sendEvent({
          pub,
          message: `Starting VPS creation process...`,
          serverId: data.tenant.slug,
        })

        // Create SSH Key
        sendEvent({
          pub,
          message: `Creating SSH key: ${sshKeys[0].name}...`,
          serverId: data.tenant.slug,
        })

        // const { data: createdSecretRes } = await axios.post(
        //   `${env.DFLOW_CLOUD_URL}/api/secrets`,
        //   {
        //     name: sshKeys[0].name,
        //     type: 'ssh',
        //     publicKey: sshKeys[0].publicSshKey,
        //   },
        //   {
        //     headers: {
        //       Authorization: `${env.DFLOW_CLOUD_AUTH_SLUG} API-Key ${token}`,
        //     },
        //   },
        // )

        // const { doc: createdSecret } = createdSecretRes

        const createdSshKey = await payload.create({
          collection: 'sshKeys',
          data: {
            name: sshKeys[0].name,
            privateKey: sshKeys[0].privateSshKey,
            publicKey: sshKeys[0].publicSshKey,
          },
        })

        sendEvent({
          pub,
          message: `✅ Successfully created SSH key: ${sshKeys[0].name}`,
          serverId: data.tenant.slug,
        })

        // Create VPS order
        sendEvent({
          pub,
          message: `Creating VPS: ${vps.name}...`,
          serverId: data.tenant.slug,
        })

        // const { data: createdVpsOrderRes } = await axios.post(
        //   `${env.DFLOW_CLOUD_URL}/api/vpsOrders`,
        //   {
        //     plan: '6821988ea2def4c82c86cf4f',
        //     userData: {
        //       image: {
        //         imageId: 'afecbb85-e2fc-46f0-9684-b46b1faf00bb',
        //         priceId: 'price_1R1VOXP2ZUGTn5p0TMvSrTTK',
        //       },
        //       product: {
        //         productId: 'V92',
        //         priceId: 'price_1RNq0hP2ZUGTn5p0eq28s0op',
        //       },
        //       displayName: vps.name,
        //       region: {
        //         code: 'EU',
        //         priceId: 'price_1R1VHbP2ZUGTn5p0FeXm5ykp',
        //       },
        //       card: '',
        //       defaultUser: 'root',
        //       rootPassword: 141086,
        //       period: {
        //         months: 1,
        //         priceId: 'price_1RNq7DP2ZUGTn5p00casstTj',
        //       },
        //       sshKeys: [createdSecret.details.secretId],
        //       plan: '6821988ea2def4c82c86cf4f',
        //       addOns: {},
        //     },
        //   },
        //   {
        //     headers: {
        //       Authorization: `${env.DFLOW_CLOUD_AUTH_SLUG} API-Key ${token}`,
        //     },
        //   },
        // )

        const { doc: createdVpsOrder } = createdVpsOrderRes

        sendEvent({
          pub,
          message: `✅ VPS order created successfully. Order ID: ${createdVpsOrder.id}`,
          serverId: data.tenant.slug,
        })

        const createdServer = await payload.create({
          collection: 'servers',
          data: {
            name: vps.name,
            description: '',
            ip: '',
            port: 22,
            username: 'root',
            sshKey: createdSshKey.id,
            provider: 'contentql',
            tenant: data.tenant,
            contentqlVpsDetails: {
              id: createdVpsOrder.id,
              instanceId: createdVpsOrder.instanceId,
              status: createdVpsOrder.instanceResponse.status as any,
            },
          },
        })

        // Add to global VPS status monitoring
        await addInstanceToStatusMonitoring(
          createdVpsOrder.instanceId,
          token,
          createdServer.id,
        )

        initializeVpsStatusChecker()

        sendEvent({
          pub,
          message: `VPS creation process initiated. Monitoring status...`,
          serverId: data.tenant.slug,
        })

        await pub.publish('refresh-channel', JSON.stringify({ refresh: true }))

        return { success: true, orderId: createdVpsOrder.id }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        throw new Error(`❌ Failed to create VPS: ${message}`)
      }
    },
    connection: queueConnection,
  })

  worker.on('failed', async (job: Job<CreateVpsQueueArgs> | undefined, err) => {
    if (job?.data) {
      sendEvent({
        pub,
        message: err.message,
        serverId: job.data.tenant.slug,
      })
    }
  })

  const id = `create-vps:${new Date().getTime()}`

  return await createVpsQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}

// Store instances being monitored
const monitoredInstances = new Map<
  number,
  {
    token: string
    serverId: string
  }
>()

// Function to add an instance to the status monitoring
export const addInstanceToStatusMonitoring = async (
  instanceId: number,
  token: string,
  serverId: string,
) => {
  if (!instanceId) return false

  monitoredInstances.set(instanceId, { token, serverId })
  return true
}

// Function to remove an instance from monitoring
export const removeInstanceFromMonitoring = (instanceId: number) => {
  return monitoredInstances.delete(instanceId)
}

// Function to check instance status
export const checkInstanceStatus = async () => {
  const payload = await getPayload({ config: configPromise })
  const checkedInstances = new Set<number>()

  // First, check any already monitored instances
  for (const [
    instanceId,
    { token, serverId },
  ] of monitoredInstances.entries()) {
    try {
      const { data: instanceStatusRes } = await axios.get(
        `${env.DFLOW_CLOUD_URL}/api/vpsOrders?where[instanceId][equals]=${instanceId}`,
        {
          headers: {
            Authorization: `${env.DFLOW_CLOUD_AUTH_SLUG} API-Key ${token}`,
          },
        },
      )

      const orders = instanceStatusRes?.docs || []
      if (orders.length === 0) {
        console.log(`No orders found for instance ${instanceId}`)
        continue
      }

      const order = orders[0]

      // Mark as checked
      checkedInstances.add(instanceId)

      // Send status update
      sendEvent({
        pub,
        message: `VPS Instance Status: ${order.instanceResponse.status}`,
        serverId,
      })

      // Get current server details to compare with new status
      const currentServer = await payload.findByID({
        collection: 'servers',
        id: serverId,
      })

      const currentStatus = currentServer?.contentqlVpsDetails?.status
      const newStatus = order.instanceResponse.status
      const newIp = order.instanceResponse?.ipConfig?.v4?.ip

      console.log({ currentStatus, newStatus, newIp })

      // Only update if status changed or if IP is now available
      if (currentStatus !== newStatus || (newIp && !currentServer.ip)) {
        // If the order is running and has an IP, update with IP
        if (newStatus === 'running' && newIp) {
          await payload.update({
            collection: 'servers',
            id: serverId,
            data: {
              ip: newIp,
              contentqlVpsDetails: {
                status: newStatus,
              },
            },
          })

          sendEvent({
            pub,
            message: `✅ VPS is now active with IP: ${newIp}`,
            serverId,
          })

          // Remove from monitoring once provisioned and IP is assigned
          monitoredInstances.delete(instanceId)
          await pub.publish(
            'refresh-channel',
            JSON.stringify({ refresh: true }),
          )
        }
        // Otherwise just update the status
        else {
          await payload.update({
            collection: 'servers',
            id: serverId,
            data: {
              contentqlVpsDetails: {
                status: newStatus,
              },
            },
          })

          // Only notify on status changes
          if (currentStatus !== newStatus) {
            sendEvent({
              pub,
              message: `VPS status changed to: ${newStatus}`,
              serverId,
            })
          }

          // Check for failed state or error conditions (looks like there was a missing condition in original code)
          if (order.status === 'failed' || order.status === 'error') {
            sendEvent({
              pub,
              message: `VPS creation ${order.status}: ${order.message || 'No details available'}`,
              serverId,
            })

            // Remove from monitoring once failed
            monitoredInstances.delete(instanceId)
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error(`Error checking instance ${instanceId}:`, message)

      // Don't remove from monitoring on temporary errors
      sendEvent({
        pub,
        message: `⚠️ Error checking VPS status: ${message}`,
        serverId,
      })
    }
  }

  // Check if we should stop the monitoring interval
  if (monitoredInstances.size === 0 && vpsMonitoringIntervalId) {
    clearInterval(vpsMonitoringIntervalId)
    vpsMonitoringIntervalId = null
    console.log(
      '✅ All VPS instances provisioned or failed. Stopping status monitoring.',
    )
  }
}

// Initialize the VPS status checker
export const initializeVpsStatusChecker = () => {
  console.log('⌛ Initializing VPS status checker - checking every 30 seconds')

  // Immediately check the first time
  checkInstanceStatus().catch(err => {
    console.error('Error in initial VPS status check:', err)
  })

  // Set up interval to check status every 30 seconds
  vpsMonitoringIntervalId = setInterval(() => {
    checkInstanceStatus().catch(err => {
      console.error('Error in periodic VPS status check:', err)
    })
  }, 30000) // 30 seconds

  // Function to manually check status (for testing)
  const manualCheck = async () => {
    await checkInstanceStatus()
  }

  return {
    intervalId: vpsMonitoringIntervalId,
    monitoredInstances,
    manualCheck,
    stopMonitoring: () => {
      if (vpsMonitoringIntervalId) {
        clearInterval(vpsMonitoringIntervalId)
        vpsMonitoringIntervalId = null
        console.log('Stopped VPS status monitoring')
      }
    },
  }
} // Global variable to store the monitoring interval
let vpsMonitoringIntervalId: NodeJS.Timeout | null = null
