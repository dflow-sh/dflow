import { encryptedField } from '@oversightstudio/encrypted-fields'
import { CollectionConfig } from 'payload'

import { isAdmin } from '@/payload/access/isAdmin'

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
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
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
      name: 'imageUrl',
      type: 'text',
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
            {
              label: 'Docker',
              value: 'docker',
            },
          ],
        },
        // {
        //   type: 'text',
        //   name: 'mountPath',
        //   label: 'Mount Path',
        //   admin: {
        //     description: 'Mount path to attach volume',
        //     condition: (data, siblingsData) => {
        //       return siblingsData.type !== 'database'
        //     },
        //   },
        // },
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
            {
              name: 'builder',
              type: 'select',
              options: [
                { label: 'Build packs (Default)', value: 'buildPacks' },
                { label: 'Railpack', value: 'railpack' },
                { label: 'Nixpacks', value: 'nixpacks' },
                { label: 'Dockerfile', value: 'dockerfile' },
                { label: 'Heroku build packs', value: 'herokuBuildPacks' },
              ],
              defaultValue: 'buildPacks',
            },
          ],
        },

        {
          type: 'group',
          name: 'databaseDetails',
          label: 'Database Details',
          admin: {
            description: 'select database you want',
            condition: (data, siblingsData) => {
              return siblingsData.type === 'database'
            },
          },
          fields: [
            {
              type: 'select',
              name: 'type',
              label: 'Database Type',
              required: true,
              options: [
                {
                  label: 'Postgres',
                  value: 'postgres',
                },
                {
                  label: 'MongoDB',
                  value: 'mongo',
                },
                {
                  label: 'MySQL',
                  value: 'mysql',
                },
                {
                  label: 'Redis',
                  value: 'redis',
                },
                {
                  label: 'MariaDB',
                  value: 'mariadb',
                },
              ],
            },
            {
              name: 'exposedPorts',
              type: 'text',
              hasMany: true,
            },
          ],
        },
        {
          label: 'Docker Details',
          type: 'collapsible',
          admin: {
            // dockerDetails will be considered if service-type is docker
            condition: (data, siblingsData) => {
              return siblingsData.type === 'docker'
            },
          },
          fields: [
            {
              name: 'dockerDetails',
              label: 'Docker Details',
              type: 'group',
              admin: {
                // dockerDetails will be considered if service-type is docker
                condition: (data, siblingsData) => {
                  return siblingsData.type === 'docker'
                },
              },
              fields: [
                {
                  name: 'url',
                  type: 'text',
                  admin: {
                    description:
                      'Enter the docker-registry URL: ghrc://contentql/pin-bolt:latest',
                  },
                },
                {
                  name: 'account',
                  type: 'relationship',
                  relationTo: 'dockerRegistries',
                  hasMany: false,
                },
                {
                  name: 'ports',
                  type: 'array',
                  fields: [
                    {
                      name: 'hostPort',
                      label: 'Host Port',
                      type: 'number',
                      required: true,
                    },
                    {
                      name: 'containerPort',
                      label: 'Container Port',
                      type: 'number',
                      required: true,
                    },
                    {
                      name: 'scheme',
                      label: 'Scheme',
                      type: 'select',
                      options: [
                        { label: 'http', value: 'http' },
                        { label: 'https', value: 'https' },
                      ],
                      required: true,
                      defaultValue: 'http',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'text',
          name: 'name',
          label: 'Name',
          required: true,
        },
        {
          type: 'textarea',
          name: 'description',
          label: 'Description',
        },
        {
          type: 'array',
          label: 'Volumes',
          name: 'volumes',
          fields: [
            {
              type: 'text',
              name: 'hostPath',
              label: 'Host Path',
              required: true,
            },
            {
              type: 'text',
              name: 'containerPath',
              label: 'Container Path',
              required: true,
            },
          ],
        },
        {
          name: 'variables',
          type: 'array',
          fields: [
            encryptedField({
              name: 'key',
              type: 'text',
              required: true,
            }),
            // Storing environment value format -> service-name converted to uppercase with underscore and _DB at ending -> PAYLOAD_MONGO_DB
            encryptedField({
              name: 'value',
              type: 'text',
              required: true,
            }),
          ],
        },
      ],
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      label: 'Is Template Published',
      defaultValue: false,
    },
    {
      type: 'text',
      name: 'publishedTemplateId',
      label: 'Template Id',
      admin: {
        condition: data => {
          return data.isPublished
        },
      },
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
