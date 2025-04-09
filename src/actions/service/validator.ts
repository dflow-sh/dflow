import { z } from 'zod'

export const createServiceSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name should be at-least than 1 character' })
    .max(50, { message: 'Name should be less than 50 characters' }),
  description: z.string().optional(),
  type: z.enum(['database', 'app', 'docker']),
  databaseType: z
    .enum(['postgres', 'mongo', 'mysql', 'redis', 'mariadb'])
    .optional(),
  projectId: z.string(),
})

export const deleteServiceSchema = z.object({
  id: z.string(),
})

export const updateServiceSchema = z.object({
  builder: z
    .enum([
      'nixpacks',
      'dockerfile',
      'herokuBuildPacks',
      'buildPacks',
      'railpack',
    ])
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
  environmentVariables: z.record(z.string(), z.unknown()).optional(),
  noRestart: z.boolean().optional(),
  id: z.string(),
})

export const exposeDatabasePortSchema = deleteServiceSchema.extend({
  ports: z.array(z.string()),
})

export const updateServiceEnvironmentsSchema = deleteServiceSchema.extend({
  projectId: z.string(),
  environmentVariables: z.record(z.string(), z.string()),
})

export const updateServiceDomainSchema = z.object({
  domain: z.object({
    hostname: z.string(),
    autoRegenerateSSL: z.boolean(),
    certificateType: z.enum(['letsencrypt', 'none']),
  }),
  operation: z.enum(['add', 'remove', 'set']),
  id: z.string(),
})

export const linkDatabaseSchema = z.object({
  databaseServiceId: z.string(),
  serviceId: z.string(),
  environmentVariableName: z.string(),
})
