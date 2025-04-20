'use client'

import React, { createContext, useContext, useState } from 'react'

type SidebarDocsContextType = {
  isOpen: boolean
  toggle: () => void
  close: () => void
  open: () => void
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

  const toggle = () => setIsOpen(prev => !prev)
  const close = () => setIsOpen(false)
  const open = () => setIsOpen(true)

  return (
    <SidebarDocsContext.Provider value={{ isOpen, toggle, close, open }}>
      {children}
    </SidebarDocsContext.Provider>
  )
}

export const useSidebarDocs = () => {
  const context = useContext(SidebarDocsContext)
  if (context === undefined) {
    throw new Error('useSidebarDocs must be used within a SidebarProvider')
  }
  return context
}
