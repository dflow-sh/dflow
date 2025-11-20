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

const permissionsTableSchema = z.object({
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

export type PermissionsTableType = z.infer<typeof permissionsTableSchema>

export const createRoleSchema = permissionsTableSchema.extend({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  type: z
    .enum(['engineering', 'management', 'marketing', 'finance', 'sales'])
    .default('engineering'),
  tags: z.array(z.string()).nullable().optional(),
})

export type CreateRoleType = z.infer<typeof createRoleSchema>

export const updateRoleSchema = createRoleSchema.extend({
  id: z.string(),
  isAdminRole: z.boolean().optional().nullable(),
})

export type UpdateRoleType = z.infer<typeof updateRoleSchema>

export const deleteRoleSchema = z.object({
  id: z.string(),
  isAdminRole: z.boolean(),
})
