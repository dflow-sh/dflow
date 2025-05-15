import { z } from 'zod'

export const cloudProviderAccountsSchema = z.object({
  type: z.enum(['aws', 'azure', 'digitalocean', 'gcp', 'dFlow']),
})
