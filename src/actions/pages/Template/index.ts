'use server'

import { protectedClient } from '@/lib/safe-action'

export const getTemplatesAction = protectedClient
  .metadata({
    actionName: 'getTemplatesAction',
  })
  .action(async ({ ctx }) => {
    const {
      userTenant: { tenant },
      payload,
    } = ctx
    const { docs: templates } = await payload.find({
      collection: 'templates',
      pagination: false,
      sort: '-isPublished',
      where: {
        'tenant.slug': {
          equals: tenant.slug,
        },
      },
    })

    return templates
  })
