import { z } from 'zod'

export const exampleSchema = z.object({
  email: z.string().email(),
  name: z.string(),
})
