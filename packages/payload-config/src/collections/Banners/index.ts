import { CollectionConfig } from 'payload'

import { isAdmin } from '@/payload/access/isAdmin'

export const Banners: CollectionConfig = {
  slug: 'banners',
  labels: {
    singular: 'Banner',
    plural: 'Banners',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      admin: {
        description:
          'A unique name for the banner, used for identification and management purposes.',
      },
    },
    {
      name: 'scope',
      type: 'select',
      admin: {
        description:
          'Select the scope of the banner. Global banners are visible to all users, while user-specific banners are only visible to users of a specific tenant.',
      },
      options: [
        {
          label: 'Global',
          value: 'global',
        },
        {
          label: 'User-specific',
          value: 'user-specific',
        },
      ],
      defaultValue: 'global',
      required: true,
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: false,
      admin: {
        description:
          'Select the tenant for which this banner is applicable. This is only required if the scope is set to "User-specific".',
        condition: (_, siblingData) => siblingData.scope === 'user-specific',
      },
    },
    {
      name: 'type',
      type: 'select',
      admin: {
        description:
          'Select the type of banner. This helps categorize the banner for better management and display.',
      },
      options: [
        {
          label: 'Announcement',
          value: 'announcement',
        },
        {
          label: 'Maintainance',
          value: 'maintainance',
        },
        {
          label: 'Promotion',
          value: 'promotion',
        },
        {
          label: 'Alert',
          value: 'alert',
        },
      ],
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'The title of the banner, displayed prominently.',
      },
    },
    {
      name: 'content',
      type: 'text',
      admin: {
        description:
          'The main content of the banner, providing details or information.',
      },
      required: true,
    },
    {
      name: 'variant',
      type: 'select',
      admin: {
        description:
          'Select the visual style of the banner. This affects its appearance and how it stands out on the page.',
      },
      options: [
        {
          label: 'Info',
          value: 'info',
        },
        {
          label: 'Warning',
          value: 'warning',
        },
        {
          label: 'Success',
          value: 'success',
        },
      ],
    },
    {
      name: 'isDismissible',
      admin: {
        description:
          'If enabled, users can dismiss the banner, removing it from their view.',
      },
      type: 'checkbox',
    },
    {
      name: 'isActive',
      admin: {
        description: 'If enabled, the banner is active and visible to users.',
      },
      type: 'checkbox',
    },
    {
      name: 'startDate',
      type: 'date',
      admin: {
        description:
          'The date from which the banner will be active. If not set, the banner is considered active immediately.',
      },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        description:
          'The date until which the banner will be active. If not set, the banner remains active indefinitely.',
      },
    },
    {
      name: 'cta',
      type: 'group',
      required: false,
      admin: {
        description:
          'Call to Action (CTA) for the banner. This can include a label and a URL for users to follow.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
        },
        {
          name: 'url',
          type: 'text',
        },
        {
          name: 'isExternal',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  ],
}
