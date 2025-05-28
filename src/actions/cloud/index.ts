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

      console.dir({ ordersResponse: ordersResponse?.data }, { depth: null })

      // 2. Filtering orders to get only those with an IP address
      const orders = ordersResponse?.data?.docs || []

      const filteredOrders = orders.filter(
        (order: any) => order.instanceResponse?.ipConfig?.v4?.ip,
      )

      console.dir({ filteredOrders }, { depth: null })

      // 3. finding existing servers in the database with the same IP
      const { docs: existingServers } = await payload.find({
        collection: 'servers',
        where: {
          ip: {
            in: filteredOrders.map(
              (order: any) => order.instanceResponse.ipConfig.v4.ip,
            ),
          },
          'tenant.slug': {
            equals: userTenant.tenant?.slug,
          },
        },
      })

      console.dir({ existingServers }, { depth: null })

      // 4. filter the orders to only include those that are not already in the database
      const newOrders = filteredOrders.filter((order: any) => {
        return !existingServers.some(
          server => server.ip === order.instanceResponse.ipConfig.v4.ip,
        )
      })

      console.dir({ newOrders }, { depth: null })

      if (newOrders.length === 0) {
        return { success: true, message: 'No new servers to sync.' }
      }

      // 5. fetch all secrets to attach to the servers
      const secretsResponse = await axios.get(
        `${DFLOW_CONFIG.URL}/api/secrets`,
        {
          headers: {
            Authorization: `${DFLOW_CONFIG.AUTH_SLUG} API-Key ${key}`,
          },
        },
      )

      console.dir({ secretsResponse: secretsResponse?.data }, { depth: null })

      const secrets = secretsResponse?.data?.docs || []

      // 5. Create new sshKey's, server's in the database for the new orders
      for await (const order of newOrders) {
        // Find the secret for the server
        const filteredSecrets = secrets.find((s: any) => {
          const instanceSecretKeyList = order.instanceResponse.sshKeys || []

          return (
            instanceSecretKeyList.includes(s?.details?.secretId) &&
            s?.type === 'ssh'
          )
        })

        console.dir({ filteredSecrets }, { depth: null })

        const sshKey = filteredSecrets

        if (!sshKey) {
          // If no SSH key is found, skip creating the server
          continue
        }

        // Check if the SSH key already exists in the database
        const { docs: existingSSHKeyList } = await payload.find({
          collection: 'sshKeys',
          where: {
            'tenant.slug': {
              equals: userTenant.tenant?.slug,
            },
          },
          pagination: false,
        })

        const existingSSHKeyResponse = existingSSHKeyList.filter(key => {
          const tenantID =
            key.tenant && typeof key.tenant === 'object'
              ? key.tenant.id
              : key.tenant
          return (
            key.publicKey === sshKey?.publicKey &&
            tenantID === userTenant.tenant?.id
          )
        })

        let sshKeyID = ''

        console.dir({ existingSSHKeyResponse }, { depth: null })

        if (existingSSHKeyResponse?.[0]?.id) {
          sshKeyID = existingSSHKeyResponse[0].id
        }
        // if the SSH key does not exist, create a new one
        else {
          const sshKeyResponse = await payload.create({
            collection: 'sshKeys',
            data: {
              name: sshKey?.name,
              publicKey: sshKey?.publicKey,
              privateKey: sshKey?.privateKey,
              tenant: userTenant.tenant?.id,
            },
          })

          sshKeyID = sshKeyResponse.id
        }

        await payload.create({
          collection: 'servers',
          data: {
            name: `${order.instanceResponse.displayName}`,
            ip: `${order.instanceResponse.ipConfig.v4.ip}`,
            tenant: userTenant.tenant?.id,
            cloudProviderAccount: id,
            port: 22, // Default port for SSH
            provider: 'dflow',
            username: `${order.instanceResponse.defaultUser}`,
            sshKey: sshKeyID,
          },
        })
      }
    }

    revalidatePath(`${userTenant.tenant.slug}/servers`)
    return { success: true, message: 'Servers synced successfully.' }
  })
