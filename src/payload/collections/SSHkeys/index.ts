import { CollectionConfig } from 'payload'

export const SSHKeys: CollectionConfig = {
  slug: 'sshKeys',
  labels: {
    singular: 'SSH Key',
    plural: 'SSH Keys',
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
        description: 'Enter the name of the ssh key.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Provide a brief description of the ssh key.',
      },
    },
    {
      name: 'publicKey',
      type: 'text',
      label: 'Public Key',
      required: true,
    },
    {
      name: 'privateKey',
      type: 'text',
      label: 'Private Key',
      required: true,
    },
  ],
}
