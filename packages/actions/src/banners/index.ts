import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { getTenant } from '@/lib/get-tenant'
import { getCurrentUser } from '@/lib/getCurrentUser'
import { publicClient } from '@/lib/safe-action'

export const getPublicBanners = publicClient
  .metadata({
    actionName: 'getPublicBanners',
  })
  .action(async () => {
    const payload = await getPayload({
      config: configPromise,
    })

    const now = new Date().toISOString()

    try {
      // Try to get authenticated user and tenant
      const user = await getCurrentUser()
      const tenantSlug = await getTenant()

      if (user && tenantSlug) {
        // User is authenticated - get both global and user-specific banners
        const { docs: banners } = await payload.find({
          collection: 'banners',
          pagination: false,
          where: {
            and: [
              {
                or: [
                  { scope: { equals: 'global' } },
                  { 'tenant.slug': { equals: tenantSlug } },
                ],
              },
              { isActive: { equals: true } },
              {
                or: [
                  { startDate: { equals: null } },
                  { startDate: { less_than_equal: now } },
                ],
              },
              {
                or: [
                  { endDate: { equals: null } },
                  { endDate: { greater_than_equal: now } },
                ],
              },
            ],
          },
        })
        return banners
      }
    } catch (error) {
      // User is not authenticated or error occurred - continue to fetch only global banners
    }

    // User is not authenticated - only get global banners
    const { docs: globalBanners } = await payload.find({
      collection: 'banners',
      pagination: false,
      where: {
        and: [
          { scope: { equals: 'global' } },
          { isActive: { equals: true } },
          {
            or: [
              { startDate: { equals: null } },
              { startDate: { less_than_equal: now } },
            ],
          },
          {
            or: [
              { endDate: { equals: null } },
              { endDate: { greater_than_equal: now } },
            ],
          },
        ],
      },
    })

    return globalBanners
  })
