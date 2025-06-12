import { protectedClient } from '@/lib/safe-action'

export const getAllBanners = protectedClient
  .metadata({
    actionName: 'getAllBanners',
  })
  .action(async ({ ctx }) => {
    const { payload, userTenant } = ctx

    const { docs: banners } = await payload.find({
      collection: 'banners',
      pagination: false,
      where: {
        or: [
          {
            scope: {
              equals: 'global',
            },
          },
          {
            'tenant.slug': {
              equals: userTenant.tenant?.slug,
            },
          },
        ],
        and: [
          {
            isActive: {
              equals: true,
            },
          },
        ],
      },
    })

    return banners
  })
