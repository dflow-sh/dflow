import type { GlobalConfig } from 'payload'

import { isAdmin } from '../../access/isAdmin'
import { themeFields } from '../../fields/theme'

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
// Default export for Theme
import Theme from './Theme'
export default Theme
