import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from 'octokit'

import { Service } from '@/payload-types'

export const getBuildDetails = async ({
  providerType,
  azureSettings,
  githubSettings,
  provider,
  giteaSettings,
}: {
  provider: Service['provider']
  providerType: Service['providerType']
  githubSettings?: Service['githubSettings']
  azureSettings?: Service['azureSettings']
  giteaSettings?: Service['giteaSettings']
}) => {
  if (providerType === 'github' && githubSettings) {
    const { branch, owner, repository, buildPath, port } = githubSettings
    let url = `https://github.com/${owner}/${repository}`
    let token = ''

    if (provider && typeof provider === 'object' && provider.github) {
      const { appId, privateKey, installationId } = provider.github

      const octokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
          appId,
          privateKey,
          installationId,
        },
      })

      const response = (await octokit.auth({
        type: 'installation',
      })) as {
        token: string
      }

      token = response.token
    }

    return {
      url,
      branch,
      buildPath,
      port,
      token,
      hostname: 'github.com',
      username: owner,
    }
  }

  if (providerType === 'azureDevOps' && azureSettings) {
    const { branch, repository, buildPath, port, gitToken, username } =
      azureSettings

    return {
      url: repository,
      branch,
      buildPath,
      port,
      token: gitToken,
      hostname: 'dev.azure.com',
      username,
    }
  }

  if (providerType === 'gitea' && giteaSettings) {
    const { branch, repository, buildPath, port, gitToken, username } =
      giteaSettings
    const match = repository.match(/^(?:https?:\/\/)?([^\/?#]+)/)

    const hostname = match ? match[1] : 'gitea.com'

    return {
      url: repository,
      branch,
      buildPath,
      port,
      token: gitToken,
      hostname,
      username,
    }
  }

  throw new Error('Unsupported provider type or missing settings')
}
