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
    DFLOW_CLOUD_URL: z.string().optional(),
    DFLOW_CLOUD_AUTH_SLUG: z.string().optional(),
    DFLOW_CLOUD_API_KEY: z.string().optional(),
    DISCORD_CLIENT_ID: z.string().optional(),
    DISCORD_CLIENT_SECRET: z.string().optional(),
    DISCORD_REDIRECT_URI: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_WEBSITE_URL: z.string().url(),
    NEXT_PUBLIC_WEBHOOK_URL: z.string().url().optional(),
    NEXT_PUBLIC_ENVIRONMENT: z.enum(['DEMO', 'PROD']).optional(),
    NEXT_PUBLIC_DFLOW_TELEMETRY_DISABLED: z.literal('1').optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_WEBSITE_URL: changeBasedOnENV(
      process.env.NEXT_PUBLIC_WEBSITE_URL || process.env.RAILWAY_PUBLIC_DOMAIN,
    ),
    NEXT_PUBLIC_WEBHOOK_URL: process.env.NEXT_PUBLIC_WEBHOOK_URL,
    DATABASE_URI: process.env.DATABASE_URI,
    REDIS_URI: process.env.REDIS_URI,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
    NEXT_PUBLIC_DFLOW_TELEMETRY_DISABLED:
      process.env.NEXT_PUBLIC_DFLOW_TELEMETRY_DISABLED,
    DFLOW_CLOUD_URL: process.env.DFLOW_CLOUD_URL,
    DFLOW_CLOUD_AUTH_SLUG: process.env.DFLOW_CLOUD_AUTH_SLUG,
    DFLOW_CLOUD_API_KEY: process.env.DFLOW_CLOUD_API_KEY,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    DISCORD_REDIRECT_URI: process.env.DISCORD_REDIRECT_URI,
  },
})
