import type { GlobalConfig } from 'payload'

import { isAdmin } from '@/payload/access/isAdmin'
import { themeFields } from '@/payload/fields/theme'

export const Theme: GlobalConfig = {
  slug: 'theme',
  access: {
    read: isAdmin,
    update: isAdmin,
  },
  versions: {
    max: 10,
    drafts: {
      autosave: {
        interval: 375,
      },
    },
  },
  admin: {
    components: {
      elements: {
        Description: '@/payload/fields/theme/ColorFieldDescription',
      },
    },
  },
  fields: themeFields,
}
