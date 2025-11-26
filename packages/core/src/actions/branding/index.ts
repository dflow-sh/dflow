import configPromise from "@core/payload.config"
import { getPayload } from 'payload'

import { publicClient } from "@core/lib/safe-action"

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
  .action(async () => {
    const payload = await getPayload({
      config: configPromise,
    })

    const theme = await payload.findGlobal({
      slug: 'theme',
    })

    return theme
  })
