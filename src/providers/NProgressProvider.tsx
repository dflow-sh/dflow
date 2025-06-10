'use client'

import { ProgressProvider } from '@bprogress/next/app'

const NProgressProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProgressProvider
      height='2px'
      color='hsl(var(--primary))'
      shouldCompareComplexProps
      options={{ showSpinner: false }}>
      {children}
    </ProgressProvider>
  )
}

export default NProgressProvider
