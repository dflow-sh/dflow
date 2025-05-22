import { encryptedField } from '@oversightstudio/encrypted-fields'
import { CollectionConfig } from 'payload'

import { isAdmin } from '@/payload/access/isAdmin'

import { ensureUniqueName } from './hooks/ensureUniqueName'

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
    read: isAdmin,
    create: isAdmin,
    update: () => false,
    delete: isAdmin,
    readVersions: isAdmin,
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
      hooks: {
        beforeValidate: [ensureUniqueName],
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
