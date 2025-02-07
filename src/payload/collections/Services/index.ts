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
    update: () => false,
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
  ],
}
