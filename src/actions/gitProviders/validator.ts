import { z } from 'zod'

export const createGitHubAppSchema = z.object({
  onboarding: z.boolean().default(false),
})

export const installGitHubAppSchema = z.object({
  onboarding: z.boolean().default(false),
  id: z.string(),
})

export const deleteGitProviderSchema = z.object({
  id: z.string({ message: 'Git-Provider id is required' }),
})

export const getRepositorySchema = z.object({
  appId: z.string(),
  privateKey: z.string(),
  installationId: z.string(),
  page: z.number({ message: 'page number is required' }).default(1),
  limit: z
    .number({ message: 'limit number is required' })
    .min(1)
    .max(100)
    .default(100),
})

export const getBranchesSchema = z.object({
  appId: z.string(),
  privateKey: z.string(),
  installationId: z.string(),
  page: z.number({ message: 'page number is required' }).default(1),
  limit: z
    .number({ message: 'limit number is required' })
    .min(1)
    .max(100)
    .default(100),
  owner: z.string(),
  repository: z.string(),
})
