import { z } from 'zod'

export const createAppGithubSchema = z.object({
  appName: z.string(),
})

export type CreateDatabaseInput = z.infer<typeof createAppGithubSchema>
