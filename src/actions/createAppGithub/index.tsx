'use server'

import { dokku } from '../../lib/dokku'

import { publicClient } from '@/lib/safe-action'

import { sshConnect } from './../../lib/ssh'
import { deployAppQueue } from './../../queues/deployApp'
import { createAppGithubSchema } from './validator'

export const createAppGithubAction = publicClient
  .metadata({
    actionName: 'createAppGithub',
  })
  .schema(createAppGithubSchema)
  .action(async ({ clientInput }) => {
    const { appName } = clientInput
    const ssh = await sshConnect()

    const dokkuApp = await dokku.apps.create(ssh, appName)

    if (dokkuApp) {
      const job = await deployAppQueue.add('deploy-app', {
        appId: '1',
        userName: 'akhil-naidu',
        repoName: 'waitlist-new',
        branch: 'master',
      })

      console.log(job.id)
    }

    ssh.dispose()

    return { result: true }
  })
