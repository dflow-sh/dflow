'use client'

import { useParams, useRouter } from 'next/navigation'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react'

import type { Notification, Panel } from '@/components/bubble/bubble-types'

// Bubble-specific preferences
interface BubblePreferences {
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  theme: 'system' | 'light' | 'dark'
  size: 'small' | 'medium' | 'large'
  visible: boolean
}

interface BubbleContextType {
  // Bubble state
  isExpanded: boolean
  setIsExpanded: (expanded: boolean) => void
  currentPanel: Panel
  setCurrentPanel: (panel: Panel) => void
  isVisible: boolean
  setIsVisible: (visible: boolean) => void

  // Sync state
  isSyncing: boolean
  setIsSyncing: (syncing: boolean) => void
  isSSESyncing: boolean
  setIsSSESyncing: (syncing: boolean) => void
  syncProgress: number
  setSyncProgress: (progress: number) => void
  syncMessage: string
  setSyncMessage: (message: string) => void

  // Process state
  activeProcesses: Set<string>
  setActiveProcesses: (processes: Set<string>) => void
  addActiveProcess: (process: string) => void
  removeActiveProcess: (process: string) => void

  // Notification state
  currentNotification: Notification | null
  setCurrentNotification: (notification: Notification | null) => void
  showNotification: boolean
  setShowNotification: (show: boolean) => void

  // Bubble preferences
  bubblePreferences: BubblePreferences
  updateBubblePreference: (key: keyof BubblePreferences, value: any) => void

  // Actions
  showNotificationWithTimeout: (
    notification: Notification,
    duration?: number,
  ) => void
  startSync: () => void
  navigateToPanel: (panel: Panel) => void
  goBack: () => void
  handleBubbleClick: () => void
}

const BubbleContext = createContext<BubbleContextType | undefined>(undefined)

// Bubble persistence keys
const BUBBLE_STORAGE_KEY = 'bubble-state'
const BUBBLE_PREFS_KEY = 'bubble-preferences'

interface PersistedBubbleState {
  isExpanded: boolean
  currentPanel: Panel
  isVisible: boolean
  syncMessage: string
}

interface PersistedBubblePrefs {
  bubblePreferences: BubblePreferences
}

export const useBubble = () => {
  const context = useContext(BubbleContext)
  if (!context) {
    throw new Error('useBubble must be used within BubbleProvider')
  }
  return context
}

export default function BubbleProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // Load initial state from localStorage
  const loadBubbleState = (): Partial<PersistedBubbleState> => {
    if (typeof window === 'undefined') {
      return {}
    }

    try {
      const saved = localStorage.getItem(BUBBLE_STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved) as PersistedBubbleState
      }
    } catch (error) {
      console.warn('Failed to load bubble state from localStorage:', error)
    }

    return {}
  }

  // Load initial bubble preferences from localStorage
  const loadBubblePrefs = (): Partial<PersistedBubblePrefs> => {
    if (typeof window === 'undefined') {
      return {}
    }

    try {
      const saved = localStorage.getItem(BUBBLE_PREFS_KEY)
      if (saved) {
        return JSON.parse(saved) as PersistedBubblePrefs
      }
    } catch (error) {
      console.warn(
        'Failed to load bubble preferences from localStorage:',
        error,
      )
    }

    return {}
  }

  // Bubble state with persistence
  const [isExpanded, setIsExpanded] = useState(
    () => loadBubbleState().isExpanded ?? false,
  )
  const [currentPanel, setCurrentPanel] = useState<Panel>(
    () => loadBubbleState().currentPanel ?? 'menu',
  )
  const [isVisible, setIsVisible] = useState(
    () => loadBubbleState().isVisible ?? true,
  )

  // Sync state (not persisted)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isSSESyncing, setIsSSESyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [syncMessage, setSyncMessage] = useState(
    () => loadBubbleState().syncMessage ?? 'All platform data is synchronized',
  )

  // Process state (not persisted)
  const [activeProcesses, setActiveProcesses] = useState<Set<string>>(new Set())

  // Notification state (not persisted)
  const [currentNotification, setCurrentNotification] =
    useState<Notification | null>(null)
  const [showNotification, setShowNotification] = useState(false)

  // Bubble preferences with persistence
  const [bubblePreferences, setBubblePreferences] = useState<BubblePreferences>(
    () => {
      const savedPrefs = loadBubblePrefs()
      return (
        savedPrefs.bubblePreferences ?? {
          position: 'bottom-right',
          theme: 'system',
          size: 'medium',
          visible: true,
        }
      )
    },
  )

  // Refs
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Router
  const [isPending, startTransition] = useTransition()
  const { organisation } = useParams<{ organisation: string }>()
  const router = useRouter()

  // Save bubble state to localStorage
  const saveBubbleState = useCallback((state: PersistedBubbleState) => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(BUBBLE_STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.warn('Failed to save bubble state to localStorage:', error)
    }
  }, [])

  // Save bubble preferences to localStorage
  const saveBubblePrefs = useCallback((prefs: PersistedBubblePrefs) => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(BUBBLE_PREFS_KEY, JSON.stringify(prefs))
    } catch (error) {
      console.warn('Failed to save bubble preferences to localStorage:', error)
    }
  }, [])

  // Persist bubble state when relevant states change
  useEffect(() => {
    const state: PersistedBubbleState = {
      isExpanded,
      currentPanel,
      isVisible,
      syncMessage,
    }
    saveBubbleState(state)
  }, [isExpanded, currentPanel, isVisible, syncMessage, saveBubbleState])

  // Persist bubble preferences when preferences change
  useEffect(() => {
    const prefs: PersistedBubblePrefs = {
      bubblePreferences,
    }
    saveBubblePrefs(prefs)
  }, [bubblePreferences, saveBubblePrefs])

  // Process management
  const addActiveProcess = useCallback((process: string) => {
    setActiveProcesses(prev => new Set(prev).add(process))
  }, [])

  const removeActiveProcess = useCallback((process: string) => {
    setActiveProcesses(prev => {
      const newSet = new Set(prev)
      newSet.delete(process)
      return newSet
    })
  }, [])

  // Bubble preferences management
  const updateBubblePreference = useCallback(
    (key: keyof BubblePreferences, value: any) => {
      setBubblePreferences(prev => ({ ...prev, [key]: value }))
    },
    [],
  )

  // Notification management
  const showNotificationWithTimeout = useCallback(
    (notification: Notification, duration: number = 3000) => {
      if (isExpanded) return // Don't show notifications when expanded

      // Clear any existing timeout first
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current)
        notificationTimeoutRef.current = null
      }

      // Only show if there's no current notification or it's a different one
      if (!currentNotification || currentNotification.id !== notification.id) {
        setCurrentNotification(notification)
        setShowNotification(true)

        // Set new timeout to hide notification
        notificationTimeoutRef.current = setTimeout(() => {
          setShowNotification(false)
          // Clear notification after animation completes
          setTimeout(() => {
            setCurrentNotification(null)
          }, 300)
        }, duration)
      }
    },
    [isExpanded, currentNotification],
  )

  // Navigation
  const navigateToPanel = useCallback((panel: Panel) => {
    setCurrentPanel(panel)
  }, [])

  const goBack = useCallback(() => {
    setCurrentPanel('menu')
  }, [])

  const handleBubbleClick = useCallback(() => {
    if (isExpanded) {
      // If already expanded, close it immediately
      setIsExpanded(false)
    } else {
      // If not expanded, close Chatway first and then open bubble immediately
      if (window.$chatway?.closeChatwayWidget) {
        try {
          window.$chatway.closeChatwayWidget()
        } catch (error) {
          console.warn('Failed to close Chatway:', error)
        }
      }

      // Open the bubble immediately without delay
      setIsExpanded(true)
      setCurrentPanel('menu')
    }
  }, [isExpanded])

  // Manual sync function
  const startSync = useCallback(() => {
    if (isSyncing || isSSESyncing) return

    setSyncMessage('Manual sync initiated...')
    setIsSyncing(true)
    addActiveProcess('sync')
    setSyncProgress(0)

    // Show manual sync notification
    const notification: Notification = {
      id: Date.now().toString(),
      type: 'sync',
      message: 'Manual sync initiated...',
      timestamp: Date.now(),
    }

    showNotificationWithTimeout(notification, 4000)

    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current)
    }

    syncIntervalRef.current = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          // Clear the interval first to prevent re-entry
          if (syncIntervalRef.current) {
            clearInterval(syncIntervalRef.current)
            syncIntervalRef.current = null
          }

          setIsSyncing(false)
          removeActiveProcess('sync')
          setSyncMessage('Manual sync completed successfully!')

          // Use setTimeout to defer router.refresh and prevent infinite loop
          setTimeout(() => {
            startTransition(() => {
              router.refresh()
            })
          }, 100)

          // Show manual sync success
          const successNotification: Notification = {
            id: (Date.now() + 1).toString(),
            type: 'success',
            message: 'Manual sync completed successfully!',
            timestamp: Date.now(),
          }

          showNotificationWithTimeout(successNotification, 2000)

          setTimeout(() => {
            setSyncMessage('All platform data is synchronized')
          }, 2000)

          return 0
        }
        return prev + 12
      })
    }, 150)
  }, [
    isSyncing,
    isSSESyncing,
    router,
    showNotificationWithTimeout,
    addActiveProcess,
    removeActiveProcess,
  ])

  // SSE Effect
  useEffect(() => {
    if (!organisation) return

    const eventSource = new EventSource(
      `/api/refresh?organisation=${organisation}`,
    )
    eventSourceRef.current = eventSource

    eventSource.onmessage = event => {
      const data = JSON.parse(event.data) ?? {}

      if (data?.refresh) {
        const customMessage = data?.message || 'Syncing with latest changes...'
        setSyncMessage(customMessage)

        setIsSSESyncing(true)
        addActiveProcess('sync')
        setSyncProgress(0)

        startTransition(() => {
          router.refresh()
        })

        const notification: Notification = {
          id: Date.now().toString(),
          type: 'sync',
          message: customMessage,
          timestamp: Date.now(),
        }

        showNotificationWithTimeout(notification, 5000)
      }

      if (data?.path) {
        router.push(data?.path)
      }
    }

    return () => {
      if (eventSource) {
        eventSource.close()
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
        syncIntervalRef.current = null
      }
    }
  }, [organisation, router, showNotificationWithTimeout, addActiveProcess])

  // Monitor isPending changes and complete SSE sync when transition finishes
  useEffect(() => {
    if (isSSESyncing && !isPending) {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }

      setSyncProgress(80)

      syncIntervalRef.current = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 100) {
            setIsSSESyncing(false)
            removeActiveProcess('sync')
            setSyncMessage('All platform data is synchronized')

            const successNotification: Notification = {
              id: (Date.now() + 1).toString(),
              type: 'success',
              message: 'Platform synchronized successfully',
              timestamp: Date.now(),
            }

            showNotificationWithTimeout(successNotification, 2000)

            return 0
          }
          return prev + 5
        })
      }, 100)
    }
  }, [
    isSSESyncing,
    isPending,
    showNotificationWithTimeout,
    removeActiveProcess,
  ])

  // Hide notification when bubble expands
  useEffect(() => {
    if (isExpanded) {
      if (showNotification) {
        setShowNotification(false)
        if (notificationTimeoutRef.current) {
          clearTimeout(notificationTimeoutRef.current)
          notificationTimeoutRef.current = null
        }
        setTimeout(() => {
          setCurrentNotification(null)
        }, 300)
      }
    }
  }, [isExpanded, showNotification])

  // Cleanup
  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current)
      if (notificationTimeoutRef.current)
        clearTimeout(notificationTimeoutRef.current)
      if (eventSourceRef.current) eventSourceRef.current.close()
    }
  }, [])

  const value: BubbleContextType = {
    // Bubble state
    isExpanded,
    setIsExpanded,
    currentPanel,
    setCurrentPanel,
    isVisible,
    setIsVisible,

    // Sync state
    isSyncing,
    setIsSyncing,
    isSSESyncing,
    setIsSSESyncing,
    syncProgress,
    setSyncProgress,
    syncMessage,
    setSyncMessage,

    // Process state
    activeProcesses,
    setActiveProcesses,
    addActiveProcess,
    removeActiveProcess,

    // Notification state
    currentNotification,
    setCurrentNotification,
    showNotification,
    setShowNotification,

    // Bubble preferences
    bubblePreferences,
    updateBubblePreference,

    // Actions
    showNotificationWithTimeout,
    startSync,
    navigateToPanel,
    goBack,
    handleBubbleClick,
  }

  return (
    <BubbleContext.Provider value={value}>{children}</BubbleContext.Provider>
  )
}
