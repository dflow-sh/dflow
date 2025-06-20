import configPromise from '@payload-config'
import { env } from 'env'
import { createSafeActionClient } from 'next-safe-action'
import { headers } from 'next/headers'
import { forbidden } from 'next/navigation'
import { getPayload } from 'payload'
import { z } from 'zod'

import { log } from '@/lib/logger'
import { Tenant } from '@/payload-types'

import { getTenant } from './get-tenant'

type UserTenant = {
  tenant: Tenant
  roles: ('tenant-admin' | 'tenant-user')[]
}

export const publicClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string({ message: 'actionName is required!' }),
    })
  },
  // Can also be an async function.
  handleServerError(error, utils) {
    // Log to console.
    console.error('Action error:', error.message)
    const { clientInput, metadata } = utils

    if (
      env.NEXT_PUBLIC_BETTER_STACK_INGESTING_URL &&
      env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN
    ) {
      log.error(error.message, {
        actionName: metadata?.actionName,
        clientInput,
        stack: error.stack,
        errorType: error.constructor.name,
      })
    }

    // Returning the error message instead of throwing it
    return error.message
  },
})

export const protectedClient = publicClient.use(async ({ next, ctx }) => {
  const headersList = await headers()
  const payload = await getPayload({
    config: configPromise,
  })

  // 1. checking for user
  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    throw Error('Unauthenticated')
  }

  // 2. checking for tenant slug
  const tenantSlug = await getTenant()

  if (!tenantSlug) {
    forbidden()
  }

  // 3. validating the tenant slug
  const { docs } = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: tenantSlug } },
  })

  const tenant = docs[0]

  if (!tenant) {
    forbidden()
  }

  const matchedTenantEntry = user?.tenants?.find(entry => {
    const tenantId =
      typeof entry.tenant === 'string' ? entry.tenant : entry.tenant.id
    return tenantId === tenant.id
  })

  if (!Boolean(matchedTenantEntry)) {
    forbidden()
  }

  return next({
    ctx: {
      ...ctx,
      payload,
      user,
      userTenant: matchedTenantEntry as UserTenant,
      isInTenant: Boolean(matchedTenantEntry),
    },
  })
})

export const userClient = publicClient.use(async ({ next, ctx }) => {
  const headersList = await headers()
  const payload = await getPayload({
    config: configPromise,
  })

  // 1. checking for user
  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    throw Error('Unauthenticated')
  }

  return next({
    ctx: {
      ...ctx,
      payload,
      user,
    },
  })
})
