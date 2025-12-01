import { z } from 'zod'

export const docsSchema = z.object({
  directory: z.string(),
  fileName: z.string(),
})
