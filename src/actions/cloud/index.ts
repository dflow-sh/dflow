'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { protectedClient } from '@/lib/safe-action'

import { cloudProviderAccountsSchema } from './validator'

export const getCloudProvidersAccountsAction = protectedClient
  .metadata({
    actionName: 'getCloudProvidersAccountsAction',
  })
  .schema(cloudProviderAccountsSchema)
  .action(async ({ clientInput }) => {
    const { type } = clientInput
    const payload = await getPayload({ config: configPromise })

    const { docs } = await payload.find({
      collection: 'cloudProviderAccounts',
      pagination: false,
      where: {
        type: {
          equals: type,
        },
      },
    })

    return docs
  })
