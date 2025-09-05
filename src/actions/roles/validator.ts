import { z } from 'zod'

export const permissionsSchema = z.object({
  create: z.boolean().default(false),
  update: z.boolean().default(false),
  read: z.boolean().default(false),
  delete: z.boolean().default(false),
})

export const permissionsWithLimitSchema = permissionsSchema.extend({
  createLimit: z
    .number()
    .min(0, { message: 'Minimum value is 0' })
    .max(99, { message: 'Maximum value is 99' })
    .default(0)
    .nullable()
    .optional(),
  readLimit: z
    .enum(['all', 'createdByUser'])
    .default('all')
    .nullable()
    .optional(),
})

const PermissionsTableSchema = z.object({
  projects: permissionsWithLimitSchema,
  services: permissionsSchema,
  servers: permissionsWithLimitSchema,
  templates: permissionsSchema,
  roles: permissionsSchema,
  backups: permissionsSchema,
  securityGroups: permissionsSchema,
  sshKeys: permissionsSchema,
  cloudProviderAccounts: permissionsSchema,
  dockerRegistries: permissionsSchema,
  gitProviders: permissionsSchema,
  team: permissionsSchema,
})

export type PermissionsTableType = z.infer<typeof PermissionsTableSchema>

export const updatePermissionsSchema = PermissionsTableSchema.extend({
  id: z.string(),
})

export type updatePermissionsType = z.infer<typeof updatePermissionsSchema>

export const createRoleSchema = PermissionsTableSchema.extend({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  type: z
    .enum(['engineering', 'management', 'marketing', 'finance', 'sales'])
    .default('engineering'),
  tags: z.array(z.string()).nullable().optional(),
})

export type createRoleType = z.infer<typeof createRoleSchema>

export const deleteRoleSchema = z.object({
  id: z.string(),
})
