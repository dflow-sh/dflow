import type { CollectionConfig, Config } from 'payload'

export const createWebhooksCollection = (config: Config): CollectionConfig => {
  // Extract all collection slugs dynamically
  const collectionOptions =
    config.collections?.map(collection => ({
      label: collection.slug
        .split(/(?=[A-Z])/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      value: collection.slug,
    })) || []

  // Extract all global slugs dynamically
  const globalOptions =
    config.globals?.map(global => ({
      label: global.slug
        .split(/(?=[A-Z])/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      value: global.slug,
    })) || []

  return {
    slug: 'webhooks',
    admin: {
      useAsTitle: 'name',
      defaultColumns: ['name', 'url', 'isActive', 'events'],
    },
    access: {
      read: ({ req: { user } }) => Boolean(user?.role?.includes('admin')),
      create: ({ req: { user } }) => Boolean(user?.role?.includes('admin')),
      update: ({ req: { user } }) => Boolean(user?.role?.includes('admin')),
      delete: ({ req: { user } }) => Boolean(user?.role?.includes('admin')),
    },
    fields: [
      {
        name: 'name',
        type: 'text',
        required: true,
      },
      {
        name: 'url',
        type: 'text',
        required: true,
        validate: (value: unknown): true | string => {
          if (typeof value !== 'string') {
            return 'URL must be a string'
          }
          try {
            new URL(value)
            return true
          } catch {
            return 'Please enter a valid URL'
          }
        },
      },
      {
        name: 'events',
        type: 'select',
        hasMany: true,
        required: true,
        options: [
          { label: 'Create', value: 'create' },
          { label: 'Update', value: 'update' },
          { label: 'Delete', value: 'delete' },
        ],
      },
      {
        name: 'collections',
        type: 'select',
        hasMany: true,
        admin: {
          description: 'Select which collections should trigger this webhook',
        },
        options: collectionOptions,
      },
      {
        name: 'globals',
        type: 'select',
        hasMany: true,
        admin: {
          description: 'Select which globals should trigger this webhook',
        },
        options: globalOptions,
      },
      {
        name: 'isActive',
        type: 'checkbox',
        defaultValue: true,
      },
      {
        name: 'secret',
        type: 'text',
        admin: {
          description:
            'Optional signing secret. When provided, dFlow will sign each webhook request with HMAC-SHA256 and include the signature in the X-dFlow-Signature header for verification.',
        },
      },
      {
        name: 'headers',
        type: 'array',
        fields: [
          {
            name: 'key',
            type: 'text',
            required: true,
          },
          {
            name: 'value',
            type: 'text',
            required: true,
          },
        ],
      },
    ],
  }
}
