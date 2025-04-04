'use client'

import { ProgressProvider } from '@bprogress/next/app'
import { env } from 'env'

const NProgressProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProgressProvider
      height='2px'
      color={
        env.NEXT_PUBLIC_ENVIRONMENT === 'DEMO'
          ? 'hsl(var(--foreground))'
          : `hsl(var(--primary))`
      }
      shouldCompareComplexProps
      options={{ showSpinner: false }}>
      {children}
    </ProgressProvider>
  )
}

export default NProgressProvider
