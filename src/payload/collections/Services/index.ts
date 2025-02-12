import { CollectionConfig } from 'payload'

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
    create: () => false,
    read: () => true,
    update: () => true,
    delete: () => false,
  },
  defaultPopulate: {
    name: true,
    description: true,
    updatedAt: true,
    createdAt: true,
    type: true,
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
      name: 'name',
      type: 'text',
      label: 'Name',
      required: true,
      admin: {
        description: 'Enter the name of the service.',
        placeholder: 'e.g., test-service',
      },
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
      name: 'environmentVariables',
      type: 'json',
    },
    // Builder settings
    {
      name: 'builder',
      type: 'select',
      required: true,
      options: [
        { label: 'Nixpacks', value: 'nixpacks' },
        { label: 'Dockerfile', value: 'dockerfile' },
        { label: 'Heroku build packs', value: 'herokuBuildPacks' },
        { label: 'Build packs', value: 'buildPacks' },
      ],
      admin: {
        condition: data => {
          if (data.type === 'app' || data.type === 'docker') {
            return true
          }
          return false
        },
      },
    },
    {
      label: 'App Settings',
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
        {
          name: 'providerType',
          type: 'select',
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
          ],
        },
      ],
    },
  ],
}
