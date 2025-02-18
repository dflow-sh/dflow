import type { CollectionConfig } from 'payload'

import { attachDokkuDomain } from './hooks/attachDokkuDomain'
import { deleteDokkuDomain } from './hooks/deleteDokkuDomain'

export const Domains: CollectionConfig = {
  slug: 'domains',
  labels: {
    singular: 'Domain',
    plural: 'Domains',
  },
  access: {
    create: () => true,
    read: () => true,
    update: () => false,
    delete: () => false,
  },
  hooks: {
    afterChange: [attachDokkuDomain],
    afterDelete: [deleteDokkuDomain],
  },
  fields: [
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      required: true,
    },
    {
      name: 'hostName',
      type: 'text',
      required: true,
    },
    {
      name: 'certificateType',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Letsencrypt',
          value: 'letsencrypt',
        },
        {
          label: 'None',
          value: 'none',
        },
      ],
      defaultValue: 'none',
    },
    {
      name: 'autoRegenerateSSL',
      type: 'checkbox',
      required: true,
      defaultValue: false,
    },
  ],
}
