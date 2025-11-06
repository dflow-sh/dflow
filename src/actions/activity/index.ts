'use server'

import { z } from 'zod'

import { protectedClient } from '@/lib/safe-action'

export const getActivitiesAction = protectedClient
  .metadata({ actionName: 'getActivitiesAction' })
  .inputSchema(
    z.object({
      limit: z.number().default(50),
      page: z.number().default(1),
    }),
  )
  .action(async ({ clientInput, ctx }) => {
    const { limit, page } = clientInput
    const { user, payload } = ctx

    const { docs, totalDocs, hasNextPage } = await payload.find({
      collection: 'activity',
      where: {
        user: {
          equals: user.id,
        },
      },
      sort: '-createdAt',
      limit,
      page,
    })

    return {
      activities: docs,
      total: totalDocs,
      hasNextPage,
      page,
    }
  })

export const getActivitiesByCategoryAction = protectedClient
  .metadata({ actionName: 'getActivitiesByCategoryAction' })
  .inputSchema(
    z.object({
      category: z.string(),
      limit: z.number().default(50),
      page: z.number().default(1),
    }),
  )
  .action(async ({ clientInput, ctx }) => {
    const { category, limit, page } = clientInput
    const { user, payload } = ctx

    const { docs, totalDocs, hasNextPage } = await payload.find({
      collection: 'activity',
      where: {
        and: [
          {
            user: {
              equals: user.id,
            },
          },
          {
            category: {
              equals: category,
            },
          },
        ],
      },
      sort: '-createdAt',
      limit,
      page,
    })

    return {
      activities: docs,
      total: totalDocs,
      hasNextPage,
      category,
    }
  })

export const getActivityCategoriesAction = protectedClient
  .metadata({ actionName: 'getActivityCategoriesAction' })
  .action(async ({ ctx }) => {
    const { user, payload } = ctx

    const { docs } = await payload.find({
      collection: 'activity',
      where: {
        user: {
          equals: user.id,
        },
      },
      limit: 10000,
    })

    const categories = Array.from(
      new Set(
        docs
          .map((doc: any) => doc.category)
          .filter(c => c !== null && c !== undefined),
      ),
    ).sort() as string[]

    return categories
  })

export const getActivityStatsAction = protectedClient
  .metadata({ actionName: 'getActivityStatsAction' })
  .action(async ({ ctx }) => {
    const { user, payload } = ctx

    const { docs, totalDocs } = await payload.find({
      collection: 'activity',
      where: {
        user: {
          equals: user.id,
        },
      },
      limit: 10000,
    })

    const stats = {
      total: totalDocs,
      byStatus: {
        success: docs.filter((d: any) => d.status === 'success').length,
        failed: docs.filter((d: any) => d.status === 'failed').length,
        pending: docs.filter((d: any) => d.status === 'pending').length,
      },
      bySeverity: {
        info: docs.filter((d: any) => d.severity === 'info').length,
        warning: docs.filter((d: any) => d.severity === 'warning').length,
        error: docs.filter((d: any) => d.severity === 'error').length,
        critical: docs.filter((d: any) => d.severity === 'critical').length,
      },
      lastActivity: docs[0]?.createdAt || null,
    }

    return stats
  })
