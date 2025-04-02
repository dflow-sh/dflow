import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

const changeBasedOnENV = (env: any) => {
  if (process.env.NODE_ENV === 'development') {
    return `http://${env}`
  }
  if (process.env.NODE_ENV === 'production') return `https://${env}`

  return `http://${env}`
}

export const env = createEnv({
  server: {
    DATABASE_URI: z.string().min(1),
    REDIS_URI: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_WEBSITE_URL: z.string().url(),
    NEXT_PUBLIC_WEBHOOK_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_WEBSITE_URL: changeBasedOnENV(
      process.env.NEXT_PUBLIC_WEBSITE_URL || process.env.RAILWAY_PUBLIC_DOMAIN,
    ),
    NEXT_PUBLIC_WEBHOOK_URL: process.env.NEXT_PUBLIC_WEBHOOK_URL,
    DATABASE_URI: process.env.DATABASE_URI,
    REDIS_URI: process.env.REDIS_URI,
  },
})
