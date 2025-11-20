'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'

type SidebarDocsContextType = {
  isOpen: boolean
  directory: string
  fileName: string
  sectionId?: string
  openWith: ({
    directory,
    fileName,
  }: {
    directory: string
    fileName: string
    sectionId?: string
  }) => void
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
  const [directory, setDirectory] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')
  const [sectionId, setSectionId] = useState<string>('')

  const openWith = useCallback(
    ({
      directory,
      fileName,
      sectionId = '',
    }: {
      directory: string
      fileName: string
      sectionId?: string
    }) => {
      setDirectory(directory)
      setFileName(fileName)
      setSectionId(sectionId)
      setIsOpen(true)
    },
    [],
  )

  const close = useCallback(() => {
    setIsOpen(false)
    setDirectory('')
    setFileName('')
    setSectionId('')
  }, [])

  return (
    <SidebarDocsContext.Provider
      value={{ isOpen, directory, fileName, sectionId, openWith, close }}>
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
