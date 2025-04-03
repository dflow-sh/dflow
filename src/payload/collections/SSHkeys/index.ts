import { encryptedField } from '@oversightstudio/encrypted-fields'
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
    delete: () => true,
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
    encryptedField({
      name: 'publicKey',
      type: 'text',
      label: 'Public Key',
      required: true,
    }),
    encryptedField({
      name: 'privateKey',
      type: 'text',
      label: 'Private Key',
      required: true,
    }),
  ],
}
