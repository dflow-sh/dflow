import { CollectionConfig } from 'payload'

export const Servers: CollectionConfig = {
  slug: 'servers',
  labels: {
    singular: 'Server',
    plural: 'Servers',
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
        { label: 'Master', value: 'master' },
        { label: 'Slave', value: 'slave' },
      ],
    },
    {
      name: 'sshKey',
      type: 'relationship',
      relationTo: 'sshKeys',
      hasMany: false,
      required: true,
    },
    {
      name: 'ip',
      type: 'text',
      label: 'IP Address',
      required: true,
      admin: {
        description: 'Enter the IP address of the server.',
        placeholder: 'e.g: 0:0:0:0',
      },
    },
    {
      name: 'port',
      type: 'number',
      label: 'Port Number',
      required: true,
      admin: {
        description: 'Enter the Port of the server.',
        placeholder: 'e.g: 3000',
      },
    },
    {
      name: 'username',
      type: 'text',
      label: 'Username',
      required: true,
      admin: {
        description: 'Enter the username of the server.',
        placeholder: 'e.g: root',
      },
    },
  ],
}
