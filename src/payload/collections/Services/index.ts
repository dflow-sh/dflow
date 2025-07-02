import { encryptedField } from '@oversightstudio/encrypted-fields'
import { CollectionConfig, Field } from 'payload'

import { databaseOptions } from '@/lib/constants'
import { isAdmin } from '@/payload/access/isAdmin'

const databaseField: Field = {
  label: 'Database Details',
  type: 'collapsible',
  admin: {
    // databaseDetails will be considered if service-type is database
    condition: data => {
      if (data.type === 'database') {
        return true
      }
      return false
    },
  },
  fields: [
    {
      name: 'databaseDetails',
      label: 'Database Details',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'select',
          options: databaseOptions,
        },
        {
          name: 'username',
          type: 'text',
        },
        {
          name: 'password',
          type: 'text',
        },
        {
          name: 'host',
          type: 'text',
        },
        {
          name: 'port',
          type: 'text',
        },
        {
          name: 'connectionUrl',
          type: 'text',
        },
        {
          name: 'version',
          type: 'text',
        },
        {
          name: 'status',
          type: 'select',
          options: [
            {
              label: 'Running',
              value: 'running',
            },
            {
              label: 'Missing',
              value: 'missing',
            },
            {
              label: 'Exited',
              value: 'exited',
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
  ],
}

const applicationField: Field = {
  label: 'App Details',
  type: 'collapsible',
  admin: {
    // App settings field will be considered if service-type is app
    condition: data => {
      if (data.type === 'app') {
        return true
      }
      return false
    },
  },
  fields: [
    // if git-provider is added we'll deploy app from github-app, else we'll treat as public repository
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
        condition: data => {
          if (data.providerType === 'github') {
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
}

const dockerField: Field = {
  label: 'Docker Details',
  type: 'collapsible',
  admin: {
    // dockerDetails will be considered if service-type is docker
    condition: data => {
      if (data.type === 'docker') {
        return true
      }
      return false
    },
  },
  fields: [
    {
      name: 'dockerDetails',
      label: 'Docker Details',
      type: 'group',
      admin: {
        // dockerDetails will be considered if service-type is docker
        condition: data => {
          if (data.type === 'docker') {
            return true
          }

          return false
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
}

export const Services: CollectionConfig = {
  slug: 'services',
  labels: {
    singular: 'Service',
    plural: 'Services',
  },
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    readVersions: isAdmin,
  },

  fields: [
    {
      name: 'project',
      type: 'relationship',
      label: 'Project',
      relationTo: 'projects',
      required: true,
      access: {
        update: () => false,
      },
      admin: {
        position: 'sidebar',
        description: 'Select the project associated with this service.',
      },
    },
    {
      name: 'backup',
      type: 'relationship',
      label: 'Backup',
      relationTo: 'backups',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'name',
      type: 'text',
      label: 'Name',
      required: true,
      admin: {
        description: 'Enter the name of the service.',
        placeholder: 'e.g., test-service',
      },
      // hooks: {
      //   beforeValidate: [ensureUniqueName],
      // },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Provide a brief description of the service.',
        placeholder: 'test-service database',
      },
    },
    {
      name: 'type',
      type: 'select',
      label: 'Type',
      required: true,
      options: [
        { label: 'Database', value: 'database' },
        { label: 'App', value: 'app' },
        { label: 'Docker', value: 'docker' },
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
        {
          type: 'checkbox',
          label: 'Created',
          name: 'created',
        },
      ],
    },
    encryptedField({
      name: 'populatedVariables',
      type: 'json',
    }),
    // Builder settings
    {
      name: 'builder',
      type: 'select',
      options: [
        { label: 'Railpack', value: 'railpack' },
        { label: 'Nixpacks', value: 'nixpacks' },
        { label: 'Dockerfile', value: 'dockerfile' },
        { label: 'Heroku build packs', value: 'herokuBuildPacks' },
        { label: 'Build packs', value: 'buildPacks' },
      ],
      defaultValue: 'railpack',
      admin: {
        condition: data => {
          return data.type === 'app' || data.type === 'docker'
        },
      },
    },
    applicationField,
    databaseField,
    dockerField,
    {
      name: 'domains',
      type: 'array',
      fields: [
        {
          name: 'domain',
          type: 'text',
          required: true,
        },
        {
          name: 'default',
          type: 'checkbox',
          required: true,
        },
        {
          name: 'synced',
          type: 'checkbox',
          required: true,
          defaultValue: false,
        },
        {
          name: 'autoRegenerateSSL',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'certificateType',
          type: 'select',
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
        },
      ],
    },
    // deployments join field
    {
      name: 'deployments',
      type: 'join',
      label: 'Deployments',
      collection: 'deployments',
      on: 'service',
      where: {
        deletedAt: {
          exists: false,
        },
      },
    },
  ],
}
