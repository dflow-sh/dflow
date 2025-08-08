import { z } from 'zod'

export const getThemeSchema = z.object({
  draft: z.boolean().optional(),
})
