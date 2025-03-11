import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'onboarded',
      type: 'checkbox',
      label: 'Onboarded',
      required: true,
    },
  ],
}
