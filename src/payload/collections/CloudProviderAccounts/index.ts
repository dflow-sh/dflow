import { encryptedField } from '@oversightstudio/encrypted-fields'
import { CollectionConfig } from 'payload'

import { isAdmin } from '@/payload/access/isAdmin'

export const CloudProviderAccounts: CollectionConfig = {
  slug: 'cloudProviderAccounts',
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
      name: 'name',
      type: 'text',
      label: 'Name',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      label: 'Type',
      options: [
        { label: 'AWS', value: 'aws' },
        { label: 'Azure', value: 'azure' },
        { label: 'Google Cloud Platform', value: 'gcp' },
        { label: 'Digital Ocean', value: 'digitalocean' },
      ],
      required: true,
    },

    // AWS
    {
      name: 'awsDetails',
      type: 'group',
      admin: {
        condition: data => data.type === 'aws',
      },
      fields: [
        encryptedField({ name: 'accessKeyId', type: 'text', required: true }),
        encryptedField({
          name: 'secretAccessKey',
          type: 'text',
          required: true,
        }),
      ],
    },

    // GCP
    {
      name: 'gcpDetails',
      type: 'group',
      admin: {
        condition: data => data.type === 'gcp',
      },
      fields: [
        encryptedField({
          type: 'textarea',
          name: 'serviceAccountKey',
          required: true,
          admin: {
            description: 'Paste your GCP service account JSON key here',
          },
        }),
        encryptedField({
          name: 'projectId',
          type: 'text',
          required: true,
        }),
      ],
    },

    // DigitalOcean
    {
      name: 'digitaloceanDetails',
      type: 'group',
      admin: {
        condition: data => data.type === 'digitalocean',
      },
      fields: [
        encryptedField({
          name: 'accessToken',
          required: true,
          type: 'text',
          admin: {
            description: 'Personal Access Token from DigitalOcean API settings',
          },
        }),
      ],
    },

    // Azure
    {
      name: 'azureDetails',
      type: 'group',
      admin: {
        condition: data => data.type === 'azure',
      },
      fields: [
        encryptedField({
          name: 'clientId',
          type: 'text',
          required: true,
        }),
        encryptedField({
          name: 'clientSecret',
          type: 'text',
          required: true,
        }),
        encryptedField({
          name: 'tenantId',
          type: 'text',
          required: true,
        }),
        encryptedField({
          name: 'subscriptionId',
          type: 'text',
          required: true,
        }),
      ],
    },
  ],
}
