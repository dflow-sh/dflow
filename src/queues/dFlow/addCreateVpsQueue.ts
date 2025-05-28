import configPromise from '@payload-config'
import axios from 'axios'
import { getPayload } from 'payload'

import { getQueue, getWorker } from '@/lib/bullmq'
import { DFLOW_CONFIG } from '@/lib/constants'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { SshKey, Tenant } from '@/payload-types'

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
        console.dir({ sshKeys }, { depth: Infinity })
        // step 1 & 2: creating secrets in dflow.sh and sshKeys in dFlow Cloud
        const secretsAndKeys = await Promise.all(
          sshKeys.map(async key => {
            const { data: createdSecretRes } = await axios.post(
              `${DFLOW_CONFIG.URL}/api/secrets`,
              {
                name: key.name,
                type: 'ssh',
                publicKey: key.publicKey,
                privateKey: key.privateKey,
              },
              {
                headers: {
                  Authorization: `${DFLOW_CONFIG.AUTH_SLUG} API-Key ${token}`,
                },
              },
            )

            const { doc: createdSecret } = createdSecretRes

            return {
              secretId: createdSecret.details.secretId,
              sshKeyId: key.id,
            }
          }),
        )

        const secretIds = secretsAndKeys.map(entry => entry.secretId)

        // step 3: create VPS in dflow.sh
        const vpsData = {
          plan: vps.plan,
          userData: {
            image: {
              imageId: vps.image.imageId,
              priceId: vps.image.priceId,
            },
            product: {
              productId: vps.product.productId,
              priceId: vps.product.priceId,
            },
            displayName: vps.displayName,
            region: {
              code: vps.region.code,
              priceId: vps.region.priceId,
            },
            card: '',
            defaultUser: vps.defaultUser,
            rootPassword: vps.rootPassword,
            period: {
              months: vps.period.months,
              priceId: vps.period.priceId,
            },
            sshKeys: secretIds,
            plan: vps.plan,
            addOns: vps.addOns || {},
          },
        }

        console.dir({ vpsData }, { depth: Infinity })

        const { data: createdVpsOrderRes } = await axios.post(
          `${DFLOW_CONFIG.URL}/api/vpsOrders`,
          vpsData,
          {
            headers: {
              Authorization: `${DFLOW_CONFIG.AUTH_SLUG} API-Key ${token}`,
            },
          },
        )

        console.dir({ createdVpsOrderRes }, { depth: Infinity })

        const { doc: createdVpsOrder } = createdVpsOrderRes

        // step 4: instantly creating a server in dFlow Cloud
        const createdServer = await payload.create({
          collection: 'servers',
          data: {
            name: vps.displayName,
            description: '',
            ip: '0.0.0.0',
            port: 22,
            username: 'root',
            sshKey: secretsAndKeys.at(0)?.sshKeyId as string,
            provider: 'dflow',
            tenant: data.tenant,
            cloudProviderAccount: accountDetails.id,
            dflowVpsDetails: {
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
          const currentStatus = createdServer?.dflowVpsDetails?.status
          const currentIP = createdServer?.ip

          const pollForPublicIP = async () => {
            for (let i = 0; i < 10; i++) {
              try {
                const { data: instanceStatusRes } = await axios.get(
                  `${DFLOW_CONFIG.URL}/api/vpsOrders?where[instanceId][equals]=${instanceId}`,
                  {
                    headers: {
                      Authorization: `${DFLOW_CONFIG.AUTH_SLUG} API-Key ${token}`,
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
                        dflowVpsDetails: {
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
                        dflowVpsDetails: {
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
