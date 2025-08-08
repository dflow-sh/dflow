import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { publicClient } from '@/lib/safe-action'

import { getThemeSchema } from './validator'

export const getBranding = publicClient
  .metadata({
    actionName: 'getBranding',
  })
  .action(async () => {
    const payload = await getPayload({
      config: configPromise,
    })

    const branding = await payload.findGlobal({
      slug: 'branding',
    })

    return branding
  })

export const getTheme = publicClient
  .metadata({
    actionName: 'getTheme',
  })
  .schema(getThemeSchema)
  .action(async ({ clientInput }) => {
    const { draft = false } = clientInput
    const payload = await getPayload({
      config: configPromise,
    })

    const theme = await payload.findGlobal({
      slug: 'theme',
      draft,
    })

    return theme
  })
