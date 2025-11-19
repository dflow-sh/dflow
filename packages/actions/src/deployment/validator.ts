import { z } from 'zod'

export const createDeploymentSchema = z.object({
  serviceId: z.string({ message: 'Service is required' }),
  // Taking projectId for revalidation purposes
  projectId: z.string({ message: 'Project is required' }),
  cache: z.enum(['no-cache', 'cache']).default('no-cache'),
})
