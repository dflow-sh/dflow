'use client'

import { ArrowLeft, CheckCircle2, Clock, RefreshCw, Zap } from 'lucide-react'
import { motion } from 'motion/react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useBubble } from '@/providers/BubbleProvider'

const SyncPanel = () => {
  const {
    goBack,
    syncProgress,
    isSyncing,
    isSSESyncing,
    startSync,
    syncMessage,
  } = useBubble()

  const isActive = isSyncing || isSSESyncing

  return (
    <div className='flex h-full flex-col'>
      {/* STICKY HEADER */}
      <div className='bg-background/95 border-border/50 sticky top-0 z-10 border-b backdrop-blur-sm'>
        <div className='flex items-center p-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={goBack}
            className='mr-3 h-8 w-8'>
            <ArrowLeft size={14} />
          </Button>
          <div>
            <h2 className='text-foreground text-lg font-semibold'>
              Sync Status
            </h2>
            <p className='text-muted-foreground text-xs'>
              Platform synchronization
            </p>
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className='flex-1 overflow-hidden'>
        <div className='h-full overflow-y-auto'>
          <div className='space-y-6 p-4'>
            {/* Current Status Display */}
            <div className='bg-muted/30 rounded-lg border p-4'>
              <div className='flex items-center gap-4'>
                <motion.div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full border-2',
                    isActive
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-border bg-background',
                  )}
                  animate={
                    isActive
                      ? {
                          borderColor: [
                            'hsl(var(--primary) / 0.5)',
                            'hsl(var(--primary))',
                            'hsl(var(--primary) / 0.5)',
                          ],
                        }
                      : {}
                  }
                  transition={{
                    duration: 2,
                    repeat: isActive ? Infinity : 0,
                  }}>
                  <motion.div
                    animate={isActive ? { rotate: 360 } : {}}
                    transition={{
                      duration: 2,
                      repeat: isActive ? Infinity : 0,
                      ease: 'linear',
                    }}>
                    {isActive ? (
                      <RefreshCw size={20} className='text-primary' />
                    ) : (
                      <CheckCircle2 size={20} className='text-primary' />
                    )}
                  </motion.div>
                </motion.div>

                <div className='flex-1'>
                  <div className='mb-1 flex items-center gap-2'>
                    <span className='text-foreground text-sm font-medium'>
                      Status: {isActive ? 'Synchronizing...' : 'Up to date'}
                    </span>
                    <Badge
                      variant={isActive ? 'default' : 'secondary'}
                      className='text-xs'>
                      {isActive ? 'Active' : 'Idle'}
                    </Badge>
                  </div>
                  <p className='text-muted-foreground text-xs'>
                    {isActive
                      ? syncMessage
                      : 'All platform data is synchronized'}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Section */}
            {isActive && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='space-y-3'>
                <div className='flex justify-between text-sm'>
                  <span className='text-foreground font-medium'>
                    Sync Progress
                  </span>
                  <span className='text-muted-foreground'>
                    {isSSESyncing ? 'Processing...' : `${syncProgress}%`}
                  </span>
                </div>
                <Progress
                  value={isSSESyncing ? 100 : syncProgress}
                  className='h-2'
                />
                <p className='text-muted-foreground text-center text-xs'>
                  {syncMessage}
                </p>
              </motion.div>
            )}

            {/* Sync Controls */}
            {!isActive && (
              <div className='space-y-3'>
                <div className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
                  Sync Actions
                </div>
                <Button onClick={startSync} className='w-full gap-2' size='lg'>
                  <RefreshCw size={16} />
                  Start Manual Sync
                </Button>
                <p className='text-muted-foreground text-center text-xs'>
                  Manual sync will update all platform data immediately
                </p>
              </div>
            )}

            {/* Sync Information Cards */}
            <div className='space-y-3'>
              <div className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
                Sync Information
              </div>
              <div className='grid gap-3'>
                <div className='bg-muted/20 flex items-center justify-between rounded-lg border p-3'>
                  <div className='flex items-center gap-3'>
                    <Clock size={14} className='text-muted-foreground' />
                    <span className='text-foreground text-sm'>Last sync</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full',
                        isActive ? 'bg-primary animate-pulse' : 'bg-primary',
                      )}
                    />
                    <span className='text-muted-foreground text-sm'>
                      {isActive ? 'Syncing now' : 'Auto'}
                    </span>
                  </div>
                </div>

                <div className='bg-muted/20 flex items-center justify-between rounded-lg border p-3'>
                  <div className='flex items-center gap-3'>
                    <Zap size={14} className='text-muted-foreground' />
                    <span className='text-foreground text-sm'>Auto-sync</span>
                  </div>
                  <Badge
                    variant='secondary'
                    className='bg-primary/10 text-primary'>
                    Enabled
                  </Badge>
                </div>

                <div className='bg-muted/20 flex items-center justify-between rounded-lg border p-3'>
                  <div className='flex items-center gap-3'>
                    <CheckCircle2 size={14} className='text-muted-foreground' />
                    <span className='text-foreground text-sm'>Sync health</span>
                  </div>
                  <Badge
                    variant='secondary'
                    className='bg-primary/10 text-primary'>
                    Connected
                  </Badge>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className='text-muted-foreground text-center text-xs'>
              {isActive
                ? 'Real-time sync in progress • Server connected'
                : 'Real-time sync enabled • Server connected'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SyncPanel
