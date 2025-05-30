import { z } from 'zod'

export const updateTenantRolesSchema = z.object({
  user: z.any(),
  roles: z
    .array(z.enum(['tenant-admin', 'tenant-user']))
    .min(1, { message: 'At least one role must be selected.' }),
})

export type updateTenantRolesType = z.infer<typeof updateTenantRolesSchema>
