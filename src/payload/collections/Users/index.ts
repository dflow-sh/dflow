import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7,
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
