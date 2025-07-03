import { CollectionConfig } from 'payload'

import { isAdmin } from '@/payload/access/isAdmin'

export const Traefik: CollectionConfig = {
  slug: 'traefik',
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'service',
      relationTo: 'services',
      type: 'relationship',
      required: true,
      hasMany: false,
      admin: {
        description:
          'Add the service for which traefik-configuration relates to',
      },
    },
    {
      name: 'configuration',
      type: 'json',
      required: true,
    },
  ],
}
