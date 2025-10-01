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
  // Bubble state
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentPanel, setCurrentPanel] = useState<Panel>('menu')
  const [isVisible, setIsVisible] = useState(false)

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false)
  const [isSSESyncing, setIsSSESyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [syncMessage, setSyncMessage] = useState(
    'All platform data is synchronized',
  )

  // Process state
  const [activeProcesses, setActiveProcesses] = useState<Set<string>>(new Set())

  // Notification state
  const [currentNotification, setCurrentNotification] =
    useState<Notification | null>(null)
  const [showNotification, setShowNotification] = useState(false)

  // Refs
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Router
  const [isPending, startTransition] = useTransition()
  const { organisation } = useParams<{ organisation: string }>()
  const router = useRouter()

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
    setIsExpanded(!isExpanded)
    if (!isExpanded) {
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

  // Basic initialization
  useEffect(() => {
    setIsVisible(true)
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
