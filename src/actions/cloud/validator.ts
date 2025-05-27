import { z } from 'zod'

export const cloudProviderAccountsSchema = z.object({
  type: z.enum(['aws', 'azure', 'digitalocean', 'gcp', 'dFlow']),
})

export const syncDflowServersSchema = z.object({
  id: z.string(),
})
