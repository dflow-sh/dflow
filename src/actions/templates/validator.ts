import { z } from 'zod'

export const createTemplateSchema = z.object({
  name: z.string({ message: 'Name is required' }),
  description: z.string(),
  services: z.array(
    z.object({
      type: z.enum(['app', 'database']),
      name: z.string(),
      environmentVariables: z.record(z.string(), z.string()).optional(),
      databaseDetails: z
        .object({
          type: z.enum(['postgres', 'mongo', 'mysql', 'redis', 'mariadb']),
        })
        .optional(),

      provider: z.string().optional(),
      providerType: z.enum(['github', 'gitlab', 'bitbucket']).optional(),
      githubSettings: z
        .object({
          repository: z.string(),
          owner: z.string(),
          branch: z.string(),
          buildPath: z.string(),
          port: z.number().default(3000),
        })
        .optional(),
    }),
  ),
})

export type CreateTemplateSchemaType = z.infer<typeof createTemplateSchema>
