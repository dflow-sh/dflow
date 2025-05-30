'use server'

import { revalidatePath } from 'next/cache'

import { protectedClient } from '@/lib/safe-action'
import { Tenant } from '@/payload-types'

import { updateTenantRolesSchema } from './validator'

export const getTeamMembersAction = protectedClient
  .metadata({ actionName: 'getTeamMembersAction' })
  .action(async ({ ctx }) => {
    const { payload, user } = ctx
    const { userTenant } = ctx

    const response = await payload.find({
      collection: 'users',
      pagination: false,
      depth: 10,
      where: {
        and: [
          {
            'tenants.tenant': {
              in: [userTenant.tenant.id],
            },
          },
        ],
      },
    })
    return response.docs
  })

export const updateUserTenantRoles = protectedClient
  .metadata({
    actionName: 'updateUserTenantRoles',
  })
  .schema(updateTenantRolesSchema)
  .action(async ({ ctx, clientInput }) => {
    const {
      payload,
      userTenant: { tenant },
    } = ctx
    const { roles, user } = clientInput
    const response = await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        tenants: [
          ...(user?.tenants || [])?.map((tenantData: any) => {
            if ((tenantData.tenant as Tenant).slug == tenant.slug) {
              return { ...tenantData, roles: roles }
            }
            return tenantData
          }),
        ],
      },
    })
    if (response) {
      revalidatePath(`/${tenant.slug}/team`)
    }

    return response
  })

export const removeUserFromTeamAction = protectedClient
  .metadata({
    actionName: 'removeUserFromTeamAction',
  })
  .schema(updateTenantRolesSchema)
  .action(async ({ ctx, clientInput }) => {
    const {
      payload,
      userTenant: { tenant },
    } = ctx
    const { user } = clientInput
    const updatedTenants = (user?.tenants || []).filter((tenantData: any) => {
      return (tenantData.tenant as Tenant).slug !== tenant.slug
    })
    const response = await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        tenants: updatedTenants,
      },
    })
    if (response) {
      revalidatePath(`/${tenant.slug}/team`)
    }

    return response
  })
