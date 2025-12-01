import { CollectionConfig } from 'payload'

import { User } from '@dflow/core/payload-types'
import { isAdmin } from '@dflow/core/payload/access/isAdmin'

export const Projects: CollectionConfig = {
  slug: 'projects',
  trash: true,
  labels: {
    singular: 'Project',
    plural: 'Projects',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'description', 'server'],
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    readVersions: isAdmin,
  },
  orderable: true,
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
      // hooks: {
      //   beforeValidate: [ensureUniqueName],
      // },
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
      where: {
        deletedAt: {
          exists: false,
        },
      },
    },
    {
      name: 'hidden',
      type: 'checkbox',
      label: 'Hidden',
      admin: {
        description: 'Hide this project from the public view.',
        position: 'sidebar',
      },
      defaultValue: false,
    },
    {
      type: 'relationship',
      name: 'createdBy',
      relationTo: 'users',
      defaultValue: ({ user }: { user: User }) => {
        if (!user) return undefined
        return user?.id
      },
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
