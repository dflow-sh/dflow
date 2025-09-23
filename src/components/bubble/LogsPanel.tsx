'use client'

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  FileText,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

const mockLogs = [
  {
    time: '10:30:15',
    level: 'INFO',
    message: 'Application started successfully',
    id: 1,
  },
  {
    time: '10:30:16',
    level: 'DEBUG',
    message: 'Database connection established',
    id: 2,
  },
  {
    time: '10:30:17',
    level: 'INFO',
    message: 'User authentication initialized',
    id: 3,
  },
  {
    time: '10:30:18',
    level: 'WARN',
    message: 'Rate limit approaching for API endpoint',
    id: 4,
  },
  {
    time: '10:30:19',
    level: 'INFO',
    message: 'Background sync process started',
    id: 5,
  },
  {
    time: '10:30:20',
    level: 'ERROR',
    message: 'Failed to connect to external service',
    id: 6,
  },
  {
    time: '10:30:21',
    level: 'INFO',
    message: 'Retrying connection in 5 seconds',
    id: 7,
  },
  {
    time: '10:30:26',
    level: 'SUCCESS',
    message: 'Connection restored successfully',
    id: 8,
  },
]

const LogsPanel = ({ onBack }: { onBack: () => void }) => {
  const [autoScroll, setAutoScroll] = useState(true)

  const getLevelIcon = (level: string) => {
    switch (level.toUpperCase()) {
      case 'ERROR':
        return <AlertCircle size={12} className='text-destructive' />
      case 'WARN':
        return <AlertCircle size={12} className='text-muted-foreground' />
      case 'SUCCESS':
        return <CheckCircle size={12} className='text-primary' />
      case 'INFO':
        return <Activity size={12} className='text-primary' />
      case 'DEBUG':
        return <FileText size={12} className='text-muted-foreground' />
      default:
        return <Activity size={12} className='text-muted-foreground' />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'ERROR':
        return 'text-destructive'
      case 'WARN':
        return 'text-muted-foreground'
      case 'SUCCESS':
        return 'text-primary'
      case 'INFO':
        return 'text-primary'
      case 'DEBUG':
        return 'text-muted-foreground'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <motion.div
      key='logs'
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className='flex h-full flex-col p-6'>
      {/* Header */}
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex min-w-0 items-center'>
          <Button
            variant='ghost'
            size='icon'
            onClick={onBack}
            className='mr-3 h-9 w-9 flex-shrink-0'>
            <ArrowLeft size={16} />
          </Button>
          <div className='min-w-0'>
            <h2 className='text-foreground truncate text-xl font-semibold'>
              System Logs
            </h2>
            <p className='text-muted-foreground mt-1 truncate text-sm'>
              Real-time application logs
            </p>
          </div>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setAutoScroll(!autoScroll)}
          className='h-9 flex-shrink-0 px-3 text-xs'>
          {autoScroll ? 'Pause' : 'Resume'}
        </Button>
      </div>

      {/* Logs Content */}
      <div className='bg-muted/20 flex-1 overflow-auto rounded-lg border'>
        <ScrollArea className='h-full p-4'>
          <div className='space-y-2 font-mono text-xs'>
            {mockLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className='hover:bg-accent/30 flex items-start gap-3 rounded-md p-2 transition-colors'>
                <div className='flex w-20 shrink-0 items-center gap-1.5'>
                  {getLevelIcon(log.level)}
                  <span className='text-muted-foreground text-xs'>
                    {log.time}
                  </span>
                </div>
                <span
                  className={cn(
                    'w-16 shrink-0 text-xs font-bold',
                    getLevelColor(log.level),
                  )}>
                  [{log.level}]
                </span>
                <span className='text-foreground flex-1 text-xs leading-relaxed'>
                  {log.message}
                </span>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className='text-muted-foreground mt-3 flex items-center justify-between text-xs'>
        <span>Auto-scroll: {autoScroll ? 'ON' : 'OFF'}</span>
        <span>{mockLogs.length} entries</span>
      </div>
    </motion.div>
  )
}

export default LogsPanel
