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
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  embeddedHeight: number
  setEmbeddedHeight: (height: number) => void
  isResizing: boolean
  setIsResizing: (resizing: boolean) => void
  preferences: Preferences
  updatePreference: (key: keyof Preferences, value: any) => void
}

const TerminalContext = createContext<TerminalContextType | undefined>(
  undefined,
)

// Terminal persistence keys
const TERMINAL_STORAGE_KEY = 'terminal-state'
const TERMINAL_PREFS_KEY = 'terminal-preferences'

interface PersistedTerminalState {
  isOpen: boolean
  embeddedHeight: number
}

interface PersistedTerminalPrefs {
  preferences: Preferences
}

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
  // Load initial terminal state from localStorage
  const loadTerminalState = (): Partial<PersistedTerminalState> => {
    if (typeof window === 'undefined') {
      return {}
    }

    try {
      const saved = localStorage.getItem(TERMINAL_STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved) as PersistedTerminalState
      }
    } catch (error) {
      console.warn('Failed to load terminal state from localStorage:', error)
    }

    return {}
  }

  // Load initial terminal preferences from localStorage
  const loadTerminalPrefs = (): Partial<PersistedTerminalPrefs> => {
    if (typeof window === 'undefined') {
      return {}
    }

    try {
      const saved = localStorage.getItem(TERMINAL_PREFS_KEY)
      if (saved) {
        return JSON.parse(saved) as PersistedTerminalPrefs
      }
    } catch (error) {
      console.warn(
        'Failed to load terminal preferences from localStorage:',
        error,
      )
    }

    return {}
  }

  const [isOpen, setIsOpen] = useState(
    () => loadTerminalState().isOpen ?? false,
  )
  const [embeddedHeight, setEmbeddedHeight] = useState(
    () => loadTerminalState().embeddedHeight ?? 300,
  )
  const [isResizing, setIsResizing] = useState(false)

  // Load preferences from localStorage with proper typing
  const [preferences, setPreferences] = useState<Preferences>(() => {
    const savedPrefs = loadTerminalPrefs()
    return (
      savedPrefs.preferences ?? {
        terminalMode: 'embedded',
        embeddedHeight: 300,
        position: 'bottom-right',
        theme: 'system',
        size: 'medium',
        visible: true,
      }
    )
  })

  // Save terminal state to localStorage
  const saveTerminalState = useCallback((state: PersistedTerminalState) => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(TERMINAL_STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.warn('Failed to save terminal state to localStorage:', error)
    }
  }, [])

  // Save terminal preferences to localStorage
  const saveTerminalPrefs = useCallback((prefs: PersistedTerminalPrefs) => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(TERMINAL_PREFS_KEY, JSON.stringify(prefs))
    } catch (error) {
      console.warn(
        'Failed to save terminal preferences to localStorage:',
        error,
      )
    }
  }, [])

  // Persist terminal state when relevant states change
  useEffect(() => {
    const state: PersistedTerminalState = {
      isOpen,
      embeddedHeight,
    }
    saveTerminalState(state)
  }, [isOpen, embeddedHeight, saveTerminalState])

  // Persist terminal preferences when preferences change
  useEffect(() => {
    const prefs: PersistedTerminalPrefs = {
      preferences,
    }
    saveTerminalPrefs(prefs)
  }, [preferences, saveTerminalPrefs])

  const updatePreference = useCallback((key: string, value: any) => {
    setPreferences(prev => {
      const newPreferences = { ...prev, [key]: value }
      return newPreferences
    })
  }, [])

  const setOpen = useCallback((open: boolean) => {
    setIsOpen(open)
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
        isOpen,
        setIsOpen: setOpen,
        embeddedHeight,
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
