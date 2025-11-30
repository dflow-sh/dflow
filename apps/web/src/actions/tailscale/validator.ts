import { z } from 'zod'

export const generateAuthKeySchema = z.object({
  access_token: z.string(),
})
