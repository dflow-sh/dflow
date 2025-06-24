import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name should be at-least than 1 character' })
    .max(10, { message: 'Name should be less than 10 characters' }),
  description: z.string().optional(),
  serverId: z.string({ message: 'Server is required' }),
})

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name should be at-least than 1 character' })
    .max(10, { message: 'Name should be less than 10 characters' }),
  description: z.string().optional(),
  serverId: z.string({ message: 'Server is required' }),
  id: z.string(),
})

export const deleteProjectSchema = z.object({
  id: z.string(),
  serverId: z.string(),
  deleteBackups: z.boolean(),
  deleteFromServer: z.boolean(),
})

export const getProjectDatabasesSchema = z.object({
  id: z.string(),
})
