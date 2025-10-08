'use server'

import { dFlowRestSdk } from '@/lib/restSDK/utils'
import { publicClient } from '@/lib/safe-action'

export const getGithubStarsAction = publicClient
  .metadata({
    actionName: 'getGithubStarsAction',
  })
  .action(async () => {
    const res = await dFlowRestSdk.findGlobal({
      slug: 'github',
      depth: 2,
      draft: false,
    })

    const stars = res.githubStars

    return {
      stars,
    }
  })
