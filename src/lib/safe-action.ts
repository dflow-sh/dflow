import configPromise from '@payload-config'
import { createSafeActionClient } from 'next-safe-action'
import { headers } from 'next/headers'
import { forbidden } from 'next/navigation'
import { getPayload } from 'payload'
import { z } from 'zod'

import { log } from '@/lib/logger'
import { Role, Tenant } from '@/payload-types'

import { getTenant } from './get-tenant'
import { assertRolePermission } from './permissions/utils'

type UserTenant = {
  tenant: Tenant
  role: Role
}

export const publicClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string({ message: 'actionName is required!' }),
    })
  },
  // Can also be an async function.
  async handleServerError(error, utils) {
    const headersList = await headers()
    // Log to console.
    // console.error(`Action error: ${utils.metadata.actionName}`, error.message)
    const { clientInput, metadata, ctx } = utils

    log.error(
      error.message,
      {
        actionName: metadata?.actionName,
        clientInput,
        stack: error.stack,
        errorType: error.constructor.name,
      },
      { hideInConsole: false },
    )

    // Returning the error message instead of throwing it
    return error.message
  },
})

export const protectedClient = publicClient.use(
  async ({ next, ctx, metadata }) => {
    const headersList = await headers()
    const payload = await getPayload({
      config: configPromise,
    })

    // 1. checking for user
    const { user } = await payload.auth({ headers: headersList })

    if (!user) {
      throw Error('Unauthenticated')
    }

    log.info(
      `Running protected action: ${metadata?.actionName} by ${user?.username}`,
      {
        actionName: metadata?.actionName,
        userId: user?.id,
        userEmail: user?.email,
        userName: user?.username,
      },
      { hideInConsole: false },
    )

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

    const role = matchedTenantEntry?.role

    assertRolePermission(role as Role, metadata.actionName as any)

    return next({
      ctx: {
        ...ctx,
        payload,
        user,
        userTenant: matchedTenantEntry as UserTenant,
        isInTenant: Boolean(matchedTenantEntry),
      },
    })
  },
)

export const userClient = publicClient.use(async ({ next, ctx, metadata }) => {
  const headersList = await headers()
  const payload = await getPayload({
    config: configPromise,
  })

  // 1. checking for user
  const { user } = await payload.auth({ headers: headersList })

  log.info(
    `Running public action: ${metadata?.actionName} by ${user?.username}`,
    {
      actionName: metadata?.actionName,
      userId: user?.id,
      userEmail: user?.email,
      userName: user?.username,
      headers: Object.fromEntries(headersList.entries()),
    },
    { hideInConsole: false },
  )

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
