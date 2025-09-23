'use client'

import {
  Clock,
  List as Queue,
  RefreshCw,
  Server,
  Settings,
  Terminal,
  X,
} from 'lucide-react'
import { motion } from 'motion/react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

type Panel = 'menu' | 'preferences' | 'logs' | 'queues' | 'sync'

const MenuPanel = ({
  onNavigate,
  onStartSync,
  onClose,
  activeProcesses,
  isSyncing,
}: {
  onNavigate: (panel: Panel) => void
  onStartSync: () => void
  onClose: () => void
  activeProcesses: Set<string>
  isSyncing: boolean
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

  return (
    <motion.div
      key='menu'
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className='flex h-full flex-col p-6'>
      {/* Header */}
      <div className='mb-6 flex items-center justify-between'>
        <div className='min-w-0 flex-1'>
          <h2 className='text-foreground truncate text-xl font-semibold'>
            Control Panel
          </h2>
          <p className='text-muted-foreground mt-1 truncate text-sm'>
            Platform overview & controls
          </p>
        </div>
        <Button
          variant='ghost'
          size='icon'
          onClick={onClose}
          className='ml-2 h-9 w-9 flex-shrink-0'>
          <X size={16} />
        </Button>
      </div>

      {/* Menu Items */}
      <div className='min-h-0 flex-1 space-y-3'>
        <ScrollArea className='h-full'>
          <div className='space-y-3 pr-4'>
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
                  className='group h-16 w-full justify-start px-4 text-left transition-all duration-200'
                  onClick={() => {
                    if (item.panel === 'sync') onStartSync()
                    onNavigate(item.panel)
                  }}>
                  <div className='flex w-full items-center space-x-4'>
                    <div className='group-hover:bg-background/40 flex-shrink-0 rounded-lg p-2 transition-colors group-hover:shadow-sm'>
                      <item.icon size={20} className={item.color} />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <div className='text-foreground truncate text-sm font-semibold'>
                        {item.label}
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
        </ScrollArea>
      </div>

      {/* Platform Status - Updated for dFlow PaaS */}
      <div className='bg-muted/30 mt-4 flex-shrink-0 rounded-lg border p-4 backdrop-blur-sm'>
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
            <span className='text-muted-foreground'>Last sync: 2m ago</span>
          </div>
          <div className='flex items-center gap-2'>
            <Server size={10} className='text-muted-foreground' />
            <span className='text-muted-foreground'>98.5% uptime</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default MenuPanel
