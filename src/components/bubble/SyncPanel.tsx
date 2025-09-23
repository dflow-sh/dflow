'use client'

import { ArrowLeft, RefreshCw } from 'lucide-react'
import { motion } from 'motion/react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const SyncPanel = ({
  onBack,
  progress,
  isSyncing,
  onStartSync,
}: {
  onBack: () => void
  progress: number
  isSyncing: boolean
  onStartSync: () => void
}) => {
  return (
    <motion.div
      key='sync'
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className='flex h-full flex-col p-6'>
      {/* Header */}
      <div className='mb-6 flex items-center'>
        <Button
          variant='ghost'
          size='icon'
          onClick={onBack}
          className='mr-3 h-9 w-9'>
          <ArrowLeft size={16} />
        </Button>
        <div className='min-w-0'>
          <h2 className='text-foreground truncate text-xl font-semibold'>
            Sync Manager
          </h2>
          <p className='text-muted-foreground mt-1 truncate text-sm'>
            Manage data synchronization
          </p>
        </div>
      </div>

      {/* Content */}
      <div className='min-h-0 flex-1 space-y-6'>
        <div className='text-center'>
          <motion.div
            className={cn(
              'mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-4 backdrop-blur-sm',
              isSyncing
                ? 'border-primary/50 bg-primary/10'
                : 'border-border bg-muted/30',
            )}
            animate={
              isSyncing
                ? {
                    borderColor: [
                      'hsl(var(--primary) / 0.5)',
                      'hsl(var(--primary))',
                      'hsl(var(--primary) / 0.5)',
                    ],
                  }
                : {}
            }
            transition={{ duration: 2, repeat: isSyncing ? Infinity : 0 }}>
            <motion.div
              animate={isSyncing ? { rotate: 360 } : {}}
              transition={{
                duration: 2,
                repeat: isSyncing ? Infinity : 0,
                ease: 'linear',
              }}>
              <RefreshCw
                size={32}
                className={isSyncing ? 'text-primary' : 'text-muted-foreground'}
              />
            </motion.div>
          </motion.div>

          <div
            className={cn(
              'mb-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
              isSyncing
                ? 'bg-primary/10 text-primary'
                : 'bg-primary/10 text-primary',
            )}>
            {isSyncing ? 'Synchronizing...' : 'Up to date'}
          </div>
          <p className='text-muted-foreground text-sm'>
            {isSyncing
              ? 'Updating data from server'
              : 'All data is synchronized'}
          </p>
        </div>

        {isSyncing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='space-y-3'>
            <div className='text-foreground flex justify-between text-sm'>
              <span>Sync Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className='h-2' />
            <p className='text-muted-foreground text-center text-xs'>
              Synchronizing user preferences...
            </p>
          </motion.div>
        )}

        {!isSyncing && (
          <Button onClick={onStartSync} className='w-full' size='lg'>
            <RefreshCw size={16} className='mr-2' />
            Start Sync
          </Button>
        )}

        {/* Status Cards */}
        <div className='space-y-2'>
          <div className='bg-muted/30 flex items-center justify-between rounded-lg border p-3'>
            <span className='text-foreground text-sm'>Last sync</span>
            <div className='flex items-center gap-2'>
              <div className='bg-primary h-2 w-2 rounded-full' />
              <span className='text-muted-foreground text-sm'>
                2 minutes ago
              </span>
            </div>
          </div>
          <div className='bg-muted/30 flex items-center justify-between rounded-lg border p-3'>
            <span className='text-foreground text-sm'>Next scheduled sync</span>
            <span className='text-muted-foreground text-sm'>In 8 minutes</span>
          </div>
          <div className='bg-muted/30 flex items-center justify-between rounded-lg border p-3'>
            <span className='text-foreground text-sm'>Sync status</span>
            <Badge
              variant={isSyncing ? 'default' : 'secondary'}
              className='text-xs'>
              {isSyncing ? 'Active' : 'Idle'}
            </Badge>
          </div>
        </div>

        <div className='text-muted-foreground text-center text-xs'>
          Last sync completed successfully • No errors
        </div>
      </div>
    </motion.div>
  )
}

export default SyncPanel
