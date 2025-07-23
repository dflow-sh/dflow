import { z } from 'zod'

export const updateTenantRolesSchema = z.object({
  user: z.any(),
  role: z.string(),
})

export type updateTenantRolesType = z.infer<typeof updateTenantRolesSchema>

export const joinTeamSchema = z.object({
  tenantId: z.string(),
  role: z.string(),
})

export type JoinTeamType = z.infer<typeof joinTeamSchema>

export const sendInvitationLinkSchema = z.object({
  email: z.string(),
  link: z.string(),
})

export const generateInviteLinkSchema = z.object({
  tenantId: z.string(),
  role: z.string(),
  email: z.string().optional(),
})
