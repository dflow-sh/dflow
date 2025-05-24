import configPromise from '@payload-config'
import axios from 'axios'
import { env } from 'env'
import { getPayload } from 'payload'

import { getQueue, getWorker } from '@/lib/bullmq'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { Tenant } from '@/payload-types'

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

  getWorker<CreateVpsQueueArgs>({
    name: QUEUE_NAME,
    processor: async job => {
      const { sshKeys, vps, accountDetails } = job.data
      const token = accountDetails.accessToken

      const payload = await getPayload({ config: configPromise })

      console.log('worker triggered...')

      try {
        // step 1: creating secret in contentql
        const { data: createdSecretRes } = await axios.post(
          `${env.DFLOW_CLOUD_URL}/api/secrets`,
          {
            name: sshKeys[0].name,
            type: 'ssh',
            publicKey: sshKeys[0].publicSshKey,
          },
          {
            headers: {
              Authorization: `${env.DFLOW_CLOUD_AUTH_SLUG} API-Key ${token}`,
            },
          },
        )

        const { doc: createdSecret } = createdSecretRes

        // step 2: creating same sshKey in dflow
        const createdSshKey = await payload.create({
          collection: 'sshKeys',
          data: {
            name: sshKeys[0].name,
            privateKey: sshKeys[0].privateSshKey,
            publicKey: sshKeys[0].publicSshKey,
            tenant: data.tenant,
          },
        })

        // step 3: create VPS in contentql
        const { data: createdVpsOrderRes } = await axios.post(
          `${env.DFLOW_CLOUD_URL}/api/vpsOrders`,
          {
            plan: '6821988ea2def4c82c86cf4f',
            userData: {
              image: {
                imageId: 'afecbb85-e2fc-46f0-9684-b46b1faf00bb',
                priceId: 'price_1R1VOXP2ZUGTn5p0TMvSrTTK',
              },
              product: {
                productId: 'V92',
                priceId: 'price_1RNq0hP2ZUGTn5p0eq28s0op',
              },
              displayName: vps.name,
              region: {
                code: 'EU',
                priceId: 'price_1R1VHbP2ZUGTn5p0FeXm5ykp',
              },
              card: '',
              defaultUser: 'root',
              rootPassword: 141086,
              period: {
                months: 1,
                priceId: 'price_1RNq7DP2ZUGTn5p00casstTj',
              },
              sshKeys: [createdSecret.details.secretId],
              plan: '6821988ea2def4c82c86cf4f',
              addOns: {},
            },
          },
          {
            headers: {
              Authorization: `${env.DFLOW_CLOUD_AUTH_SLUG} API-Key ${token}`,
            },
          },
        )

        console.dir({ createdVpsOrderRes }, { depth: Infinity })

        const { doc: createdVpsOrder } = createdVpsOrderRes

        // step 4: instantly creating a server in dFlow
        const createdServer = await payload.create({
          collection: 'servers',
          data: {
            name: vps.name,
            description: '',
            ip: '0.0.0.0',
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

        console.dir({ createdServer }, { depth: Infinity })

        // step 5: wait for public-ip address for 5mins
        if (createdServer) {
          const instanceId = createdVpsOrder.instanceId
          const serverId = createdServer.id
          const currentStatus = createdServer?.contentqlVpsDetails?.status
          const currentIP = createdServer?.ip

          const pollForPublicIP = async () => {
            for (let i = 0; i < 10; i++) {
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

                const newStatus = order.instanceResponse.status
                const newIp = order.instanceResponse?.ipConfig?.v4?.ip

                console.log({ currentStatus, newStatus, newIp })

                // Only update if status changed or if IP is now available
                if (currentStatus !== newStatus || (newIp && !currentIP)) {
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
                    console.log(`VPS status changed to: ${newStatus}`, {
                      currentStatus,
                      newStatus,
                    })

                    // Check for failed state or error conditions (looks like there was a missing condition in original code)
                    if (order.status === 'failed' || order.status === 'error') {
                      console.log(
                        `VPS creation ${order.status}: ${order.message || 'No details available'}`,
                      )
                    }
                  }
                }
              } catch (error) {
                const message =
                  error instanceof Error ? error.message : 'Unknown error'
                console.error(`Error checking instance ${instanceId}:`, message)
              }

              await new Promise(r => setTimeout(r, 30000))
            }

            throw new Error('Public IP not assigned yet after waiting')
          }

          await pollForPublicIP()
        }

        // todo: create a common method for refresh events!
        // sending path, tenant to redirect on client side
        await pub.publish(
          'refresh-channel',
          JSON.stringify({
            path: `/${data.tenant.slug}/servers`,
            tenant: data.tenant.slug,
          }),
        )

        return { success: true, orderId: createdVpsOrder.id }
      } catch (error) {
        // const message = error instanceof Error ? error.message : 'Unknown error'
        // throw new Error(`❌ Failed to create VPS: ${message}`)
        console.log('error', error)
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
