import { CollectionBeforeChangeHook } from 'payload'

import { User } from '@/payload-types'

export const handleUserRoles: CollectionBeforeChangeHook<User> = async ({
  data,
  req,
  operation,
}) => {
  const { payload, context, user } = req

  if (context?.preventRoleOverride) {
    return data
  }

  if (operation === 'create') {
    const { totalDocs: totalUsers } = await payload.count({
      collection: 'users',
      where: {
        role: {
          equals: 'admin',
        },
      },
    })

    if (totalUsers === 0) {
      return { ...data, role: ['admin'] }
    }

    if (!user?.role?.includes('admin') && data.role?.includes('admin')) {
      const formattedRoles = (data.role || []).filter(
        (role: string) => role !== 'admin',
      )

      return {
        ...data,
        role: formattedRoles.length === 0 ? ['user'] : formattedRoles,
      }
    }
  }

  return data
}
