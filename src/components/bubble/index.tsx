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

// Responsive size map with viewport units
const sizeMap: Record<
  Size,
  {
    bubble: string
    expanded: {
      width: string
      height: string
      maxWidth: string
      maxHeight: string
    }
    icon: number
    pillHeight: number
    bubbleSize: number
  }
> = {
  small: {
    bubble: 'w-12 h-12',
    expanded: {
      width: '90vw',
      height: '80vh',
      maxWidth: '380px',
      maxHeight: '520px',
    },
    icon: 16,
    pillHeight: 32,
    bubbleSize: 48,
  },
  medium: {
    bubble: 'w-14 h-14',
    expanded: {
      width: '92vw',
      height: '82vh',
      maxWidth: '420px',
      maxHeight: '580px',
    },
    icon: 18,
    pillHeight: 36,
    bubbleSize: 56,
  },
  large: {
    bubble: 'w-16 h-16',
    expanded: {
      width: '94vw',
      height: '84vh',
      maxWidth: '460px',
      maxHeight: '640px',
    },
    icon: 22,
    pillHeight: 40,
    bubbleSize: 64,
  },
}

// Responsive position map
const positionMap: Record<Position, string> = {
  'bottom-right': 'bottom-4 right-4 sm:bottom-6 sm:right-6 lg:right-24',
  'bottom-left': 'bottom-4 left-4 sm:bottom-6 sm:left-6',
  'top-right': 'top-4 right-4 sm:top-6 sm:right-6',
  'top-left': 'top-4 left-4 sm:top-6 sm:left-6',
}

function useScreenDimensions() {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  })

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setDimensions({
        width,
        height,
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024,
      })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  return dimensions
}

function useViewportSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  })

  useEffect(() => {
    const updateSafeArea = () => {
      // Calculate safe area considering potential zoom/magnification
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Use CSS env variables if available, otherwise fallback
      const envSafeAreaTop = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--sat') ||
          '0',
      )
      const envSafeAreaRight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--sar') ||
          '0',
      )
      const envSafeAreaBottom = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--sab') ||
          '0',
      )
      const envSafeAreaLeft = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--sal') ||
          '0',
      )

      setSafeArea({
        top: envSafeAreaTop || Math.min(20, viewportHeight * 0.02),
        right: envSafeAreaRight || Math.min(20, viewportWidth * 0.02),
        bottom: envSafeAreaBottom || Math.min(20, viewportHeight * 0.02),
        left: envSafeAreaLeft || Math.min(20, viewportWidth * 0.02),
      })
    }

    updateSafeArea()
    window.addEventListener('resize', updateSafeArea)
    return () => window.removeEventListener('resize', updateSafeArea)
  }, [])

  return safeArea
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
    navigateToPanel,
  } = useBubble()

  const { preferences, updatePreference } = useTerminal()

  const screenDimensions = useScreenDimensions()
  const safeArea = useViewportSafeArea()

  // Don't render bubble if not visible
  if (!preferences.visible || !isVisible) return null

  // Handle bubble click - close if terminal is already open in external mode
  const handleBubbleButtonClick = () => {
    if (
      preferences.terminalMode !== 'floating' &&
      currentPanel === 'terminal'
    ) {
      // Terminal is already open externally, just close the bubble panel
      setIsExpanded(false)
    } else {
      handleBubbleClick()
    }
  }

  // These are now type-safe
  const bubbleSize = sizeMap[preferences.size]
  const position = positionMap[preferences.position]

  // Panel rendering - don't render terminal panel in bubble if it's in external mode
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
        // Only show terminal panel in bubble if mode is floating
        if (preferences.terminalMode === 'floating') {
          return (
            <TerminalPanel
              mode={preferences.terminalMode}
              onClose={() => setIsExpanded(false)}
            />
          )
        } else {
          // Terminal is open externally, show menu instead
          return <MenuPanel />
        }
      default:
        return null
    }
  }

  const getBubbleIcon = () => {
    const iconSize = screenDimensions.isMobile
      ? bubbleSize.icon - 2
      : bubbleSize.icon

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
      [isRight ? 'right' : 'left']: screenDimensions.isMobile
        ? bubbleSize.bubbleSize / 2 - 8
        : bubbleSize.bubbleSize / 2,
      [isTop ? 'top' : 'bottom']:
        (bubbleSize.bubbleSize - bubbleSize.pillHeight) / 2,
      transformOrigin: isRight ? 'right center' : 'left center',
    }
  }

  const getPanelPosition = (): CSSProperties => {
    // Mobile-first responsive design
    if (screenDimensions.isMobile) {
      return {
        position: 'fixed',
        bottom: `${safeArea.bottom}px`,
        left: `${safeArea.left}px`,
        right: `${safeArea.right}px`,
        top: 'auto',
        width: `calc(100vw - ${safeArea.left + safeArea.right}px)`,
        height: `calc(85vh - ${safeArea.bottom}px)`,
        minHeight: '300px',
        maxHeight: '600px',
      } as CSSProperties
    }

    // Tablet responsive design
    if (screenDimensions.isTablet) {
      return {
        position: 'fixed',
        width: bubbleSize.expanded.width,
        height: bubbleSize.expanded.height,
        maxWidth: bubbleSize.expanded.maxWidth,
        maxHeight: bubbleSize.expanded.maxHeight,
        ...getPositionValues(),
      } as CSSProperties
    }

    // Desktop responsive design
    return {
      position: 'fixed',
      width: bubbleSize.expanded.width,
      height: bubbleSize.expanded.height,
      maxWidth: bubbleSize.expanded.maxWidth,
      maxHeight: bubbleSize.expanded.maxHeight,
      ...getPositionValues(),
    } as CSSProperties
  }

  const getPositionValues = () => {
    const isRight = preferences.position.includes('right')
    const isTop = preferences.position.includes('top')

    const margin = screenDimensions.isMobile ? 8 : 20
    const screenPadding = {
      top: safeArea.top,
      right: safeArea.right,
      bottom: safeArea.bottom,
      left: safeArea.left,
    }

    // Adjust for Chatway widget when bubble is at bottom-right
    const chatwayOffset =
      preferences.position === 'bottom-right' && screenDimensions.isDesktop
        ? 96
        : 0

    let left: string | undefined = undefined
    let right: string | undefined = undefined
    let top: string | undefined = undefined
    let bottom: string | undefined = undefined

    if (isRight) {
      right = `${screenPadding.right + chatwayOffset}px`
    } else {
      left = `${screenPadding.left}px`
    }

    if (isTop) {
      top = `${screenPadding.top + bubbleSize.bubbleSize + margin}px`
    } else {
      bottom = `${screenPadding.bottom + bubbleSize.bubbleSize + margin}px`
    }

    // Ensure panel stays within viewport bounds
    if (top) {
      const maxTop =
        screenDimensions.height -
        parseInt(bubbleSize.expanded.maxHeight) -
        screenPadding.bottom
      const topValue = parseInt(top)
      if (topValue > maxTop) {
        top = `${Math.max(screenPadding.top, maxTop)}px`
      }
    }

    if (bottom) {
      const maxBottom =
        screenDimensions.height -
        parseInt(bubbleSize.expanded.maxHeight) -
        screenPadding.top
      const bottomValue = parseInt(bottom)
      if (bottomValue > maxBottom) {
        bottom = `${Math.max(screenPadding.bottom, maxBottom)}px`
      }
    }

    return { left, right, top, bottom }
  }

  const getExpansionOrigin = () => {
    const isRight = preferences.position.includes('right')
    const isTop = preferences.position.includes('top')

    if (screenDimensions.isMobile) {
      return 'bottom right'
    }

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
              className='bg-background/95 ring-border absolute flex items-center rounded-full border px-3 py-1.5 shadow-xl ring-1 backdrop-blur-xl sm:px-4 sm:py-2'
              style={{
                ...notificationPosition,
                minWidth: screenDimensions.isMobile ? 160 : 200,
                maxWidth: screenDimensions.isMobile ? 280 : 320,
                height: bubbleSize.pillHeight,
                zIndex: 0,
              }}>
              <NotificationIcon type={currentNotification.type} />
              <span className='text-foreground mr-1 ml-2 truncate text-xs font-medium sm:text-sm'>
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
              }}
              className='overflow-hidden'>
              <Card className='bg-background/95 ring-border h-full w-full overflow-hidden rounded-xl border shadow-2xl ring-1 backdrop-blur-xl sm:rounded-2xl'>
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
          onClick={handleBubbleButtonClick}
          className={cn(
            'bg-background ring-border relative flex items-center justify-center rounded-full border shadow-xl ring-1 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl',
            bubbleSize.bubble,
            'active:scale-95', // Add touch feedback
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

      {/* Render external terminal panels */}
      {preferences.terminalMode !== 'floating' && (
        <TerminalPanel
          mode={preferences.terminalMode}
          onClose={() => {
            updatePreference('terminalMode', 'floating')
          }}
        />
      )}
    </>
  )
}

const NotificationIcon = ({ type }: { type: NotificationType }) => {
  const screenDimensions = useScreenDimensions()
  const iconSize = screenDimensions.isMobile ? 12 : 14

  const iconProps = { size: iconSize, className: '' }

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
