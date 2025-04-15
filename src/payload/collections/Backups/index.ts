import { CollectionConfig } from 'payload'

export const Backups: CollectionConfig = {
  slug: 'backups',
  labels: {
    singular: 'Backup',
    plural: 'Backups',
  },
  access: {
    create: () => false,
    read: () => false,
    update: () => false,
    delete: () => false,
  },
  hooks: {},
  fields: [
    {
      name: 'service',
      relationTo: 'services',
      type: 'relationship',
      required: true,
      hasMany: false,
      admin: {
        description: 'Adding the service for which backup is related to',
      },
    },
  ],
}
