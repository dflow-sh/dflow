'use server'

import axios from 'axios'
import { revalidatePath } from 'next/cache'

import { DFLOW_CONFIG } from '@/lib/constants'
import { protectedClient } from '@/lib/safe-action'

import {
  cloudProviderAccountsSchema,
  syncDflowServersSchema,
} from './validator'

export const getCloudProvidersAccountsAction = protectedClient
  .metadata({
    actionName: 'getCloudProvidersAccountsAction',
  })
  .schema(cloudProviderAccountsSchema)
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
  .schema(syncDflowServersSchema)
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

      // 1. Fetching all servers
      const ordersResponse = await axios.get(
        `${DFLOW_CONFIG.URL}/api/vpsOrders`,
        {
          headers: {
            Authorization: `${DFLOW_CONFIG.AUTH_SLUG} API-Key ${key}`,
          },
        },
      )

      // 2. Filtering orders to get only those with an IP address
      const orders = ordersResponse?.data?.docs || []

      const filteredOrders = orders.filter(
        (order: any) => order.instanceResponse?.ipConfig?.v4?.ip,
      )

      // 3. finding existing servers in the database with the same hostname
      const { docs: existingServers } = await payload.find({
        collection: 'servers',
        where: {
          hostname: {
            in: filteredOrders.map(
              (order: any) => order.instanceResponse.ipConfig.v4.ip,
            ),
          },
          'tenant.slug': {
            equals: userTenant.tenant?.slug,
          },
        },
      })

      // 4. filter the orders to only include those that are not already in the database
      const newOrders = filteredOrders.filter((order: any) => {
        return !existingServers.some(
          server => server.hostname === order.instanceResponse.name,
        )
      })

      if (newOrders.length === 0) {
        return { success: true, message: 'No new servers to sync.' }
      }

      // 5. Create new sshKey's, server's in the database for the new orders
      for await (const order of newOrders) {
        await payload.create({
          collection: 'servers',
          data: {
            name: `${order.instanceResponse.displayName}`,
            ip: `${order.instanceResponse.ipConfig.v4.ip}`,
            tenant: userTenant.tenant?.id,
            preferConnectionType: 'tailscale',
            cloudProviderAccount: id,
            port: 22, // Default port for SSH
            provider: 'dflow',
            username: `${order.instanceResponse.defaultUser}`,
            hostname: `${order.instanceResponse.name}`,
          },
        })
      }
    }

    revalidatePath(`${userTenant.tenant.slug}/servers`)
    return { success: true, message: 'Servers synced successfully.' }
  })
