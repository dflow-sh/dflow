'use server'

import { revalidatePath } from 'next/cache'

import { DFLOW_CONFIG } from '@/lib/constants'
import { dFlowRestSdk } from '@/lib/restSDK/utils'
import { protectedClient } from '@/lib/safe-action'
import { Server } from '@/payload-types'

import {
  cloudProviderAccountsSchema,
  syncDflowServersSchema,
} from "@core/actions/cloud/validator"

export const getCloudProvidersAccountsAction = protectedClient
  .metadata({
    actionName: 'getCloudProvidersAccountsAction',
  })
  .inputSchema(cloudProviderAccountsSchema)
  .action(async ({ clientInput, ctx }) => {
    const { type } = clientInput
    const { userTenant, payload } = ctx

    const { docs } = await payload.find({
      collection: 'cloudProviderAccounts',
      pagination: false,
      where: {
        and: [
          {
            type: {
              equals: type,
            },
          },
          {
            'tenant.slug': {
              equals: userTenant.tenant?.slug,
            },
          },
        ],
      },
    })

    return docs
  })

export const syncDflowServersAction = protectedClient
  .metadata({
    actionName: 'syncDflowServersAction',
  })
  .inputSchema(syncDflowServersSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id } = clientInput
    const { userTenant, payload } = ctx

    if (!DFLOW_CONFIG.URL || !DFLOW_CONFIG.AUTH_SLUG) {
      throw new Error('Environment variables configuration missing.')
    }

    const account = await payload.findByID({
      collection: 'cloudProviderAccounts',
      id,
    })

    if (account.type === 'dFlow') {
      const key = account?.dFlowDetails?.accessToken!

      const { docs: users } = await payload.find({
        collection: 'users',
        where: {
          username: {
            equals: userTenant.tenant.slug,
          },
        },
        select: {
          email: true,
        },
        depth: 1,
      })

      const tenantUserEmail = users[0].email

      // 1. Fetching all servers
      const { docs } = await dFlowRestSdk.find(
        {
          collection: 'vpsOrders',
          limit: 1000,
          pagination: false,
          where: {
            'user.email': {
              equals: tenantUserEmail,
            },
          },
        },
        {
          headers: {
            Authorization: `${DFLOW_CONFIG.AUTH_SLUG} API-Key ${key}`,
          },
        },
      )

      // 2. Filtering orders to get only those with an IP address
      const orders = docs || []

      const filteredOrders = orders.filter(
        (order: any) =>
          order.instanceResponse?.ipConfig?.v4?.ip &&
          order.instanceResponse?.osType === 'Linux', // Only include Linux OS types
      )

      // 3. finding existing servers in the database with the same hostname
      const { docs: existingServers } = await payload.find({
        collection: 'servers',
        where: {
          and: [
            {
              or: [
                {
                  hostname: {
                    in: filteredOrders.map(
                      (order: any) => order.instanceResponse.name,
                    ),
                  },
                },
                {
                  ip: {
                    in: filteredOrders.map(
                      (order: any) => order.instanceResponse.ipConfig.v4.ip,
                    ),
                  },
                },
              ],
            },
            {
              'tenant.slug': {
                equals: userTenant.tenant?.slug,
              },
            },
          ],
        },
      })

      // 4. filter the orders to only include those that are not already in the database
      const newOrders = filteredOrders.filter((order: any) => {
        return !existingServers.some(
          server =>
            server.hostname === order.instanceResponse.name ||
            server.ip === order.instanceResponse.ipConfig.v4.ip,
        )
      })

      if (newOrders.length === 0) {
        return { success: true, message: 'No new servers to sync.' }
      }

      // 5. Create new sshKey's, server's in the database for the new orders
      for await (const order of newOrders) {
        const instanceResponse = order?.instanceResponse as {
          displayName?: string
          ipConfig?: { v4?: { ip?: string } }
          defaultUser?: string
          name?: string
          status?: string
        }

        await payload.create({
          collection: 'servers',
          data: {
            name: `${instanceResponse?.displayName}`,
            ip: `${instanceResponse?.ipConfig?.v4?.ip}`,
            tenant: userTenant.tenant?.id,
            preferConnectionType: 'tailscale',
            cloudProviderAccount: id,
            port: 22, // Default port for SSH
            provider: 'dflow',
            username: `${instanceResponse?.defaultUser}`,
            hostname: `${instanceResponse?.name}`,
            dflowVpsDetails: {
              instanceId: order?.instanceId,
              orderId: order?.id,
              status: instanceResponse?.status as NonNullable<
                Server['dflowVpsDetails']
              >['status'],
              next_billing_date: order?.next_billing_date
                ? new Date(order?.next_billing_date).toISOString()
                : null,
            },
          },
        })
      }
    }

    revalidatePath(`${userTenant.tenant.slug}/servers`)
    return { success: true, message: 'Servers synced successfully.' }
  })
