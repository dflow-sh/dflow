'use client'

import {
  Activity,
  AlertCircle,
  CheckCircle,
  Loader2,
  List as Queue,
  RefreshCw,
  Sparkles,
  Terminal,
} from 'lucide-react'
import { motion } from 'motion/react'
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

import LogsPanel from './LogsPanel'
import MenuPanel from './MenuPanel'
import PreferencesPanel from './PreferencesPanel'
import QueuesPanel from './QueuesPanel'
import SyncPanel from './SyncPanel'

type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
type Theme = 'light' | 'dark' | 'system'
type Size = 'small' | 'medium' | 'large'
type Panel = 'menu' | 'preferences' | 'logs' | 'queues' | 'sync'
type NotificationType = 'sync' | 'queue' | 'log' | 'success' | 'error' | 'info'

interface Notification {
  id: string
  type: NotificationType
  message: string
  timestamp: number
  dismissed?: boolean
}

interface Preferences {
  position: Position
  theme: Theme
  size: Size
  visible: boolean
}

const defaultPreferences: Preferences = {
  position: 'bottom-right',
  theme: 'system',
  size: 'medium',
  visible: true,
}

const sizeMap = {
  small: {
    bubble: 'w-12 h-12',
    expanded: { width: 380, height: 520 },
    icon: 16,
    pillHeight: 32,
    bubbleSize: 48,
  },
  medium: {
    bubble: 'w-14 h-14',
    expanded: { width: 420, height: 580 },
    icon: 20,
    pillHeight: 36,
    bubbleSize: 56,
  },
  large: {
    bubble: 'w-16 h-16',
    expanded: { width: 460, height: 640 },
    icon: 24,
    pillHeight: 40,
    bubbleSize: 64,
  },
}

const positionMap = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6',
}

function useScreenDimensions() {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    isMobile: false,
  })

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
      })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  return dimensions
}

const Bubble = () => {
  // Core state - simplified
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentPanel, setCurrentPanel] = useState<Panel>('menu')
  const [preferences, setPreferences] =
    useState<Preferences>(defaultPreferences)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [activeProcesses, setActiveProcesses] = useState<Set<string>>(new Set())
  const [isVisible, setIsVisible] = useState(false)
  const [currentNotification, setCurrentNotification] =
    useState<Notification | null>(null)
  const [showNotification, setShowNotification] = useState(false)

  // Minimal refs - only what's absolutely necessary
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const screenDimensions = useScreenDimensions()

  // SIMPLIFIED: Minimal effects only
  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bubble-preferences')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setPreferences(parsed)
        } catch (error) {
          console.warn('Failed to parse preferences:', error)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bubble-preferences', JSON.stringify(preferences))
    }
  }, [preferences])

  // SIMPLIFIED: Basic sync effect without complex logic
  useEffect(() => {
    if (isSyncing) {
      setActiveProcesses(prev => new Set(prev).add('sync'))

      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }

      syncIntervalRef.current = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 100) {
            setIsSyncing(false)
            setActiveProcesses(prev => {
              const newSet = new Set(prev)
              newSet.delete('sync')
              return newSet
            })
            return 0
          }
          return prev + 10
        })
      }, 300)
    } else {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
        syncIntervalRef.current = null
      }
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
        syncIntervalRef.current = null
      }
    }
  }, [isSyncing])

  // Cleanup
  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current)
      if (notificationTimeoutRef.current)
        clearTimeout(notificationTimeoutRef.current)
    }
  }, [])

  // SIMPLIFIED: Basic callbacks
  const updatePreference = useCallback(
    <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
      setPreferences(prev => ({ ...prev, [key]: value }))
    },
    [],
  )

  const handleBubbleClick = useCallback(() => {
    setIsExpanded(!isExpanded)
    if (!isExpanded) {
      setCurrentPanel('menu')
    }
  }, [isExpanded])

  const navigateToPanel = useCallback((panel: Panel) => {
    setCurrentPanel(panel)
  }, [])

  const goBack = useCallback(() => {
    setCurrentPanel('menu')
  }, [])

  const startSync = useCallback(() => {
    setIsSyncing(true)
  }, [])

  if (!preferences.visible || !isVisible) return null

  const bubbleSize = sizeMap[preferences.size]
  const position = positionMap[preferences.position]

  // SIMPLIFIED: Direct panel rendering without complex memoization
  const renderPanel = () => {
    switch (currentPanel) {
      case 'menu':
        return (
          <MenuPanel
            onNavigate={navigateToPanel}
            onStartSync={startSync}
            onClose={() => setIsExpanded(false)}
            activeProcesses={activeProcesses}
            isSyncing={isSyncing}
          />
        )
      case 'preferences':
        return (
          <PreferencesPanel
            preferences={preferences}
            onUpdate={updatePreference}
            onBack={goBack}
          />
        )
      case 'logs':
        return <LogsPanel onBack={goBack} />
      case 'queues':
        return <QueuesPanel onBack={goBack} />
      case 'sync':
        return (
          <SyncPanel
            onBack={goBack}
            progress={syncProgress}
            isSyncing={isSyncing}
            onStartSync={startSync}
          />
        )
      default:
        return null
    }
  }

  const getBubbleIcon = () => {
    const iconSize = bubbleSize.icon

    if (activeProcesses.has('sync')) {
      return <Loader2 size={iconSize} className='text-primary animate-spin' />
    }
    if (activeProcesses.has('queue')) {
      return (
        <Queue
          size={iconSize}
          className='text-secondary-foreground animate-pulse'
        />
      )
    }
    return <Sparkles size={iconSize} className='text-muted-foreground' />
  }

  const getPanelPosition = (): CSSProperties => {
    if (screenDimensions.isMobile) {
      return {
        position: 'fixed',
        bottom: '1rem',
        left: '1rem',
        right: '1rem',
        top: 'auto',
        width: 'auto',
        height: '75vh',
        minHeight: '400px',
        maxHeight: '600px',
      } as CSSProperties
    }

    const isRight = preferences.position.includes('right')
    const isTop = preferences.position.includes('top')
    const panelWidth = bubbleSize.expanded.width
    const panelHeight = bubbleSize.expanded.height
    const margin = 20
    const screenPadding = 24

    let left: string | undefined = undefined
    let right: string | undefined = undefined
    let top: string | undefined = undefined
    let bottom: string | undefined = undefined

    if (isRight) {
      right = `${screenPadding}px`
    } else {
      left = `${screenPadding}px`
    }

    if (isTop) {
      top = `${screenPadding + bubbleSize.bubbleSize + margin}px`
    } else {
      bottom = `${screenPadding + bubbleSize.bubbleSize + margin}px`
    }

    const maxTop = screenDimensions.height - panelHeight - screenPadding
    if (top && parseInt(top) > maxTop) {
      top = `${Math.max(screenPadding, maxTop)}px`
    }

    return {
      position: 'fixed',
      left,
      right,
      top,
      bottom,
      width: `${panelWidth}px`,
      height: `${panelHeight}px`,
      maxHeight: `${screenDimensions.height - screenPadding * 2}px`,
    } as CSSProperties
  }

  const getExpansionOrigin = () => {
    const isRight = preferences.position.includes('right')
    const isTop = preferences.position.includes('top')

    if (isTop) {
      return isRight ? 'top right' : 'top left'
    } else {
      return isRight ? 'bottom right' : 'bottom left'
    }
  }

  const panelStyle = getPanelPosition()

  return (
    <>
      {/* Main Bubble Container */}
      <div className={cn('fixed z-50', position)}>
        {/* ENHANCED: Expanded Panel with ScrollArea */}
        {isExpanded && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              ...panelStyle,
              transformOrigin: getExpansionOrigin(),
            }}>
            <Card className='bg-background/90 ring-border h-full w-full overflow-hidden rounded-2xl border shadow-2xl ring-1 backdrop-blur-xl'>
              <ScrollArea className='h-full w-full'>
                <div className='flex h-full min-h-full flex-col'>
                  {/* Panel content with proper scrolling */}
                  <div className='h-full min-h-0'>{renderPanel()}</div>
                </div>
              </ScrollArea>
            </Card>
          </motion.div>
        )}

        {/* Bubble Button */}
        <motion.button
          onClick={handleBubbleClick}
          className={cn(
            'bg-background ring-border relative flex items-center justify-center rounded-full border shadow-xl ring-1 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl',
            bubbleSize.bubble,
          )}
          style={{ zIndex: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
          {/* Sync Progress Ring */}
          {isSyncing && (
            <svg
              className='absolute inset-0 h-full w-full -rotate-90'
              viewBox='0 0 100 100'>
              <circle
                cx='50'
                cy='50'
                r='45'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                className='text-muted'
              />
              <motion.circle
                cx='50'
                cy='50'
                r='45'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeDasharray={`${2 * Math.PI * 45}`}
                className='text-primary drop-shadow-sm'
                animate={{
                  strokeDashoffset: `${2 * Math.PI * 45 * (1 - syncProgress / 100)}`,
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </svg>
          )}

          {/* Activity Ring */}
          {activeProcesses.size > 0 && !isSyncing && (
            <motion.div
              className='border-primary/40 absolute inset-0 rounded-full border-2'
              animate={{
                borderColor: [
                  'hsl(var(--primary) / 0.4)',
                  'hsl(var(--primary) / 0.8)',
                  'hsl(var(--primary) / 0.4)',
                ],
                rotate: 360,
              }}
              transition={{
                borderColor: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
                rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
              }}
            />
          )}

          {/* Pulse Effect */}
          {activeProcesses.size > 0 && (
            <motion.div
              className='bg-primary/20 absolute inset-0 rounded-full'
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0, 0.3, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}

          {/* Icon */}
          <motion.div
            animate={
              isSyncing
                ? { rotate: 360 }
                : activeProcesses.has('queue')
                  ? { scale: [1, 1.1, 1] }
                  : { rotate: 0, scale: 1 }
            }
            transition={
              isSyncing
                ? { duration: 2, repeat: Infinity, ease: 'linear' }
                : activeProcesses.has('queue')
                  ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.3 }
            }
            className='drop-shadow-sm'>
            {getBubbleIcon()}
          </motion.div>
        </motion.button>
      </div>
    </>
  )
}

const NotificationIcon = ({ type }: { type: NotificationType }) => {
  const iconProps = { size: 14, className: '' }

  switch (type) {
    case 'sync':
      return <RefreshCw {...iconProps} className='text-primary animate-spin' />
    case 'queue':
      return <Queue {...iconProps} className='text-secondary-foreground' />
    case 'log':
      return <Terminal {...iconProps} className='text-muted-foreground' />
    case 'success':
      return <CheckCircle {...iconProps} className='text-primary' />
    case 'error':
      return <AlertCircle {...iconProps} className='text-destructive' />
    case 'info':
      return <Activity {...iconProps} className='text-primary' />
    default:
      return <Sparkles {...iconProps} className='text-primary' />
  }
}

export default Bubble
