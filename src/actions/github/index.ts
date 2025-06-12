'use server'

import axios from 'axios'

import { publicClient } from '@/lib/safe-action'

export const getGithubStarsAction = publicClient
  .metadata({
    actionName: 'getGithubStarsAction',
  })
  .action(async () => {
    const res = await axios.get(
      'https://dflow.sh/api/globals/github?depth=2&draft=false',
    )

    const stars = res.data.githubStars ?? 0

    return {
      stars,
    }
  })
