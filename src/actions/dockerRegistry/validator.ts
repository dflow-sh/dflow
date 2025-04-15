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
