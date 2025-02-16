'use server'

import { createAppAuth } from '@octokit/auth-app'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { Octokit } from 'octokit'
import { getPayload } from 'payload'

import { protectedClient } from '@/lib/safe-action'

import { deleteGitProviderSchema, getRepositorySchema } from './validator'

const payload = await getPayload({ config: configPromise })

export const deleteGitProviderAction = protectedClient
  .metadata({
    actionName: 'deleteGitProviderAction',
  })
  .schema(deleteGitProviderSchema)
  .action(async ({ clientInput }) => {
    const { id } = clientInput

    const response = await payload.delete({
      collection: 'gitProviders',
      id,
    })

    if (response) {
      revalidatePath('/settings/git')
      return { success: true }
    }
  })

export const getRepositoriesAction = protectedClient
  .metadata({
    actionName: 'getRepositoriesAction',
  })
  .schema(getRepositorySchema)
  .action(async ({ clientInput }) => {
    const {
      page = 1,
      appId,
      installationId,
      privateKey,
      limit = 100,
    } = clientInput

    const octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId,
        privateKey,
        installationId,
      },
    })

    const { data } = await octokit.rest.apps.listReposAccessibleToInstallation({
      per_page: limit,
      page,
    })

    return {
      repositories: data.repositories,
      hasMore: data.total_count > page * limit,
    }
  })
