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
import { AnimatePresence, motion } from 'motion/react'
import { type CSSProperties, useEffect, useState } from 'react'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useBubble } from '@/providers/BubbleProvider'
import { useTerminal } from '@/providers/TerminalProvider'

import MenuPanel from './MenuPanel'
import PreferencesPanel from './PreferencesPanel'
import QueuesPanel from './QueuesPanel'
import SyncPanel from './SyncPanel'
import TerminalPanel from './TerminalPanel'
import type { NotificationType, Position, Size } from './bubble-types'

// Type-safe maps
const sizeMap: Record<
  Size,
  {
    bubble: string
    expanded: { width: number; height: number }
    icon: number
    pillHeight: number
    bubbleSize: number
  }
> = {
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

const positionMap: Record<Position, string> = {
  'bottom-right': 'bottom-6 right-24', // Move left to accommodate Chatway
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

declare global {
  interface Window {
    $chatway?: {
      openChatwayWidget: () => void
      closeChatwayWidget: () => void
    }
  }
}

const Bubble = () => {
  // Use context for all state
  const {
    isExpanded,
    currentPanel,
    isVisible,
    isSyncing,
    isSSESyncing,
    syncProgress,
    activeProcesses,
    currentNotification,
    showNotification,
    handleBubbleClick,
    setIsExpanded,
  } = useBubble()

  const { preferences, updatePreference } = useTerminal()

  const screenDimensions = useScreenDimensions()

  // Don't render anything if terminal is in external mode
  if (preferences.terminalMode !== 'floating') {
    return (
      <TerminalPanel
        mode={preferences.terminalMode}
        onClose={() => {
          // When closing external terminal, switch back to floating mode
          updatePreference('terminalMode', 'floating')
        }}
      />
    )
  }

  if (!preferences.visible || !isVisible) return null

  // These are now type-safe
  const bubbleSize = sizeMap[preferences.size]
  const position = positionMap[preferences.position]

  // Panel rendering
  const renderPanel = () => {
    switch (currentPanel) {
      case 'menu':
        return <MenuPanel />
      case 'preferences':
        return <PreferencesPanel />
      case 'queues':
        return <QueuesPanel />
      case 'sync':
        return <SyncPanel />
      case 'terminal':
        return (
          <TerminalPanel
            mode={preferences.terminalMode}
            onClose={() => setIsExpanded(false)}
          />
        )
      default:
        return null
    }
  }

  const getBubbleIcon = () => {
    const iconSize = bubbleSize.icon

    if (isSyncing || isSSESyncing) {
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

  const getNotificationPosition = () => {
    const isRight = preferences.position.includes('right')
    const isTop = preferences.position.includes('top')

    return {
      [isRight ? 'right' : 'left']: bubbleSize.bubbleSize / 2,
      [isTop ? 'top' : 'bottom']:
        (bubbleSize.bubbleSize - bubbleSize.pillHeight) / 2,
      transformOrigin: isRight ? 'right center' : 'left center',
    }
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

    // Adjust for Chatway widget when bubble is at bottom-right
    const chatwayOffset = preferences.position === 'bottom-right' ? 96 : 0

    let left: string | undefined = undefined
    let right: string | undefined = undefined
    let top: string | undefined = undefined
    let bottom: string | undefined = undefined

    if (isRight) {
      // Add chatway offset for bottom-right position
      right = `${screenPadding + chatwayOffset}px`
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
  const notificationPosition = getNotificationPosition()

  return (
    <>
      {/* Main Bubble Container */}
      <div className={cn('fixed z-[2147483001]', position)}>
        {/* Notification Pill */}
        <AnimatePresence>
          {showNotification && currentNotification && !isExpanded && (
            <motion.div
              key={currentNotification.id}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className='bg-background/95 ring-border absolute flex items-center rounded-full border px-4 py-2 shadow-xl ring-1 backdrop-blur-xl'
              style={{
                ...notificationPosition,
                minWidth: 200,
                height: bubbleSize.pillHeight,
                zIndex: 0,
              }}>
              <NotificationIcon type={currentNotification.type} />
              <span className='text-foreground mr-1 ml-2 truncate text-sm font-medium'>
                {currentNotification.message}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expanded Panel */}
        <AnimatePresence>
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
              <Card className='bg-background/95 ring-border h-full w-full overflow-hidden rounded-2xl border shadow-2xl ring-1 backdrop-blur-xl'>
                <div className='h-full w-full'>
                  <div className='flex h-full min-h-full flex-col'>
                    <div className='h-full min-h-0'>{renderPanel()}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

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
          {(isSyncing || isSSESyncing) && (
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
          {activeProcesses.size > 0 && !isSyncing && !isSSESyncing && (
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
              isSyncing || isSSESyncing
                ? { rotate: 360 }
                : activeProcesses.has('queue')
                  ? { scale: [1, 1.1, 1] }
                  : { rotate: 0, scale: 1 }
            }
            transition={
              isSyncing || isSSESyncing
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
