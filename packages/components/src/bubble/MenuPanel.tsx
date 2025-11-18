'use client'

import {
  Bell,
  ChevronRight,
  Cog,
  LucideProps,
  Maximize2,
  PictureInPicture,
  List as Queue,
  RefreshCw,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react'
import { motion } from 'motion/react'
import {
  ForwardRefExoticComponent,
  RefAttributes,
  useEffect,
  useState,
} from 'react'

import { Badge } from '@dflow/components/ui/badge'
import { Button } from '@dflow/components/ui/button'
import { cn } from '@dflow/lib/utils'
import { useBubble } from '@dflow/providers/BubbleProvider'
import { useTerminal } from '@dflow/providers/TerminalProvider'

import type { Panel } from './bubble-types'

declare global {
  interface Window {
    Headway?: {
      init: (config: { selector: string; account: string }) => void
      show: () => void
    }
    HW_config?: {
      selector: string
      account: string
    }
  }
}

const MenuPanel = () => {
  const [isHeadwayReady, setIsHeadwayReady] = useState(false)
  const {
    navigateToPanel,
    startSync,
    setIsExpanded,
    activeProcesses,
    isSyncing,
    isSSESyncing,
  } = useBubble()

  const {
    isOpen: isTerminalOpen,
    setIsOpen: setTerminalOpen,
    terminalPreferences,
    updateTerminalPreference,
  } = useTerminal()

  const menuItems: {
    icon: ForwardRefExoticComponent<
      Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
    >
    label: string
    panel: Panel
    description: string
    color: string
    badge?: string
    onClick?: () => void
  }[] = [
    {
      icon: Terminal,
      label: 'Console',
      panel: 'terminal' as Panel,
      description: 'View real-time logs',
      color: 'text-foreground',
      onClick: () => {
        // Set terminal as open when user clicks the menu item
        setTerminalOpen(true)

        // If terminal mode is floating, navigate to terminal panel
        if (terminalPreferences.terminalMode === 'floating') {
          navigateToPanel('terminal')
        } else {
          // For embedded/fullscreen modes, just close the bubble
          setIsExpanded(false)
        }
      },
    },
    {
      icon: Queue,
      label: 'Job Queues',
      panel: 'queues' as Panel,
      description: 'Monitor deployment queues',
      color: 'text-foreground',
    },
    {
      icon: RefreshCw,
      label: 'Sync Status',
      panel: 'sync' as Panel,
      description: 'Platform synchronization',
      color: 'text-foreground',
    },
    {
      icon: Cog,
      label: 'Preferences',
      panel: 'preferences' as Panel,
      description: 'Customize interface settings',
      color: 'text-foreground',
    },
  ]

  const terminalModes = [
    {
      icon: PictureInPicture,
      label: 'Floating',
      mode: 'floating' as const,
      description: 'Terminal in floating panel',
      current: terminalPreferences.terminalMode === 'floating',
    },
    {
      icon: Terminal,
      label: 'Embedded',
      mode: 'embedded' as const,
      description: 'Terminal at bottom of page',
      current: terminalPreferences.terminalMode === 'embedded',
    },
    {
      icon: Maximize2,
      label: 'Fullscreen',
      mode: 'fullscreen' as const,
      description: 'Terminal in full screen',
      current: terminalPreferences.terminalMode === 'fullscreen',
    },
  ]

  const handleTerminalModeChange = (
    mode: 'floating' | 'embedded' | 'fullscreen',
  ) => {
    updateTerminalPreference('terminalMode', mode)

    // If switching to floating mode and terminal is open, navigate to terminal panel
    if (mode === 'floating') {
      setIsExpanded(true)
      navigateToPanel('terminal')
    } else if (mode === 'embedded' || mode === 'fullscreen') {
      setIsExpanded(false)
    }

    setTerminalOpen(true)
  }

  const getTerminalStatus = () => {
    if (!isTerminalOpen) return null

    switch (terminalPreferences.terminalMode) {
      case 'floating':
        return 'Open in Panel'
      case 'embedded':
        return 'Open Embedded'
      case 'fullscreen':
        return 'Open Fullscreen'
      default:
        return 'Open'
    }
  }

  useEffect(() => {
    let attempts = 0
    const maxAttempts = 10

    const checkAndInitHeadway = () => {
      attempts++

      // Check if Headway is loaded
      if (window.Headway && window.HW_config) {
        try {
          // Re-initialize Headway to ensure it scans the DOM
          window.Headway.init(window.HW_config)
          setIsHeadwayReady(true)
          console.log('✅ Headway initialized successfully')
        } catch (error) {
          console.error('❌ Failed to initialize Headway:', error)
          if (attempts < maxAttempts) {
            setTimeout(checkAndInitHeadway, 200)
          }
        }
      } else if (attempts < maxAttempts) {
        // Retry if not loaded yet
        setTimeout(checkAndInitHeadway, 200)
      } else {
        console.warn('⚠️ Headway failed to load after multiple attempts')
      }
    }

    checkAndInitHeadway()
  }, [])

  const handleHeadwayClick = () => {
    if (!isHeadwayReady) {
      console.warn('⏳ Headway is not ready yet, please try again')
      return
    }

    // Method 1: Click the badge (most reliable)
    const headwayBadge = document.querySelector('.HW_badge')
    if (headwayBadge instanceof HTMLElement) {
      console.log('📌 Opening Headway via badge click')
      headwayBadge.click()
      return
    }

    // Method 2: Use Headway API directly
    if (window.Headway?.show) {
      console.log('📌 Opening Headway via API')
      window.Headway.show()
      return
    }

    // Method 3: Try to show the widget container
    const headwayFrame = document.querySelector('#HW_frame_cont')
    if (headwayFrame instanceof HTMLElement) {
      console.log('📌 Opening Headway via frame')
      headwayFrame.style.display = 'block'
      return
    }

    console.error('❌ Unable to open Headway - no method succeeded')
  }

  return (
    <div className='flex h-full flex-col'>
      {/* STICKY HEADER */}
      <div className='bg-muted/30 border-border/50 sticky top-0 z-10 border-b'>
        <div className='flex items-center justify-between p-4'>
          <div className='min-w-0 flex-1'>
            <h2 className='text-foreground truncate text-lg font-semibold'>
              Control Panel
            </h2>
            <p className='text-muted-foreground truncate text-xs'>
              Platform overview & controls
            </p>
          </div>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setIsExpanded(false)}
            className='ml-2 h-8 w-8 flex-shrink-0'>
            <X size={14} />
          </Button>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className='flex-1 overflow-hidden'>
        <div className='h-full overflow-y-auto'>
          {/* Quick Terminal Mode Selector */}
          {/* <div className='p-4'>
            <div className='mb-3 flex items-center justify-between'>
              <h3 className='text-foreground text-sm font-medium'>
                Terminal Mode
              </h3>
              {isTerminalOpen && (
                <Badge variant='outline' className='text-xs'>
                  {getTerminalStatus()}
                </Badge>
              )}
            </div>
            <div className='grid grid-cols-3 gap-2'>
              {terminalModes.map(mode => (
                <button
                  key={mode.mode}
                  onClick={() => handleTerminalModeChange(mode.mode)}
                  className={cn(
                    'group hover:bg-accent/50 flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all',
                    mode.current
                      ? 'border-primary bg-primary/5'
                      : 'border-border',
                    isTerminalOpen && mode.current && 'ring-primary/20 ring-2',
                  )}>
                  <mode.icon
                    size={20}
                    className={cn(
                      'transition-colors',
                      mode.current ? 'text-primary' : 'text-muted-foreground',
                      isTerminalOpen && mode.current && 'text-primary',
                    )}
                  />
                  <span
                    className={cn(
                      'text-xs font-medium',
                      mode.current ? 'text-primary' : 'text-foreground',
                    )}>
                    {mode.label}
                  </span>
                  <span className='text-muted-foreground text-[10px] leading-tight'>
                    {mode.description}
                  </span>
                </button>
              ))}
            </div>
            <p className='text-muted-foreground mt-2 text-xs'>
              {isTerminalOpen
                ? 'Terminal is currently open. Changing mode will reopen it.'
                : 'Choose how the terminal opens when you access it.'}
            </p>
          </div> */}

          {/* Main Menu Items */}
          <div className='space-y-3 p-4'>
            {menuItems.map((item, index) => {
              const isTerminalActive =
                item.panel === 'terminal' && isTerminalOpen

              return (
                <motion.div
                  key={item.panel}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}>
                  <Button
                    variant='outline'
                    className={cn(
                      'group bg-popover/60 hover:bg-popover h-16 w-full justify-start px-4 text-left',
                      isTerminalActive &&
                        'bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/30 border',
                    )}
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick()
                      } else {
                        if (item.panel === 'sync') startSync()
                        navigateToPanel(item.panel)
                      }
                    }}>
                    <div className='flex w-full items-center space-x-4'>
                      <Badge
                        variant={'secondary'}
                        className={cn(
                          'group-hover:bg-secondary p-2',
                          isTerminalActive &&
                            'bg-primary/10 hover:bg-primary/20',
                        )}>
                        <item.icon
                          size={20}
                          className={cn(
                            item.color,
                            isTerminalActive && 'text-primary',
                          )}
                        />
                      </Badge>
                      <div className='min-w-0 flex-1'>
                        <div className='text-foreground flex items-center gap-2 truncate text-sm font-semibold'>
                          {item.label}
                          {isTerminalActive && (
                            <Badge variant='secondary' className='text-xs'>
                              Active
                            </Badge>
                          )}
                          {item.badge && (
                            <Badge variant='secondary' className='text-xs'>
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <div className='text-muted-foreground truncate text-xs'>
                          {item.description}
                          {isTerminalActive &&
                            terminalPreferences.terminalMode !== 'floating' && (
                              <span className='text-primary ml-1'>
                                • Open externally
                              </span>
                            )}
                        </div>
                      </div>
                      <div className='flex-shrink-0'>
                        {item.panel === 'sync' &&
                          activeProcesses.has('sync') && (
                            <div className='bg-primary h-2.5 w-2.5 animate-pulse rounded-full' />
                          )}
                        {item.panel === 'queues' &&
                          activeProcesses.has('queue') && (
                            <div className='bg-secondary-foreground h-2.5 w-2.5 animate-pulse rounded-full' />
                          )}
                        {isTerminalActive && (
                          <div className='bg-primary h-2.5 w-2.5 rounded-full' />
                        )}
                      </div>
                    </div>
                  </Button>
                </motion.div>
              )
            })}
          </div>

          {/* Notifications Section */}
          <div className='border-border/50 border-t p-4'>
            <div className='mb-3 flex items-center justify-between'>
              <div>
                <h3 className='text-foreground text-sm font-medium'>
                  What's New
                </h3>
                <p className='text-muted-foreground text-xs'>
                  Latest updates and announcements
                </p>
              </div>
              <Badge variant='secondary' className='text-xs'>
                <Sparkles size={12} className='mr-1' />
                New
              </Badge>
            </div>

            {/* Custom Notifications UI */}
            <div className='space-y-2'>
              <button
                onClick={handleHeadwayClick}
                disabled={!isHeadwayReady}
                className={cn(
                  'bg-popover/60 hover:bg-popover border-input group w-full rounded-lg border p-3 text-left transition-all hover:cursor-pointer',
                  !isHeadwayReady && 'cursor-wait opacity-50',
                )}>
                <div className='flex items-start gap-3'>
                  <Badge
                    variant={'secondary'}
                    className={cn('group-hover:bg-secondary p-2')}>
                    <Bell size={16} />
                  </Badge>
                  <div className='min-w-0 flex-1'>
                    <div className='mb-1 flex items-center gap-2 text-sm font-medium'>
                      {isHeadwayReady
                        ? 'View All Updates'
                        : 'Loading Updates...'}
                      <ChevronRight size={14} />
                    </div>
                    <p className='text-muted-foreground text-xs leading-relaxed'>
                      {isHeadwayReady
                        ? `See what's new in the platform, features, and improvements`
                        : 'Please wait while we load the latest updates'}
                    </p>
                  </div>
                </div>
              </button>

              {/* Headway container - keep it visible for Headway to detect */}
              <div
                className='headway-notifications'
                style={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  opacity: 0,
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MenuPanel
