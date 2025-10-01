'use server'

import axios from 'axios'

import { DFLOW_CONFIG } from '@/lib/constants'
import { publicClient } from '@/lib/safe-action'

export const getGithubStarsAction = publicClient
  .metadata({
    actionName: 'getGithubStarsAction',
  })
  .action(async () => {
    const res = await axios.get(
      `${DFLOW_CONFIG.URL}/api/globals/github?depth=2&draft=false`,
    )

    const stars = res.data.githubStars

    return {
      stars,
    }
  })
