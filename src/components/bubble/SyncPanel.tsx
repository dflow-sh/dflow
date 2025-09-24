'use client'

import { ArrowLeft, CheckCircle2, Clock, RefreshCw, Zap } from 'lucide-react'
import { motion } from 'motion/react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
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
    <div className='flex h-full flex-col'>
      {/* STICKY HEADER */}
      <div className='bg-background/95 border-border/50 sticky top-0 z-10 border-b backdrop-blur-sm'>
        <div className='flex items-center p-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={onBack}
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
      <ScrollArea className='flex-1'>
        <div className='space-y-6 p-4'>
          {/* Current Status Display */}
          <div className='bg-muted/30 rounded-lg border p-4'>
            <div className='flex items-center gap-4'>
              <motion.div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full border-2',
                  isSyncing
                    ? 'border-primary/50 bg-primary/10'
                    : 'border-border bg-background',
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
                  {isSyncing ? (
                    <RefreshCw size={20} className='text-primary' />
                  ) : (
                    <CheckCircle2 size={20} className='text-primary' />
                  )}
                </motion.div>
              </motion.div>

              <div className='flex-1'>
                <div className='mb-1 flex items-center gap-2'>
                  <span className='text-foreground text-sm font-medium'>
                    Status: {isSyncing ? 'Synchronizing...' : 'Up to date'}
                  </span>
                  <Badge
                    variant={isSyncing ? 'default' : 'secondary'}
                    className='text-xs'>
                    {isSyncing ? 'Active' : 'Idle'}
                  </Badge>
                </div>
                <p className='text-muted-foreground text-xs'>
                  {isSyncing
                    ? 'Updating platform data from server'
                    : 'All platform data is synchronized'}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          {isSyncing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className='space-y-3'>
              <div className='flex justify-between text-sm'>
                <span className='text-foreground font-medium'>
                  Sync Progress
                </span>
                <span className='text-muted-foreground'>{progress}%</span>
              </div>
              <Progress value={progress} className='h-2' />
              <p className='text-muted-foreground text-center text-xs'>
                Synchronizing platform configuration and user data...
              </p>
            </motion.div>
          )}

          {/* Sync Controls */}
          {!isSyncing && (
            <div className='space-y-3'>
              <div className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
                Sync Actions
              </div>
              <Button onClick={onStartSync} className='w-full gap-2' size='lg'>
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
                  <div className='bg-primary h-2 w-2 rounded-full' />
                  <span className='text-muted-foreground text-sm'>
                    2 minutes ago
                  </span>
                </div>
              </div>

              <div className='bg-muted/20 flex items-center justify-between rounded-lg border p-3'>
                <div className='flex items-center gap-3'>
                  <Zap size={14} className='text-muted-foreground' />
                  <span className='text-foreground text-sm'>
                    Next scheduled sync
                  </span>
                </div>
                <span className='text-muted-foreground text-sm'>
                  In 8 minutes
                </span>
              </div>

              <div className='bg-muted/20 flex items-center justify-between rounded-lg border p-3'>
                <div className='flex items-center gap-3'>
                  <CheckCircle2 size={14} className='text-muted-foreground' />
                  <span className='text-foreground text-sm'>Sync health</span>
                </div>
                <Badge
                  variant='secondary'
                  className='bg-primary/10 text-primary'>
                  Healthy
                </Badge>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className='text-muted-foreground text-center text-xs'>
            Automatic sync runs every 10 minutes • No errors detected
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

export default SyncPanel
