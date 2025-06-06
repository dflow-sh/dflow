'use server'

import { protectedClient } from '@/lib/safe-action'

export const getProjectsAndServers = protectedClient
  .metadata({
    actionName: 'getProjectsAndServers',
  })
  .action(async ({ ctx }) => {
    const {
      payload,
      userTenant: { tenant },
    } = ctx

    const [serversRes, projectsRes] = await Promise.all([
      payload.find({
        collection: 'servers',
        pagination: false,
        where: {
          and: [
            {
              'tenant.slug': {
                equals: tenant.slug,
              },
            },
            {
              onboarded: {
                equals: true,
              },
            },
          ],
        },
        select: {
          name: true,
          connection: true,
          onboarded: true,
          plugins: true,
        },
      }),
      payload.find({
        collection: 'projects',
        depth: 5,
        where: {
          'tenant.slug': {
            equals: tenant.slug,
          },
        },
        pagination: false,
      }),
    ])

    return { serversRes, projectsRes }
  })
