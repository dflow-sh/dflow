import type { GlobalConfig } from 'payload'

import { isAdmin } from '@/payload/access/isAdmin'

export const Branding: GlobalConfig = {
  slug: 'branding',
  access: {
    read: isAdmin,
    update: isAdmin,
  },
  fields: [
    {
      type: 'text',
      name: 'title',
      label: 'Site Title',
      required: true,
      admin: {
        description:
          'The title of your site, displayed in the browser tab and search results.',
      },
      defaultValue: 'dFlow',
    },
    {
      type: 'text',
      name: 'description',
      label: 'Site Description',
      required: true,
      admin: {
        description:
          'A self-hosted platform for deploying and managing applications, similar to Vercel, Railway, or Heroku. dFlow provides automated deployment workflows, container orchestration, and infrastructure management capabilities while giving you full control over your infrastructure and data.',
      },
      defaultValue: 'dFlow',
    },
    {
      type: 'text',
      name: 'keywords',
      label: 'Site Keywords',
      hasMany: true,
      admin: {
        description:
          'Keywords for SEO, separated by commas. These help search engines understand the content of your site.',
      },
    },
    {
      type: 'group',
      name: 'favicon',
      admin: {
        description: 'Recommended size: 32x32px',
      },
      fields: [
        {
          type: 'upload',
          relationTo: 'media',
          name: 'lightMode',
          label: 'Light Mode Favicon',
        },
        {
          type: 'upload',
          relationTo: 'media',
          name: 'darkMode',
          label: 'Dark Mode Favicon',
        },
      ],
    },
    {
      type: 'group',
      name: 'logo',
      fields: [
        {
          type: 'upload',
          relationTo: 'media',
          name: 'lightMode',
          label: 'Light Mode Logo',
        },
        {
          type: 'upload',
          relationTo: 'media',
          name: 'darkMode',
          label: 'Dark Mode Logo',
        },
      ],
    },
    {
      type: 'upload',
      relationTo: 'media',
      name: 'ogImage',
      label: 'Open Graph Image',
      admin: {
        description: 'Recommended size: 1200x630px',
      },
    },
  ],
}
