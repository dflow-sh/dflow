import { protectedClient } from '@/lib/safe-action'

export const getAllBanners = protectedClient
  .metadata({
    actionName: 'getAllBanners',
  })
  .action(async ({ ctx }) => {
    const { payload, userTenant } = ctx

    const now = new Date().toISOString()

    const { docs: banners } = await payload.find({
      collection: 'banners',
      pagination: false,
      where: {
        and: [
          {
            or: [
              { scope: { equals: 'global' } },
              { 'tenant.slug': { equals: userTenant.tenant?.slug } },
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
  })
