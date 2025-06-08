import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/payload/access/isAdmin'

export const Deployments: CollectionConfig = {
  slug: 'deployments',
  labels: {
    singular: 'Deployment',
    plural: 'Deployments',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    readVersions: isAdmin,
  },
  defaultPopulate: {
    name: true,
    status: true,
  },
  admin: {
    defaultColumns: ['service', 'status', 'createdAt', 'updatedAt'],
  },
  fields: [
    {
      name: 'service',
      relationTo: 'services',
      type: 'relationship',
      required: true,
      hasMany: false,
      admin: {
        description: 'Adding the service for which deployment is related to',
      },
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
          label: 'Building',
          value: 'building',
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
