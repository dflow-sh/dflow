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

export const updateSSHKeySchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name should be at-least than 1 character' })
    .max(50, { message: 'Name should be less than 50 characters' }),
  description: z.string().optional(),
  publicKey: z.string({ message: 'Public Key is required' }),
  privateKey: z.string({ message: 'Private Key is required' }),
  id: z.string(),
})

export const deleteSSHKeySchema = z.object({
  id: z.string(),
})

// Define a schema for generating SSH keys (no persistence)
export const generateSSHKeySchema = z.object({
  comment: z.string().optional(),
  type: z.enum(['rsa', 'ed25519']).default('rsa'),
})
