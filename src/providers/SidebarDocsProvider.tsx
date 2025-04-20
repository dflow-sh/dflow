'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'

type SidebarDocsContextType = {
  isOpen: boolean
  currentSlug: string | null
  openWith: (slug: string) => void
  close: () => void
}

const SidebarDocsContext = createContext<SidebarDocsContextType | undefined>(
  undefined,
)

export const SidebarDocsProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [currentSlug, setCurrentSlug] = useState<string | null>(null)

  const openWith = useCallback((slug: string) => {
    setCurrentSlug(slug)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setCurrentSlug(null)
  }, [])

  return (
    <SidebarDocsContext.Provider
      value={{ isOpen, currentSlug, openWith, close }}>
      {children}
    </SidebarDocsContext.Provider>
  )
}

export const useSidebarDocs = () => {
  const context = useContext(SidebarDocsContext)
  if (!context) {
    throw new Error('useSidebarDocs must be used within a SidebarDocsProvider')
  }
  return context
}
