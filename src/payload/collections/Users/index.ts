import type { CollectionConfig } from 'payload'

import { isDemoEnvironment } from '@/lib/constants'
import { isAdmin } from '@/payload/access/isAdmin'

import { beforeCreateHandleOnboarding } from './hooks/beforeCreateHandleOnboarding'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7,
  },
  hooks: {
    beforeChange: [beforeCreateHandleOnboarding],
  },
  access: {
    admin: ({ req }) => {
      return !Boolean(isDemoEnvironment)
    },
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    unlock: isAdmin,
  },
  fields: [
    {
      name: 'onboarded',
      type: 'checkbox',
      label: 'Onboarded',
      defaultValue: false,
    },
    {
      name: 'role',
      type: 'select',
      options: ['admin', 'user', 'demo'],
      hasMany: true,
      saveToJWT: true,
      defaultValue: 'user',
    },
  ],
}
