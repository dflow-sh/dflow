import { z } from 'zod'

export const createAppGithubSchema = z.object({
  appName: z.string(),
  userName: z.string(),
  repoName: z.string(),
  branch: z.string().optional(),
})

export type CreateDatabaseInput = z.infer<typeof createAppGithubSchema>
