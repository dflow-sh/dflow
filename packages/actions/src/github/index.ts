'use server'

import { dFlowRestSdk } from '@dflow/lib/restSDK/utils'
import { publicClient } from '@dflow/lib/safe-action'

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

export const getTermsUpdatedDateAction = publicClient
  .metadata({
    actionName: 'getTermsUpdatedDateAction',
  })
  .action(async () => {
    const res = await dFlowRestSdk.findGlobal({
      slug: 'terms',
      depth: 2,
      draft: false,
    })
    return res
  })
