import { GlobalConfig } from 'payload'

import { isAdmin } from '@dflow/payload/access/isAdmin'

export const AuthConfig: GlobalConfig = {
  slug: 'auth-config',
  access: {
    read: isAdmin,
    readDrafts: isAdmin,
    readVersions: isAdmin,
    update: isAdmin,
  },
  fields: [
    {
      name: 'authMethod',
      label: 'Authentication Method',
      type: 'select',
      required: true,
      defaultValue: 'both',
      options: [
        { label: 'Email and Password Only', value: 'email-password' },
        { label: 'Magic Link Only', value: 'magic-link' },
        { label: 'Both Email & Password + Magic Link', value: 'both' },
      ],
    },
  ],
}
