'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import { Preferences } from '@/components/bubble/bubble-types'

interface TerminalContextType {
  isEmbedded: boolean
  embeddedHeight: number
  setEmbedded: (embedded: boolean) => void
  setEmbeddedHeight: (height: number) => void
  isResizing: boolean
  setIsResizing: (resizing: boolean) => void
  preferences: Preferences
  updatePreference: (key: keyof Preferences, value: any) => void
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
  const [isResizing, setIsResizing] = useState(false)

  // Load preferences from localStorage with proper typing
  const [preferences, setPreferences] = useState<Preferences>({
    terminalMode: 'floating',
    embeddedHeight: 300,
    position: 'bottom-right',
    theme: 'system',
    size: 'medium',
    visible: true,
  })

  // Load preferences on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bubble-preferences')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setPreferences(prev => ({ ...prev, ...parsed }))
          if (parsed.embeddedHeight) {
            setEmbeddedHeight(parsed.embeddedHeight)
          }
        } catch (error) {
          console.warn('Failed to parse preferences:', error)
        }
      }
    }
  }, [])

  const updatePreference = useCallback((key: string, value: any) => {
    setPreferences(prev => {
      const newPreferences = { ...prev, [key]: value }
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'bubble-preferences',
          JSON.stringify(newPreferences),
        )
      }
      return newPreferences
    })
  }, [])

  const setEmbedded = useCallback((embedded: boolean) => {
    setIsEmbedded(embedded)
  }, [])

  const setEmbeddedHeightValue = useCallback(
    (height: number) => {
      setEmbeddedHeight(height)
      updatePreference('embeddedHeight', height)
    },
    [updatePreference],
  )

  const setResizing = useCallback((resizing: boolean) => {
    setIsResizing(resizing)
  }, [])

  return (
    <TerminalContext.Provider
      value={{
        isEmbedded,
        embeddedHeight,
        setEmbedded,
        setEmbeddedHeight: setEmbeddedHeightValue,
        isResizing,
        setIsResizing: setResizing,
        preferences,
        updatePreference,
      }}>
      {children}
    </TerminalContext.Provider>
  )
}
