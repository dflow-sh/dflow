import { z } from 'zod'

export const connectDFlowAccountSchema = z.object({
  accessToken: z.string().min(1),
  name: z.string().min(1),
  id: z.string().optional(),
})
