import { CollectionConfig } from 'payload'

import { isAdmin } from '../../access/isAdmin'

export const Roles: CollectionConfig = {
  slug: 'roles',
  trash: true,
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
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Enter description for the role.',
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
              required: true,
            },
            {
              label: 'Create Limit',
              type: 'number',
              name: 'createLimit',
              defaultValue: 0,
              admin: {
                description:
                  'Set to 0 for unlimited servers. This is only applicable if Create permission is enabled.',
                condition: (_, siblingData) => siblingData.create,
              },
            },
          ],
        },
        {
          label: 'Update',
          type: 'checkbox',
          name: 'update',
          defaultValue: false,
          required: true,
        },
        {
          type: 'row',
          fields: [
            {
              label: 'Read',
              type: 'checkbox',
              name: 'read',
              defaultValue: true,
              required: true,
            },
            {
              label: 'Read Permission Scop',
              type: 'select',
              name: 'readLimit',
              options: [
                {
                  label: 'All',
                  value: 'all',
                },
                {
                  label: 'created by user',
                  value: 'createdByUser',
                },
              ],
              defaultValue: 'all',
              admin: {
                condition: (_, siblingData) => siblingData.read,
              },
            },
          ],
        },
        {
          label: 'Delete',
          type: 'checkbox',
          name: 'delete',
          defaultValue: false,
          required: true,
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
              required: true,
            },
            {
              label: 'Update',
              type: 'checkbox',
              name: 'update',
              defaultValue: false,
              required: true,
            },
            {
              label: 'Read',
              type: 'checkbox',
              name: 'read',
              defaultValue: true,
              required: true,
            },
            {
              label: 'Delete',
              type: 'checkbox',
              name: 'delete',
              defaultValue: false,
              required: true,
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      label: 'Servers',
      name: 'servers',
      fields: [
        {
          type: 'row',
          fields: [
            {
              label: 'Create',
              type: 'checkbox',
              name: 'create',
              defaultValue: false,
              required: true,
            },
            {
              label: 'Create Limit',
              type: 'number',
              name: 'createLimit',
              defaultValue: 0,
              admin: {
                description:
                  'Set to 0 for unlimited servers. This is only applicable if Create permission is enabled.',
                condition: (_, siblingData) => siblingData.create,
              },
            },
          ],
        },
        {
          label: 'Update',
          type: 'checkbox',
          name: 'update',
          defaultValue: false,
          required: true,
        },
        {
          type: 'row',
          fields: [
            {
              label: 'Read',
              type: 'checkbox',
              name: 'read',
              defaultValue: true,
              required: true,
            },
            {
              label: 'Read Permission Scop',
              type: 'select',
              name: 'readLimit',
              options: [
                {
                  label: 'All',
                  value: 'all',
                },
                {
                  label: 'created by user',
                  value: 'createdByUser',
                },
              ],
              defaultValue: 'all',
              admin: {
                condition: (_, siblingData) => siblingData.read,
              },
            },
          ],
        },
        {
          label: 'Delete',
          type: 'checkbox',
          name: 'delete',
          defaultValue: false,
          required: true,
        },
      ],
    },
    {
      type: 'group',
      label: 'Templates',
      name: 'templates',
      fields: [
        {
          type: 'row',
          fields: [
            {
              label: 'Create',
              type: 'checkbox',
              name: 'create',
              defaultValue: false,
              required: true,
            },
            {
              label: 'Update',
              type: 'checkbox',
              name: 'update',
              defaultValue: false,
              required: true,
            },
            {
              label: 'Read',
              type: 'checkbox',
              name: 'read',
              defaultValue: true,
              required: true,
            },
            {
              label: 'Delete',
              type: 'checkbox',
              name: 'delete',
              defaultValue: false,
              required: true,
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      label: 'SshKeys',
      name: 'sshKeys',
      fields: [
        {
          type: 'row',
          fields: [
            {
              label: 'Create',
              type: 'checkbox',
              name: 'create',
              defaultValue: false,
              required: true,
            },
            {
              label: 'Update',
              type: 'checkbox',
              name: 'update',
              defaultValue: false,
              required: true,
            },
            {
              label: 'Read',
              type: 'checkbox',
              name: 'read',
              defaultValue: true,
              required: true,
            },
            {
              label: 'Delete',
              type: 'checkbox',
              name: 'delete',
              defaultValue: false,
              required: true,
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      label: 'Roles',
      name: 'roles',
      fields: [
        {
          type: 'row',
          fields: [
            {
              label: 'Create',
              type: 'checkbox',
              name: 'create',
              defaultValue: false,
              required: true,
            },
            {
              label: 'Update',
              type: 'checkbox',
              name: 'update',
              defaultValue: false,
              required: true,
            },
            {
              label: 'Read',
              type: 'checkbox',
              name: 'read',
              defaultValue: true,
              required: true,
            },
            {
              label: 'Delete',
              type: 'checkbox',
              name: 'delete',
              defaultValue: false,
              required: true,
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      label: 'Backups',
      name: 'backups',
      fields: [
        {
          type: 'row',
          fields: [
            {
              label: 'Create',
              type: 'checkbox',
              name: 'create',
              defaultValue: false,
              required: true,
            },
            {
              label: 'Update',
              type: 'checkbox',
              name: 'update',
              defaultValue: false,
              required: true,
            },
            {
              label: 'Read',
              type: 'checkbox',
              name: 'read',
              defaultValue: true,
              required: true,
            },
            {
              label: 'Delete',
              type: 'checkbox',
              name: 'delete',
              defaultValue: false,
              required: true,
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      label: 'SecurityGroups',
      name: 'securityGroups',
      fields: [
        {
          type: 'row',
          fields: [
            {
              label: 'Create',
              type: 'checkbox',
              name: 'create',
              defaultValue: false,
              required: true,
            },
            {
              label: 'Update',
              type: 'checkbox',
              name: 'update',
              defaultValue: false,
              required: true,
            },
            {
              label: 'Read',
              type: 'checkbox',
              name: 'read',
              defaultValue: true,
              required: true,
            },
            {
              label: 'Delete',
              type: 'checkbox',
              name: 'delete',
              defaultValue: false,
              required: true,
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      label: 'CloudProviderAccounts',
      name: 'cloudProviderAccounts',
      fields: [
        {
          type: 'row',
          fields: [
            {
              label: 'Create',
              type: 'checkbox',
              name: 'create',
              defaultValue: false,
              required: true,
            },
            {
              label: 'Update',
              type: 'checkbox',
              name: 'update',
              defaultValue: false,
              required: true,
            },
            {
              label: 'Read',
              type: 'checkbox',
              name: 'read',
              defaultValue: true,
              required: true,
            },
            {
              label: 'Delete',
              type: 'checkbox',
              name: 'delete',
              defaultValue: false,
              required: true,
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      label: 'DockerRegistries',
      name: 'dockerRegistries',
      fields: [
        {
          type: 'row',
          fields: [
            {
              label: 'Create',
              type: 'checkbox',
              name: 'create',
              defaultValue: false,
              required: true,
            },
            {
              label: 'Update',
              type: 'checkbox',
              name: 'update',
              defaultValue: false,
              required: true,
            },
            {
              label: 'Read',
              type: 'checkbox',
              name: 'read',
              defaultValue: true,
              required: true,
            },
            {
              label: 'Delete',
              type: 'checkbox',
              name: 'delete',
              defaultValue: false,
              required: true,
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      label: 'GitProviders',
      name: 'gitProviders',
      fields: [
        {
          type: 'row',
          fields: [
            {
              label: 'Create',
              type: 'checkbox',
              name: 'create',
              defaultValue: false,
              required: true,
            },
            {
              label: 'Update',
              type: 'checkbox',
              name: 'update',
              defaultValue: false,
              required: true,
            },
            {
              label: 'Read',
              type: 'checkbox',
              name: 'read',
              defaultValue: true,
              required: true,
            },
            {
              label: 'Delete',
              type: 'checkbox',
              name: 'delete',
              defaultValue: false,
              required: true,
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      label: 'Team',
      name: 'team',
      fields: [
        {
          type: 'row',
          fields: [
            {
              label: 'Create',
              type: 'checkbox',
              name: 'create',
              defaultValue: false,
              required: true,
            },
            {
              label: 'Update',
              type: 'checkbox',
              name: 'update',
              defaultValue: false,
              required: true,
            },
            {
              label: 'Read',
              type: 'checkbox',
              name: 'read',
              defaultValue: true,
              required: true,
            },
            {
              label: 'Delete',
              type: 'checkbox',
              name: 'delete',
              defaultValue: false,
              required: true,
            },
          ],
        },
      ],
    },
    {
      type: 'select',
      name: 'type',
      options: [
        {
          label: 'Engineering',
          value: 'engineering',
        },
        {
          label: 'Management',
          value: 'management',
        },
        {
          label: 'Marketing',
          value: 'marketing',
        },
        {
          label: 'Finance',
          value: 'finance',
        },
        {
          label: 'Sales',
          value: 'sales',
        },
      ],
      defaultValue: 'marketing',
      admin: {
        position: 'sidebar',
      },
    },
    {
      type: 'relationship',
      name: 'createdBy',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
      },
    },
    {
      type: 'text',
      name: 'tags',
      label: 'Tags',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      type: 'checkbox',
      name: 'isAdminRole',
      label: 'isAdminRole',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
// Default export for Roles
import Roles from './Roles'
export default Roles
