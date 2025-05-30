import { CollectionConfig } from 'payload'

import { isAdmin } from '@/payload/access/isAdmin'

import { checkDuplicateGitProviders } from './hooks/checkDuplicateGitProviders'

// import { populateInstallationToken } from './hooks/populateInstallationToken'

export const GitProviders: CollectionConfig = {
  slug: 'gitProviders',
  labels: {
    singular: 'Git Provider',
    plural: 'Git Providers',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    readVersions: isAdmin,
  },
  hooks: {
    beforeValidate: [checkDuplicateGitProviders],
    // afterChange: [populateInstallationToken],
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      label: 'Name',
      required: true,
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
      name: 'github',
      type: 'group',
      label: 'Github',
      admin: {
        condition: data => {
          if (data.type === 'github') {
            return true
          }

          return false
        },
      },
      fields: [
        {
          name: 'appName',
          type: 'text',
          required: true,
        },
        {
          name: 'appUrl',
          type: 'text',
          required: true,
        },
        {
          name: 'appId',
          type: 'number',
          required: true,
        },
        {
          name: 'clientId',
          type: 'text',
          required: true,
        },
        {
          name: 'clientSecret',
          type: 'text',
          required: true,
        },
        {
          name: 'installationId',
          type: 'text',
        },
        {
          name: 'privateKey',
          type: 'text',
          required: true,
        },
        {
          name: 'webhookSecret',
          type: 'text',
          required: true,
        },
        {
          name: 'installationToken',
          type: 'text',
        },
        {
          name: 'tokenExpiration',
          type: 'text',
        },
      ],
    },
  ],
}
