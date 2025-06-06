import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name should be at-least than 1 character' })
    .max(50, { message: 'Name should be less than 50 characters' }),
  description: z.string().optional(),
  serverId: z.string({ message: 'Server is required' }),
})

export const updateProjectSchema = createProjectSchema.extend({
  id: z.string(),
})

export const deleteProjectSchema = z.object({
  id: z.string(),
  deleteBackups: z.boolean().optional(),
  deleteFromServer: z.boolean(),
})
