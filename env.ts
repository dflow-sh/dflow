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
    PAYLOAD_SECRET: z.string().min(1),
    REDIS_URI: z.string().min(1),
    RESEND_API_KEY: z.string().min(1).optional(),
    RESEND_SENDER_EMAIL: z.string().email().optional(),
    RESEND_SENDER_NAME: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_WEBSITE_URL: z.string().url(),
    NEXT_PUBLIC_WEBHOOK_URL: z.string().url().optional(),
    NEXT_PUBLIC_DFLOW_TELEMETRY_DISABLED: z.literal('1').optional(),
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: z.string().min(1).optional(),
    NEXT_PUBLIC_BETTER_STACK_INGESTING_URL: z.string().min(1).optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_WEBSITE_URL: changeBasedOnENV(
      process.env.NEXT_PUBLIC_WEBSITE_URL || process.env.RAILWAY_PUBLIC_DOMAIN,
    ),
    NEXT_PUBLIC_WEBHOOK_URL: process.env.NEXT_PUBLIC_WEBHOOK_URL,
    DATABASE_URI: process.env.DATABASE_URI,
    PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
    REDIS_URI: process.env.REDIS_URI,
    NEXT_PUBLIC_DFLOW_TELEMETRY_DISABLED:
      process.env.NEXT_PUBLIC_DFLOW_TELEMETRY_DISABLED,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_SENDER_EMAIL: process.env.RESEND_SENDER_EMAIL,
    RESEND_SENDER_NAME: process.env.RESEND_SENDER_NAME,
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN:
      process.env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN,
    NEXT_PUBLIC_BETTER_STACK_INGESTING_URL:
      process.env.NEXT_PUBLIC_BETTER_STACK_INGESTING_URL,
  },
  emptyStringAsUndefined: true,
})
