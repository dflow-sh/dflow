import type { CollectionConfig } from 'payload'

import { isDemoEnvironment } from '@/lib/constants'

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
  },
  fields: [
    {
      name: 'onboarded',
      type: 'checkbox',
      label: 'Onboarded',
      defaultValue: false,
    },
  ],
}
