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
    TAILSCALE_OAUTH_CLIENT_SECRET: z.string().min(1).optional(),
    TAILSCALE_TAILNET: z.string().min(1).optional(),
    BESZEL_MONITORING_URL: z.string().min(1).optional(),
    BESZEL_SUPERUSER_EMAIL: z.string().min(1).optional(),
    BESZEL_SUPERUSER_PASSWORD: z.string().min(1).optional(),
    BESZEL_HUB_SSH_KEY: z.string().min(1).optional(),
    TAILSCALE_AUTH_KEY: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_WEBSITE_URL: z.string().url(),
    NEXT_PUBLIC_WEBHOOK_URL: z.string().url().optional(),
    NEXT_PUBLIC_DFLOW_TELEMETRY_DISABLED: z.literal('1').optional(),
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: z.string().min(1).optional(),
    NEXT_PUBLIC_BETTER_STACK_INGESTING_URL: z.string().min(1).optional(),
    NEXT_PUBLIC_PROXY_DOMAIN_URL: z.string().optional(),
    NEXT_PUBLIC_PROXY_CNAME: z.string().optional(),
    NEXT_PUBLIC_DISCORD_INVITE_URL: z.string().optional(),
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
    TAILSCALE_OAUTH_CLIENT_SECRET: process.env.TAILSCALE_OAUTH_CLIENT_SECRET,
    TAILSCALE_TAILNET: process.env.TAILSCALE_TAILNET,
    TAILSCALE_AUTH_KEY: process.env.TAILSCALE_AUTH_KEY,
    NEXT_PUBLIC_PROXY_DOMAIN_URL: process.env.NEXT_PUBLIC_PROXY_DOMAIN_URL,
    NEXT_PUBLIC_PROXY_CNAME: process.env.NEXT_PUBLIC_PROXY_CNAME,
    NEXT_PUBLIC_DISCORD_INVITE_URL: process.env.NEXT_PUBLIC_DISCORD_INVITE_URL,
    BESZEL_MONITORING_URL: process.env.BESZEL_MONITORING_URL,
    BESZEL_SUPERUSER_EMAIL: process.env.BESZEL_SUPERUSER_EMAIL,
    BESZEL_SUPERUSER_PASSWORD: process.env.BESZEL_SUPERUSER_PASSWORD,
    BESZEL_HUB_SSH_KEY: process.env.BESZEL_HUB_SSH_KEY,
  },
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_VALIDATION,
})
