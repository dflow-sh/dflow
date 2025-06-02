import { z } from 'zod'

export const connectDockerRegistrySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['docker', 'digitalocean', 'github', 'quay']),
  id: z.string().optional(),
})

export const deleteDockerRegistrySchema = z.object({
  id: z.string(),
})

export const testDockerRegistryConnectionSchema = z.object({
  type: z.enum(['docker', 'github', 'digitalocean', 'quay']),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password/Token is required'),
  name: z.string().optional(),
})
