import { z } from 'zod'

export const createDomainSchema = z.object({
  host: z.string({ message: 'host is required' }),
  certificateType: z.enum(['letsencrypt', 'none']).default('none').optional(),
  autoRegenerateSSL: z.boolean().optional().default(false),
  serviceId: z.string(),
  projectId: z.string(),
})

export const deleteDomainSchema = z.object({
  id: z.string(),
  serviceId: z.string(),
  projectId: z.string(),
})
