'use server'

import { revalidatePath } from 'next/cache'

import { protectedClient } from '@/lib/safe-action'

import { updatePermissionsSchema } from './validator'

export const getRolesAction = protectedClient
  .metadata({
    actionName: 'getRolesAction',
  })
  .action(async ({ ctx }) => {
    const {
      userTenant: { tenant },
      payload,
    } = ctx

    const { docs: roles } = await payload.find({
      collection: 'roles',
      where: {
        and: [
          {
            'tenant.slug': {
              equals: tenant.slug,
            },
          },
        ],
      },
    })

    return roles
  })

export const updateRolePermissionsAction = protectedClient
  .metadata({
    actionName: 'updateRolePermissionsAction',
  })
  .schema(updatePermissionsSchema)
  .action(async ({ ctx, clientInput }) => {
    const {
      userTenant: { tenant },
      payload,
    } = ctx

    const { id, Servers, projects, services } = clientInput

    const response = await payload.update({
      collection: 'roles',
      id: id,
      data: {
        services,
        Servers,
        projects,
      },
    })

    if (response) {
      revalidatePath(`/${tenant.slug}/team`)
    }
    return response
  })
