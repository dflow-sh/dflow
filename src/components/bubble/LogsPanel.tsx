'use client'

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Download,
  FileText,
  Pause,
  Play,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const LogsPanel = ({ onBack }: { onBack: () => void }) => {
  const [autoScroll, setAutoScroll] = useState(true)
  const [logLevel, setLogLevel] = useState('all')

  const mockLogs = [
    {
      time: '15:30:15',
      level: 'INFO',
      message: 'Application deployment started successfully',
      id: 1,
    },
    {
      time: '15:30:16',
      level: 'DEBUG',
      message: 'Docker container initialization completed',
      id: 2,
    },
    {
      time: '15:30:17',
      level: 'INFO',
      message: 'Load balancer configuration updated',
      id: 3,
    },
    {
      time: '15:30:18',
      level: 'WARN',
      message: 'High memory usage detected on node-2',
      id: 4,
    },
    {
      time: '15:30:19',
      level: 'INFO',
      message: 'SSL certificate renewal scheduled',
      id: 5,
    },
    {
      time: '15:30:20',
      level: 'ERROR',
      message: 'Failed to connect to external monitoring service',
      id: 6,
    },
    {
      time: '15:30:21',
      level: 'INFO',
      message: 'Automatic retry initiated for failed connection',
      id: 7,
    },
    {
      time: '15:30:26',
      level: 'SUCCESS',
      message: 'Monitoring service connection restored',
      id: 8,
    },
  ]

  const getLevelIcon = (level: string) => {
    switch (level.toUpperCase()) {
      case 'ERROR':
        return <AlertCircle size={12} className='text-destructive' />
      case 'WARN':
        return <AlertCircle size={12} className='text-orange-500' />
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
        return 'text-orange-500'
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

  const getLevelStats = () => {
    const stats = mockLogs.reduce(
      (acc, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    return stats
  }

  const levelStats = getLevelStats()

  return (
    <div className='flex h-full flex-col'>
      {/* STICKY HEADER */}
      <div className='bg-background/95 border-border/50 sticky top-0 z-10 border-b backdrop-blur-sm'>
        <div className='flex items-center justify-between p-4'>
          <div className='flex items-center'>
            <Button
              variant='ghost'
              size='icon'
              onClick={onBack}
              className='mr-3 h-8 w-8'>
              <ArrowLeft size={14} />
            </Button>
            <div>
              <h2 className='text-foreground text-lg font-semibold'>
                Application Logs
              </h2>
              <p className='text-muted-foreground text-xs'>
                Real-time deployment & runtime logs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className='flex-1 overflow-hidden'>
        <div className='h-full overflow-y-auto'>
          <div className='space-y-4 p-4'>
            {/* Log Statistics */}
            <div className='space-y-3'>
              <div className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
                Log Summary
              </div>
              <div className='flex flex-wrap gap-2'>
                {Object.entries(levelStats).map(([level, count]) => (
                  <div
                    key={level}
                    className='bg-muted/30 flex items-center gap-2 rounded-lg border px-3 py-2'>
                    {getLevelIcon(level)}
                    <span className='text-foreground text-xs font-medium'>
                      {level}
                    </span>
                    <Badge
                      variant='secondary'
                      className='h-5 min-w-[20px] text-xs'>
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Log Controls */}
            <div className='space-y-3'>
              <div className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
                Log Controls
              </div>
              <div className='flex items-center justify-between gap-2'>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setAutoScroll(!autoScroll)}
                    className='gap-2'>
                    {autoScroll ? <Pause size={14} /> : <Play size={14} />}
                    {autoScroll ? 'Pause' : 'Resume'}
                  </Button>
                  <Button variant='outline' size='sm' className='gap-2'>
                    <Download size={14} />
                    Export
                  </Button>
                </div>
                <div className='text-muted-foreground text-xs'>
                  Auto-scroll: {autoScroll ? 'ON' : 'OFF'}
                </div>
              </div>
            </div>

            {/* Logs Display */}
            <div className='bg-muted/20 overflow-hidden rounded-xl border'>
              <div className='max-h-80 overflow-auto bg-slate-950 p-4 font-mono text-sm'>
                <div className='space-y-1'>
                  {mockLogs.map((log, index) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className='flex items-start gap-3 rounded px-2 py-1 transition-colors hover:bg-slate-800/50'>
                      <div className='flex w-20 shrink-0 items-center gap-2'>
                        {getLevelIcon(log.level)}
                        <span className='text-xs text-slate-400'>
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
                      <span className='flex-1 text-xs leading-relaxed text-slate-200'>
                        {log.message}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Log Footer Info */}
            <div className='text-muted-foreground flex items-center justify-between text-xs'>
              <span>{mockLogs.length} log entries displayed</span>
              <span>Last updated: now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LogsPanel
