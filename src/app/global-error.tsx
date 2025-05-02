'use client'

// Error boundaries must be Client Components
import NextError from 'next/error'
import posthog from 'posthog-js'
import { env } from 'process'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (
      process.env.NODE_ENV === 'development' ||
      env.NEXT_PUBLIC_DFLOW_TELEMETRY_DISABLED
    ) {
      return
    }

    posthog.captureException(error)
  }, [error])

  return (
    // global-error must include html and body tags
    <html>
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  )
}
