'use client'

import { ProgressProvider } from '@bprogress/next/app'

import { isDemoEnvironment } from '@/lib/constants'

const NProgressProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProgressProvider
      height='2px'
      color={
        isDemoEnvironment ? 'hsl(var(--foreground))' : `hsl(var(--primary))`
      }
      shouldCompareComplexProps
      options={{ showSpinner: false }}>
      {children}
    </ProgressProvider>
  )
}

export default NProgressProvider
