'use client'

import {
  Clock,
  Maximize2,
  PictureInPicture,
  List as Queue,
  RefreshCw,
  Server,
  Settings,
  Terminal,
  X,
} from 'lucide-react'
import { motion } from 'motion/react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type {
  Panel,
  Preferences,
  UpdatePreferenceFunction,
} from './bubble-types'

const MenuPanel = ({
  onNavigate,
  onStartSync,
  onClose,
  activeProcesses,
  isSyncing,
  preferences,
  onUpdatePreference,
}: {
  onNavigate: (panel: Panel) => void
  onStartSync: () => void
  onClose: () => void
  activeProcesses: Set<string>
  isSyncing: boolean
  preferences: Preferences
  onUpdatePreference: UpdatePreferenceFunction
}) => {
  const menuItems = [
    {
      icon: Settings,
      label: 'Settings',
      panel: 'preferences' as Panel,
      description: 'Customize interface settings',
      color: 'text-primary',
    },
    {
      icon: Terminal,
      label: 'Application Logs',
      panel: 'logs' as Panel,
      description: 'View deployment & runtime logs',
      color: 'text-primary',
    },
    {
      icon: Server,
      label: 'Server Terminal',
      panel: 'terminal' as Panel,
      description: 'Access server terminals',
      color: 'text-primary',
      badge: 'Enhanced',
    },
    {
      icon: Queue,
      label: 'Job Queues',
      panel: 'queues' as Panel,
      description: 'Monitor deployment queues',
      color: 'text-primary',
    },
    {
      icon: RefreshCw,
      label: 'Sync Status',
      panel: 'sync' as Panel,
      description: 'Platform synchronization',
      color: 'text-primary',
    },
  ]

  const terminalModes = [
    {
      icon: Terminal,
      label: 'Floating',
      mode: 'floating' as const,
      description: 'Terminal in floating panel',
      current: preferences.terminalMode === 'floating',
    },
    {
      icon: PictureInPicture,
      label: 'Embedded',
      mode: 'embedded' as const,
      description: 'Terminal at bottom of page',
      current: preferences.terminalMode === 'embedded',
    },
    {
      icon: Maximize2,
      label: 'Fullscreen',
      mode: 'fullscreen' as const,
      description: 'Terminal in full screen',
      current: preferences.terminalMode === 'fullscreen',
    },
  ]

  const handleTerminalModeChange = (
    mode: 'floating' | 'embedded' | 'fullscreen',
  ) => {
    onUpdatePreference('terminalMode', mode)
    onNavigate('terminal')
  }

  return (
    <div className='flex h-full flex-col'>
      {/* STICKY HEADER */}
      <div className='bg-background/95 border-border/50 sticky top-0 z-10 border-b backdrop-blur-sm'>
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
            onClick={onClose}
            className='ml-2 h-8 w-8 flex-shrink-0'>
            <X size={14} />
          </Button>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className='flex-1 overflow-hidden'>
        <div className='h-full overflow-y-auto'>
          {/* Quick Terminal Mode Selector */}
          <div className='p-4'>
            <div className='mb-4'>
              <h3 className='text-foreground mb-3 text-sm font-medium'>
                Terminal Display
              </h3>
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
                    )}>
                    <mode.icon
                      size={20}
                      className={cn(
                        'transition-colors',
                        mode.current ? 'text-primary' : 'text-muted-foreground',
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
            </div>
          </div>

          {/* Main Menu Items */}
          <div className='space-y-3 p-4 pt-0'>
            {menuItems.map((item, index) => (
              <motion.div
                key={item.panel}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}>
                <Button
                  variant='ghost'
                  className='group hover:bg-accent/50 h-16 w-full justify-start px-4 text-left transition-all duration-200'
                  onClick={() => {
                    if (item.panel === 'sync') onStartSync()
                    onNavigate(item.panel)
                  }}>
                  <div className='flex w-full items-center space-x-4'>
                    <div className='group-hover:bg-accent flex-shrink-0 rounded-xl p-2 transition-colors group-hover:shadow-sm'>
                      <item.icon size={20} className={item.color} />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <div className='text-foreground flex items-center gap-2 truncate text-sm font-semibold'>
                        {item.label}
                        {item.badge && (
                          <Badge variant='secondary' className='text-xs'>
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <div className='text-muted-foreground truncate text-xs'>
                        {item.description}
                      </div>
                    </div>
                    <div className='flex-shrink-0'>
                      {item.panel === 'sync' && activeProcesses.has('sync') && (
                        <div className='bg-primary h-2.5 w-2.5 animate-pulse rounded-full' />
                      )}
                      {item.panel === 'queues' &&
                        activeProcesses.has('queue') && (
                          <div className='bg-secondary-foreground h-2.5 w-2.5 animate-pulse rounded-full' />
                        )}
                    </div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Platform Status */}
          <div className='p-4'>
            <div className='bg-muted/30 rounded-lg border p-4 backdrop-blur-sm'>
              <h3 className='text-foreground mb-3 text-sm font-medium'>
                Platform Status
              </h3>
              <div className='grid grid-cols-2 gap-3 text-xs'>
                <div className='flex items-center gap-2'>
                  <div className='bg-primary h-2 w-2 animate-pulse rounded-full'></div>
                  <span className='text-muted-foreground'>Services Online</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full',
                      activeProcesses.has('queue')
                        ? 'bg-secondary-foreground animate-pulse'
                        : 'bg-muted-foreground',
                    )}></div>
                  <span className='text-muted-foreground'>
                    {activeProcesses.has('queue')
                      ? 'Deployments Active'
                      : 'Deploy Queue Idle'}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Clock size={10} className='text-muted-foreground' />
                  <span className='text-muted-foreground'>
                    Last sync: 2m ago
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Server size={10} className='text-muted-foreground' />
                  <span className='text-muted-foreground'>98.5% uptime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MenuPanel
