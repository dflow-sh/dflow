import type { GlobalConfig } from 'payload'

import { isAdmin } from '@dflow/core/payload/access/isAdmin'
import { themeFields } from '@dflow/core/payload/fields/theme'

export const Theme: GlobalConfig = {
  slug: 'theme',
  access: {
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    components: {
      elements: {
        Description: '@dflow/core/payload/fields/theme/ColorFieldDescription',
      },
    },
  },
  fields: themeFields,
}
