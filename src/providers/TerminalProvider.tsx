'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'

interface TerminalContextType {
  isEmbedded: boolean
  embeddedHeight: number
  setEmbedded: (embedded: boolean) => void
  setEmbeddedHeight: (height: number) => void
}

const TerminalContext = createContext<TerminalContextType | undefined>(
  undefined,
)

export const useTerminal = () => {
  const context = useContext(TerminalContext)
  if (!context) {
    throw new Error('useTerminal must be used within TerminalProvider')
  }
  return context
}

export default function TerminalProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isEmbedded, setIsEmbedded] = useState(false)
  const [embeddedHeight, setEmbeddedHeight] = useState(300)

  const setEmbedded = useCallback((embedded: boolean) => {
    setIsEmbedded(embedded)
  }, [])

  const setEmbeddedHeightValue = useCallback((height: number) => {
    setEmbeddedHeight(height)
  }, [])

  return (
    <TerminalContext.Provider
      value={{
        isEmbedded,
        embeddedHeight,
        setEmbedded,
        setEmbeddedHeight: setEmbeddedHeightValue,
      }}>
      {children}
    </TerminalContext.Provider>
  )
}
