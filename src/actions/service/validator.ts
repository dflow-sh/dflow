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
