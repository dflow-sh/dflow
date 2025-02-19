import { z } from 'zod'

export const createServiceSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name should be at-least than 1 character' })
    .max(50, { message: 'Name should be less than 50 characters' }),
  description: z.string().optional(),
  type: z.enum(['database', 'app', 'docker']),
  projectId: z.string(),
})

export const deleteServiceSchema = z.object({
  id: z.string(),
})

export const updateServiceSchema = z.object({
  builder: z
    .enum(['nixpacks', 'dockerfile', 'herokuBuildPacks', 'buildPacks'])
    .optional(),
  provider: z.string().optional(),
  providerType: z.enum(['github', 'gitlab', 'bitbucket']).optional(),
  githubSettings: z
    .object({
      repository: z.string(),
      owner: z.string(),
      branch: z.string(),
      buildPath: z.string(),
    })
    .optional(),
  environmentVariables: z.record(z.string()).optional(),
  id: z.string(),
  port: z.number().default(3000),
})
