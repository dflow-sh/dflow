'use client'

import { env } from 'env'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

import { posthogKey } from '@/lib/constants'

export default function PosthogProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // skipping posthog loading for development and when telemetry is disabled
    if (
      process.env.NODE_ENV === 'development' ||
      env.NEXT_PUBLIC_DFLOW_TELEMETRY_DISABLED
    ) {
      return
    }

    posthog.init(posthogKey, {
      api_host: `${env.NEXT_PUBLIC_WEBSITE_URL}/ingest`,
      capture_pageview: false, // Disable automatic pageview capture, as we capture manually
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
