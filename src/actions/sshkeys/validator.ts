import { z } from 'zod'

export const createSSHKeySchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name should be at-least than 1 character' })
    .max(50, { message: 'Name should be less than 50 characters' }),
  description: z.string().optional(),
  publicKey: z.string({ message: 'Public Key is required' }),
  privateKey: z.string({ message: 'Private Key is required' }),
})

export const deleteSSHKeySchema = z.object({
  id: z.string(),
})
