import { CollectionConfig } from 'payload'

import { isAdmin } from '@/payload/access/isAdmin'

export const Roles: CollectionConfig = {
  slug: 'roles',

  labels: {
    singular: 'Role',
    plural: 'Roles',
  },

  admin: {
    useAsTitle: 'name',
  },

  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Name',
      required: true,
      admin: {
        description: 'Enter the name of the role.',
        placeholder: 'Admin',
      },
    },
    {
      type: 'group',
      label: 'Projects',
      name: 'projects',
      fields: [
        {
          type: 'row',
          fields: [
            {
              label: 'Create',
              type: 'checkbox',
              name: 'create',
              defaultValue: false,
            },
            {
              label: 'Update',
              type: 'checkbox',
              name: 'update',
              defaultValue: false,
            },
            {
              label: 'Read',
              type: 'checkbox',
              name: 'read',
              defaultValue: true,
            },
            {
              label: 'Delete',
              type: 'checkbox',
              name: 'delete',
              defaultValue: false,
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      label: 'Services',
      name: 'services',
      fields: [
        {
          type: 'row',
          fields: [
            {
              label: 'Create',
              type: 'checkbox',
              name: 'create',
              defaultValue: false,
            },
            {
              label: 'Update',
              type: 'checkbox',
              name: 'update',
              defaultValue: false,
            },
            {
              label: 'Read',
              type: 'checkbox',
              name: 'read',
              defaultValue: true,
            },
            {
              label: 'Delete',
              type: 'checkbox',
              name: 'delete',
              defaultValue: false,
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      label: 'Servers',
      name: 'Servers',
      fields: [
        {
          type: 'row',
          fields: [
            {
              label: 'Create',
              type: 'checkbox',
              name: 'create',
              defaultValue: false,
            },
            {
              label: 'Update',
              type: 'checkbox',
              name: 'update',
              defaultValue: false,
            },
            {
              label: 'Read',
              type: 'checkbox',
              name: 'read',
              defaultValue: true,
            },
            {
              label: 'Delete',
              type: 'checkbox',
              name: 'delete',
              defaultValue: false,
            },
          ],
        },
      ],
    },
  ],
}
