'use client'

import React, { createContext, use } from 'react'

import { Branding } from '@/payload-types'

const BrandingContext = createContext<
  { branding: Branding | undefined } | undefined
>(undefined)

// showing toaster when user goes to offline & online
export const BrandingProvider = ({
  children,
  branding,
}: {
  children: React.ReactNode
  branding: Branding | undefined
}) => {
  return (
    <BrandingContext.Provider value={{ branding }}>
      {children}
    </BrandingContext.Provider>
  )
}

export const useBrandingContext = () => {
  const context = use(BrandingContext)

  if (context === undefined) {
    throw new Error(
      'useBrandingContext must be used within a BrandingContextProvider',
    )
  }

  return context
}
