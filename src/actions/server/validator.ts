import { z } from 'zod'

export const createServerSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name should be at-least than 1 character' })
    .max(50, { message: 'Name should be less than 50 characters' }),
  description: z.string().optional(),
  type: z.enum(['master', 'slave'], { message: 'Type is required' }),
  ip: z
    .string({ message: 'IP is required' })
    .ip({ message: 'Invalid IP address' }),
  port: z.number({ message: 'Port is required' }),
  username: z.string({ message: 'Username is required' }),
  sshKey: z.string({ message: 'SSH key is required' }),
})

export const deleteServiceSchema = z.object({
  id: z.string(),
})

export const installDokkuSchema = z.object({
  host: z.string(),
  port: z.number(),
  username: z.string(),
  privateKey: z.string(),
})
