import { CollectionBeforeChangeHook } from 'payload'

import { User } from '@/payload-types'

// Adding onboarding variable to true even if single user is already onboarded
export const beforeCreateHandleOnboarding: CollectionBeforeChangeHook<
  User
> = async ({ operation, req: { payload }, data }) => {
  if (operation === 'create') {
    const { totalDocs } = await payload.count({
      collection: 'users',
      where: {
        onboarded: {
          equals: true,
        },
      },
    })

    if (totalDocs > 0) {
      return { ...data, onboarded: true }
    }
  }

  return data
}
