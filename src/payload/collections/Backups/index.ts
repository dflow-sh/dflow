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
    {
      name: 'type',
      type: 'select',
      options: [
        {
          label: 'External',
          value: 'external',
        },
        {
          label: 'Internal',
          value: 'internal',
        },
      ],
    },
    {
      name: 'backupName',
      label: 'Backup Name',
      type: 'text',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        {
          label: 'Queued',
          value: 'queued',
        },
        {
          label: 'In Progress',
          value: 'in-progress',
        },
        {
          label: 'Failed',
          value: 'failed',
        },
        {
          label: 'Success',
          value: 'success',
        },
      ],
      required: true,
      defaultValue: 'queued',
    },
    {
      name: 'logs',
      type: 'json',
    },
  ],
}
