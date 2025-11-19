import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from 'octokit'

import { Service } from '@/payload-types'

export const getBuildDetails = async ({
  providerType,
  azureSettings,
  githubSettings,
  provider,
  giteaSettings,
  bitbucketSettings,
  gitlabSettings,
}: {
  provider: Service['provider']
  providerType: Service['providerType']
  githubSettings: Service['githubSettings'] | undefined
  azureSettings: Service['azureSettings'] | undefined
  giteaSettings: Service['giteaSettings'] | undefined
  bitbucketSettings: Service['bitbucketSettings'] | undefined
  gitlabSettings: Service['gitlabSettings'] | undefined
}) => {
  if (providerType === 'github' && githubSettings) {
    const { branch, owner, repository, buildPath, port, gitToken } =
      githubSettings
    let url = `https://github.com/${owner}/${repository}`
    let token = gitToken ?? ''

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
      owner,
    }
  }

  if (providerType === 'azureDevOps' && azureSettings) {
    const { branch, repository, buildPath, port, gitToken, owner } =
      azureSettings

    return {
      url: repository,
      branch,
      buildPath,
      port,
      token: gitToken,
      hostname: 'dev.azure.com',
      owner,
    }
  }

  if (providerType === 'gitea' && giteaSettings) {
    const { branch, repository, buildPath, port, gitToken, owner } =
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
      owner,
    }
  }

  if (providerType === 'bitbucket' && bitbucketSettings) {
    const { branch, repository, buildPath, port, gitToken, owner } =
      bitbucketSettings

    return {
      url: repository,
      branch,
      buildPath,
      port,
      token: gitToken,
      hostname: 'bitbucket.org',
      owner,
    }
  }

  if (providerType === 'gitlab' && gitlabSettings) {
    const { branch, repository, buildPath, port, gitToken, owner } =
      gitlabSettings
    const match = repository.match(/^(?:https?:\/\/)?([^\/?#]+)/)

    const hostname = match ? match[1] : 'gitlab.com'

    return {
      url: repository,
      branch,
      buildPath,
      port,
      token: gitToken,
      hostname,
      owner,
    }
  }

  throw new Error('Unsupported provider type or missing settings')
}
