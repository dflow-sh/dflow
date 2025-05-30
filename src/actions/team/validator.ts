import { z } from 'zod'

export const updateTenantRolesSchema = z.object({
  user: z.any(),
  roles: z
    .array(z.enum(['tenant-admin', 'tenant-user']))
    .min(1, { message: 'At least one role must be selected.' }),
})

export type updateTenantRolesType = z.infer<typeof updateTenantRolesSchema>

export const joinTeamSchema = z.object({
  tenantId: z.string(),
  roles: z
    .array(z.enum(['tenant-admin', 'tenant-user']))
    .min(1, { message: 'At least one role must be selected.' }),
})

export type JoinTeamType = z.infer<typeof joinTeamSchema>

export const sendInvitationLinkSchema = z.object({
  email: z.string(),
  link: z.string(),
})
