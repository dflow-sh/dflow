'use server'

import { createAppAuth } from '@octokit/auth-app'
import { env } from '@dflow/core/env'
import { revalidatePath } from 'next/cache'
import { Octokit } from 'octokit'

import { protectedClient } from '@dflow/core/lib/safe-action'

import {
  createGitHubAppSchema,
  deleteGitProviderSchema,
  getBranchesSchema,
  getRepositorySchema,
  installGitHubAppSchema,
} from './validator'

export const createGithubAppAction = protectedClient
  .metadata({
    actionName: 'createGithubAppAction',
  })
  .inputSchema(createGitHubAppSchema)
  .action(async ({ clientInput }) => {
    const { onboarding, organizationName } = clientInput
    const date = new Date()
    const formattedDate = date.toISOString().split('T')[0]

    const githubCallbackURL =
      env.NEXT_PUBLIC_WEBHOOK_URL ?? env.NEXT_PUBLIC_WEBSITE_URL

    const manifest = {
      redirect_url: `${githubCallbackURL}/api/webhook/providers/github?onboarding=${onboarding}`,
      name: `dFlow-${formattedDate}`,
      url: githubCallbackURL,
      hook_attributes: {
        url: `${githubCallbackURL}/api/deploy/github`,
      },
      callback_urls: [`${githubCallbackURL}/api/webhook/providers/github`],
      public: false,
      request_oauth_on_install: true,
      default_permissions: {
        contents: 'read',
        metadata: 'read',
        emails: 'read',
        pull_requests: 'write',
      },
      default_events: ['pull_request', 'push'],
    }

    const state = 'gh_init'
    const githubAppUrl = organizationName
      ? `https://github.com/organizations/${organizationName}/settings/apps/new?state=${state}`
      : `https://github.com/settings/apps/new?state=${state}`

    return {
      manifest: JSON.stringify(manifest),
      githubAppUrl,
      state,
    }
  })

export const installGithubAppAction = protectedClient
  .metadata({
    actionName: 'installGithubAppAction',
  })
  .inputSchema(installGitHubAppSchema)
  .action(async ({ clientInput }) => {
    const { id, onboarding } = clientInput

    const installState = onboarding
      ? `gh_install:${id}:onboarding`
      : `gh_install:${id}`

    return {
      installState: installState,
    }
  })

export const deleteGitProviderAction = protectedClient
  .metadata({
    actionName: 'deleteGitProviderAction',
  })
  .inputSchema(deleteGitProviderSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id } = clientInput
    const { userTenant, payload } = ctx
    const response = await payload.update({
      collection: 'gitProviders',
      data: {
        deletedAt: new Date().toISOString(),
      },
      where: {
        and: [
          {
            id: {
              equals: id,
            },
          },
          {
            'tenant.slug': {
              equals: userTenant.tenant?.slug,
            },
          },
        ],
      },
    })

    if (response) {
      return { success: true }
    }
  })

export const getRepositoriesAction = protectedClient
  .metadata({
    actionName: 'getRepositoriesAction',
  })
  .inputSchema(getRepositorySchema)
  .action(async ({ clientInput }) => {
    const { appId, installationId, privateKey } = clientInput

    const octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId,
        privateKey,
        installationId,
      },
    })

    let allRepositories: any[] = []
    let currentPage = 1
    let hasMore = true

    while (hasMore) {
      const { data } =
        await octokit.rest.apps.listReposAccessibleToInstallation({
          per_page: 100,
          page: currentPage,
        })

      allRepositories = [...allRepositories, ...data.repositories]

      if (data.repositories.length < 100) {
        hasMore = false
      } else {
        currentPage++
      }
    }

    return {
      repositories: allRepositories.reverse(),
    }
  })

export const getBranchesAction = protectedClient
  .metadata({
    actionName: 'getBranchesAction',
  })
  .inputSchema(getBranchesSchema)
  .action(async ({ clientInput }) => {
    const {
      page = 1,
      appId,
      installationId,
      privateKey,
      limit = 100,
      owner,
      repository,
    } = clientInput

    const octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId,
        privateKey,
        installationId,
      },
    })

    const { data: branches } = await octokit.rest.repos.listBranches({
      owner,
      repo: repository,
      page,
      per_page: limit,
    })

    return {
      branches,
    }
  })

export const getAllAppsAction = protectedClient
  .metadata({
    actionName: 'getAllAppsAction',
  })
  .action(async ({ ctx }) => {
    const { userTenant, payload } = ctx
    const { docs } = await payload.find({
      collection: 'gitProviders',
      pagination: false,
      where: {
        'tenant.slug': {
          equals: userTenant.tenant.slug,
        },
      },
    })

    return docs
  })

export const skipOnboardingAction = protectedClient
  .metadata({
    actionName: 'skipOnboardingAction',
  })
  .action(async ({ ctx }) => {
    const { user, payload } = ctx

    if (user?.id) {
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          onboarded: true,
        },
      })
    }

    revalidatePath('/onboarding/install-github')

    return { success: true }
  })
