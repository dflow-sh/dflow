import { CollectionConfig } from 'payload'

export const Template: CollectionConfig = {
  slug: 'templates',
  labels: {
    singular: 'Template',
    plural: 'Templates',
  },
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    update: () => true,
    delete: () => true,
    create: () => true,
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      type: 'textarea',
      name: 'description',
    },
    {
      type: 'array',
      name: 'services',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            {
              label: 'App',
              value: 'app',
            },
            {
              label: 'Database',
              value: 'database',
            },
          ],
        },
        {
          type: 'text',
          name: 'mountPath',
          label: 'Mount Path',
          admin: {
            description: 'Mount path to attach volume',
            condition: (data, siblingsData) => {
              return siblingsData.type !== 'database'
            },
          },
        },
        {
          label: 'App Details',
          type: 'collapsible',
          admin: {
            // App settings field will be considered if service-type is app
            condition: (data, siblingsData) => {
              if (siblingsData.type === 'app') {
                return true
              }
              return false
            },
          },
          fields: [
            {
              name: 'provider',
              type: 'relationship',
              relationTo: 'gitProviders',
              hasMany: false,
            },
            {
              name: 'providerType',
              type: 'select',
              options: [
                {
                  label: 'Github',
                  value: 'github',
                },
                {
                  label: 'Gitlab',
                  value: 'gitlab',
                },
                {
                  label: 'Bitbucket',
                  value: 'bitbucket',
                },
              ],
            },
            {
              name: 'githubSettings',
              type: 'group',
              admin: {
                // App settings field will be considered if service-type is app
                condition: (data, siblingsData) => {
                  if (siblingsData.providerType === 'github') {
                    return true
                  }
                  return false
                },
              },
              fields: [
                {
                  name: 'repository',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'owner',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'branch',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'buildPath',
                  type: 'text',
                  required: true,
                  defaultValue: '/',
                },
                {
                  name: 'port',
                  type: 'number',
                  defaultValue: 3000,
                },
              ],
            },
          ],
        },

        {
          type: 'select',
          name: 'databaseType',
          label: 'Database Type',
          required: true,
          options: [
            {
              label: 'MongoDB',
              value: 'MONGODB',
            },
            {
              label: 'Redis',
              value: 'REDIS',
            },
            {
              label: 'MySQL',
              value: 'MYSQL',
            },
            {
              label: 'PostgreSQL',
              value: 'POSTGRESQL',
            },
            {
              label: 'MariaDB',
              value: 'MARIADB',
            },
          ],
          admin: {
            description: 'select database you want',
            condition: (data, siblingsData) => {
              return siblingsData.type === 'database'
            },
          },
        },
        {
          type: 'text',
          name: 'name',
          label: 'Name',
        },
        {
          name: 'variables',
          label: 'Environment Variables',
          type: 'array',
          fields: [
            {
              name: 'key',
              label: 'Key',
              type: 'text',
              required: true,
            },
            {
              name: 'value',
              label: 'Value',
              type: 'text',
            },
          ],
        },
      ],
    },
    // {
    //   name: 'content',
    //   label: 'Content',
    //   type: 'richText',
    //   admin: {
    //     description: 'This content will be shown in the themes page',
    //   },
    // },
    // {
    //   name: 'downloads',
    //   label: 'Downloads',
    //   type: 'number',
    //   defaultValue: 0,
    //   admin: {
    //     position: 'sidebar',
    //     description: 'downloads of the template',
    //   },
    // },
  ],
}
