import { z } from 'zod'

export const updatePermissionsSchema = z.object({
  id: z.string(),
  projects: z.object({
    create: z.boolean().default(false),
    update: z.boolean().default(false),
    read: z.boolean().default(false),
    delete: z.boolean().default(false),
  }),

  services: z.object({
    create: z.boolean().default(false),
    update: z.boolean().default(false),
    read: z.boolean().default(false),
    delete: z.boolean().default(false),
  }),

  Servers: z.object({
    create: z.boolean().default(false),
    update: z.boolean().default(false),
    read: z.boolean().default(false),
    delete: z.boolean().default(false),
  }),
})

export type updatePermissionsType = z.infer<typeof updatePermissionsSchema>
