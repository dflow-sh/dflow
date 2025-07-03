import { z } from 'zod'

export const getServerDetailsSchema = z.object({
  id: z.string(),
  populateServerDetails: z.boolean().optional(),
  refreshServerDetails: z.boolean().optional(),
})

export const getServersDetailsSchema = z.object({
  populateServerDetails: z.boolean().optional(),
  refreshServerDetails: z.boolean().optional(),
})
