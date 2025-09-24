'use client'

import { ArrowLeft } from 'lucide-react'
import { motion } from 'motion/react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

const QueuesPanel = ({ onBack }: { onBack: () => void }) => {
  const stats = [
    {
      label: 'Active',
      value: 3,
      color: 'bg-primary',
      textColor: 'text-primary',
      bgColor: 'bg-primary/10',
      change: '+2',
    },
    {
      label: 'Pending',
      value: 12,
      color: 'bg-muted-foreground',
      textColor: 'text-muted-foreground',
      bgColor: 'bg-muted/20',
      change: '-5',
    },
    {
      label: 'Completed',
      value: 847,
      color: 'bg-primary',
      textColor: 'text-primary',
      bgColor: 'bg-primary/10',
      change: '+23',
    },
    {
      label: 'Failed',
      value: 2,
      color: 'bg-destructive',
      textColor: 'text-destructive',
      bgColor: 'bg-destructive/10',
      change: '0',
    },
  ]

  const recentJobs = [
    {
      name: 'Process user data',
      status: 'running',
      progress: 75,
      time: '2m ago',
    },
    {
      name: 'Generate reports',
      status: 'pending',
      progress: 0,
      time: '5m ago',
    },
    {
      name: 'Send notifications',
      status: 'completed',
      progress: 100,
      time: '8m ago',
    },
    {
      name: 'Backup database',
      status: 'running',
      progress: 45,
      time: '1m ago',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-primary'
      case 'completed':
        return 'text-primary'
      case 'pending':
        return 'text-muted-foreground'
      case 'failed':
        return 'text-destructive'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <motion.div
      key='queues'
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className='flex h-full flex-col'>
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
              Queue Status
            </h2>
            <p className='text-muted-foreground text-xs'>
              Monitor job processing
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className='flex-1'>
        <div className='space-y-6 p-4'>
          {/* Stats Grid */}
          <div className='mb-6 grid grid-cols-2 gap-3'>
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'rounded-lg p-3 transition-colors hover:shadow-sm',
                  stat.bgColor,
                )}>
                <div className='mb-2 flex items-center justify-between'>
                  <div className={cn('h-2 w-2 rounded-full', stat.color)} />
                  <span
                    className={cn(
                      'text-xs font-medium',
                      stat.change.startsWith('+')
                        ? 'text-primary'
                        : stat.change === '0'
                          ? 'text-muted-foreground'
                          : 'text-destructive',
                    )}>
                    {stat.change}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-foreground truncate text-sm font-medium'>
                    {stat.label}
                  </span>
                  <span className={cn('text-lg font-bold', stat.textColor)}>
                    {stat.value}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent Jobs */}
          <div className='min-h-0 flex-1'>
            <h3 className='text-foreground mb-3 text-sm font-medium'>
              Recent Jobs
            </h3>
            <div className='space-y-2 pr-3'>
              {recentJobs.map((job, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className='bg-muted/30 hover:bg-accent/30 rounded-lg border p-3 transition-colors'>
                  <div className='mb-2 flex items-center justify-between'>
                    <span className='text-foreground truncate text-sm font-medium'>
                      {job.name}
                    </span>
                    <div className='ml-2 flex flex-shrink-0 items-center gap-2'>
                      <Badge
                        variant='secondary'
                        className={cn('text-xs', getStatusColor(job.status))}>
                        {job.status}
                      </Badge>
                      <span className='text-muted-foreground text-xs'>
                        {job.time}
                      </span>
                    </div>
                  </div>
                  {job.status === 'running' && (
                    <Progress value={job.progress} className='h-1.5' />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  )
}

export default QueuesPanel
