import type { GlobalConfig } from 'payload'

import { isAdmin } from '@dflow/payload/access/isAdmin'
import { themeFields } from '@dflow/payload/fields/theme'

export const Theme: GlobalConfig = {
  slug: 'theme',
  access: {
    read: isAdmin,
    update: isAdmin,
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
