import { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: {
    singular: 'Project',
    plural: 'Projects',
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

  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Name',
      required: true,
      admin: {
        description: 'Enter the name of the project.',
        placeholder: 'e.g., ContentQL',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Provide a brief description of the project.',
        placeholder: 'e.g., ContentQL setup and configuration',
      },
    },
    {
      name: 'server',
      type: 'relationship',
      relationTo: 'servers',
      hasMany: false,
      required: true,
      admin: {
        description:
          'Attach a server, all the servers in this project will be deployed in that server',
      },
    },
    {
      name: 'services',
      type: 'join',
      label: 'Services',
      collection: 'services',
      on: 'project',
      maxDepth: 10,
    },
  ],
}
