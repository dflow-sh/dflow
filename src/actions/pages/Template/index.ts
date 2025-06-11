'use server'

import { protectedClient } from '@/lib/safe-action'

export const getTemplates = protectedClient
  .metadata({
    actionName: 'getServiceDetails',
  })
  .action(async ({ ctx }) => {
    const {
      userTenant: { tenant },
      payload,
    } = ctx
    const { docs: templates, totalDocs } = await payload.find({
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
