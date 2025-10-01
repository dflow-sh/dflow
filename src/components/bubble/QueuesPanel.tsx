'use client'

import {
  AlertCircle,
  ArrowLeft,
  Database,
  Loader2,
  MoreHorizontal,
  RefreshCcw,
  Server,
  Trash,
  Zap,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import {
  flushServerQueuesAction,
  flushSingleQueueAction,
  getServerQueuesAction,
} from '@/actions/bullmq'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useBubble } from '@/providers/BubbleProvider'
import { useServers } from '@/providers/ServersProvider'

interface QueueStats {
  name: string
  counts: Record<string, number>
}

const QueuesPanel = () => {
  const { goBack } = useBubble()
  const {
    servers,
    loading: loadingServers,
    error: errorServers,
    refresh: refreshServers,
  } = useServers()

  const params = useParams()
  const serverId = params?.serverId as string

  // State management
  const [selectedServerId, setSelectedServerId] = useState<string>('')
  const [queues, setQueues] = useState<string[]>([])
  const [stats, setStats] = useState<QueueStats[]>([])
  const [error, setError] = useState<string | null>(null)

  // Infinite scroll state
  const [displayedQueues, setDisplayedQueues] = useState<QueueStats[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreQueues, setHasMoreQueues] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const ITEMS_PER_PAGE = 10

  // Auto-select server from URL params
  useEffect(() => {
    if (serverId && servers.some(s => s.id === serverId)) {
      setSelectedServerId(serverId)
    } else if (servers.length > 0 && !selectedServerId) {
      setSelectedServerId(servers[0].id)
    }
  }, [serverId, servers, selectedServerId])

  // Initialize displayed queues when stats change
  useEffect(() => {
    if (stats.length > 0) {
      const initialQueues = stats.slice(0, ITEMS_PER_PAGE)
      setDisplayedQueues(initialQueues)
      setHasMoreQueues(stats.length > ITEMS_PER_PAGE)
    } else {
      setDisplayedQueues([])
      setHasMoreQueues(false)
    }
  }, [stats])

  // Load more queues function
  const loadMoreQueues = useCallback(() => {
    if (isLoadingMore || !hasMoreQueues) return

    setIsLoadingMore(true)

    setTimeout(() => {
      const currentCount = displayedQueues.length
      const nextBatch = stats.slice(currentCount, currentCount + ITEMS_PER_PAGE)

      setDisplayedQueues(prev => [...prev, ...nextBatch])
      setHasMoreQueues(currentCount + nextBatch.length < stats.length)
      setIsLoadingMore(false)
    }, 300)
  }, [displayedQueues.length, stats, isLoadingMore, hasMoreQueues])

  // Infinite scroll handler
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget

      if (scrollHeight - scrollTop <= clientHeight + 50) {
        loadMoreQueues()
      }
    },
    [loadMoreQueues],
  )

  // Combined action to get queues and stats
  const { execute: getQueuesAndStats, isPending: isLoading } = useAction(
    getServerQueuesAction,
    {
      onError: ({ error }) => {
        const message = error?.serverError || 'Failed to fetch queue data'
        setError(message)
        toast.error(message)
      },
      onSuccess: ({ data }) => {
        setError(null)
        setQueues(data?.queues || [])
        setStats(data?.stats || [])
      },
    },
  )

  // Flush All Queues Action
  const { execute: flushAllQueues, isPending: isFlushingAll } = useAction(
    flushServerQueuesAction,
    {
      onError: ({ error }) => {
        const message = error?.serverError || 'Failed to flush queues'
        setError(message)
        toast.error(message)
      },
      onSuccess: ({ data }) => {
        setError(null)
        toast.success(data?.message || 'Queues flushed successfully')
        refreshData()
      },
    },
  )

  // Flush Single Queue Action
  const { execute: flushSingleQueue, isPending: isFlushingSingle } = useAction(
    flushSingleQueueAction,
    {
      onError: ({ error }) => {
        const message = error?.serverError || 'Failed to flush queue'
        setError(message)
        toast.error(message)
      },
      onSuccess: ({ data }) => {
        setError(null)
        toast.success(data?.message || 'Queue flushed successfully')
        refreshData()
      },
    },
  )

  // Refresh data function
  const refreshData = useCallback(async () => {
    if (!selectedServerId) return
    getQueuesAndStats({ serverId: selectedServerId })
  }, [selectedServerId, getQueuesAndStats])

  // Fetch data when server selection changes
  useEffect(() => {
    if (selectedServerId) {
      refreshData()
    } else {
      setQueues([])
      setStats([])
      setError(null)
    }
  }, [selectedServerId, refreshData])

  // Handle server selection change
  const handleServerChange = (value: string) => {
    setSelectedServerId(value)
  }

  // Handle flush all queues
  const handleFlushAll = (force: boolean) => {
    if (!selectedServerId || queues.length === 0) {
      toast.info('No queues to flush')
      return
    }
    flushAllQueues({ serverId: selectedServerId, force })
  }

  // Handle flush single queue
  const handleFlushSingle = (queueName: string, force: boolean) => {
    flushSingleQueue({ queueName, force })
  }

  // Calculate totals and summary stats
  const totals = stats.reduce(
    (acc, queue) => {
      acc.waiting += queue.counts.waiting || 0
      acc.active += queue.counts.active || 0
      acc.delayed += queue.counts.delayed || 0
      acc.completed += queue.counts.completed || 0
      acc.failed += queue.counts.failed || 0
      return acc
    },
    { waiting: 0, active: 0, delayed: 0, completed: 0, failed: 0 },
  )

  // Convert to the format expected by the original UI
  const summaryStats = [
    {
      label: 'Active',
      value: totals.active,
      color: 'bg-primary',
      textColor: 'text-primary',
      bgColor: 'bg-primary/10',
      change: totals.active > 0 ? `+${totals.active}` : '0',
    },
    {
      label: 'Pending',
      value: totals.waiting,
      color: 'bg-muted-foreground',
      textColor: 'text-muted-foreground',
      bgColor: 'bg-muted/20',
      change: totals.waiting > 0 ? `+${totals.waiting}` : '0',
    },
    {
      label: 'Completed',
      value: totals.completed,
      color: 'bg-primary',
      textColor: 'text-primary',
      bgColor: 'bg-primary/10',
      change: totals.completed > 0 ? `+${totals.completed}` : '0',
    },
    {
      label: 'Failed',
      value: totals.failed,
      color: 'bg-destructive',
      textColor: 'text-destructive',
      bgColor: 'bg-destructive/10',
      change: totals.failed > 0 ? `+${totals.failed}` : '0',
    },
  ]

  // Convert queue data to recent jobs format for UI compatibility
  const recentJobs = displayedQueues.map((queue, index) => {
    const hasActive = queue.counts.active > 0
    const hasFailed = queue.counts.failed > 0
    const hasWaiting = queue.counts.waiting > 0

    let status = 'completed'
    let progress = 100

    if (hasActive) {
      status = 'running'
      progress = Math.random() * 100
    } else if (hasFailed) {
      status = 'failed'
      progress = 0
    } else if (hasWaiting) {
      status = 'pending'
      progress = 0
    }

    return {
      name: queue.name,
      status,
      progress: Math.round(progress),
      time: `${index + 1}m ago`,
      counts: queue.counts,
    }
  })

  const hasQueues = stats.length > 0
  const isOperating = isLoading || isFlushingAll || isFlushingSingle
  const selectedServer = servers.find(s => s.id === selectedServerId)

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
            onClick={goBack}
            className='mr-3 h-8 w-8'>
            <ArrowLeft size={14} />
          </Button>
          <div className='flex-1'>
            <h2 className='text-foreground text-lg font-semibold'>
              Queue Management
            </h2>
            <p className='text-muted-foreground text-xs'>
              Monitor and manage server queues
            </p>
          </div>
        </div>

        {/* Server Selection */}
        <div className='px-4 pb-3'>
          <div className='flex items-center gap-3'>
            <Server size={16} className='text-muted-foreground' />
            <Select value={selectedServerId} onValueChange={handleServerChange}>
              <SelectTrigger className='h-8 w-full text-sm'>
                <SelectValue placeholder='Select server...'>
                  {selectedServer ? selectedServer.name : 'Select server...'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {servers.map(server => (
                  <SelectItem key={server.id} value={server.id}>
                    <div className='flex items-center gap-2'>
                      <Server size={14} />
                      {server.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Action Buttons */}
            {selectedServerId && (
              <div className='flex gap-1'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={refreshData}
                  disabled={isOperating}>
                  {isLoading ? (
                    <Loader2 size={12} className='animate-spin' />
                  ) : (
                    <RefreshCcw size={12} />
                  )}
                </Button>

                {hasQueues && (
                  <>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8'
                      onClick={() => handleFlushAll(false)}
                      disabled={isOperating}>
                      <Trash size={12} />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='text-destructive hover:text-destructive h-8 w-8'
                          disabled={isOperating}>
                          <Zap size={12} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className='text-destructive flex items-center gap-2'>
                            <AlertCircle className='h-5 w-5' />
                            Force Flush All Queues
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove ALL jobs from all
                            queues on "{selectedServer?.name}". This action
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleFlushAll(true)}
                            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                            Force Flush All
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='flex-1 overflow-hidden'>
        <div
          ref={scrollContainerRef}
          className='h-full overflow-y-auto'
          onScroll={handleScroll}>
          <div className='space-y-4 p-4'>
            {/* Error State */}
            {error && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loadingServers ? (
              /* Loading Servers */
              <div className='flex flex-col items-center justify-center space-y-4 py-12'>
                <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
                <div className='text-muted-foreground text-sm'>
                  Loading available servers...
                </div>
              </div>
            ) : errorServers ? (
              /* Server Error State */
              <div className='flex flex-col items-center justify-center space-y-4 py-12'>
                <AlertCircle className='text-destructive h-12 w-12' />
                <div className='space-y-2 text-center'>
                  <div className='text-lg font-medium'>
                    Failed to Load Servers
                  </div>
                  <div className='text-muted-foreground max-w-md text-sm'>
                    {errorServers}
                  </div>
                  {refreshServers && (
                    <Button onClick={refreshServers} className='mt-4'>
                      <RefreshCcw className='mr-2 h-4 w-4' />
                      Retry Loading Servers
                    </Button>
                  )}
                </div>
              </div>
            ) : servers.length === 0 ? (
              /* No Servers Available */
              <div className='flex flex-col items-center justify-center space-y-4 py-12'>
                <Server className='text-muted-foreground/50 h-12 w-12' />
                <div className='space-y-2 text-center'>
                  <div className='text-lg font-medium'>
                    No Servers Available
                  </div>
                  <div className='text-muted-foreground max-w-md text-sm'>
                    There are currently no servers configured. Please add a
                    server first to manage queues.
                  </div>
                </div>
              </div>
            ) : !selectedServerId ? (
              /* No Server Selected */
              <div className='flex flex-col items-center justify-center space-y-4 py-12'>
                <Database className='text-muted-foreground/50 h-12 w-12' />
                <div className='space-y-2 text-center'>
                  <div className='text-lg font-medium'>Select a Server</div>
                  <div className='text-muted-foreground max-w-md text-sm'>
                    Choose a server from the dropdown above to view and manage
                    its queues.
                  </div>
                </div>
              </div>
            ) : isLoading ? (
              /* Loading State */
              <div className='flex flex-col items-center justify-center space-y-4 py-12'>
                <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
                <div className='text-muted-foreground text-sm'>
                  Loading queue information...
                </div>
              </div>
            ) : !hasQueues ? (
              /* No Queues */
              <div className='flex flex-col items-center justify-center space-y-4 py-12'>
                <Database className='text-muted-foreground/50 h-12 w-12' />
                <div className='space-y-2 text-center'>
                  <div className='text-lg font-medium'>No Queues Found</div>
                  <div className='text-muted-foreground max-w-md text-sm'>
                    There are currently no queues configured for "
                    {selectedServer?.name}".
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className='grid grid-cols-2 gap-3'>
                  {summaryStats.map((stat, index) => (
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
                        <div
                          className={cn('h-2 w-2 rounded-full', stat.color)}
                        />
                        <span
                          className={cn(
                            'text-xs font-medium',
                            stat.change.startsWith('+') && stat.value > 0
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
                        <span
                          className={cn('text-lg font-bold', stat.textColor)}>
                          {stat.value}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Queue Details */}
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-foreground text-sm font-medium'>
                      Queue Details
                    </h3>
                    <span className='text-muted-foreground text-xs'>
                      {displayedQueues.length} of {stats.length} queues
                    </span>
                  </div>
                  <div className='space-y-2'>
                    {recentJobs.map((job, index) => (
                      <motion.div
                        key={`${job.name}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (index % ITEMS_PER_PAGE) * 0.05 }}
                        className='bg-muted/30 hover:bg-accent/30 rounded-lg border p-3 transition-colors'>
                        <div className='mb-2 flex items-center justify-between'>
                          <span className='text-foreground truncate text-sm font-medium'>
                            {job.name}
                          </span>
                          <div className='ml-2 flex flex-shrink-0 items-center gap-2'>
                            <Badge
                              variant='secondary'
                              className={cn(
                                'text-xs',
                                getStatusColor(job.status),
                              )}>
                              {job.status}
                            </Badge>

                            {/* Queue Actions */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-6 w-6'
                                  disabled={isOperating}>
                                  <MoreHorizontal size={12} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleFlushSingle(job.name, false)
                                  }
                                  disabled={isOperating}>
                                  <Trash className='h-3 w-3' />
                                  Flush Queue
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Queue Counts */}
                        <div className='mb-2 flex gap-2 text-xs'>
                          <span className='text-muted-foreground'>
                            W: {job.counts.waiting || 0}
                          </span>
                          <span className='text-primary'>
                            A: {job.counts.active || 0}
                          </span>
                          <span className='text-muted-foreground'>
                            D: {job.counts.delayed || 0}
                          </span>
                          <span className='text-foreground'>
                            C: {job.counts.completed || 0}
                          </span>
                          <span className='text-destructive'>
                            F: {job.counts.failed || 0}
                          </span>
                        </div>

                        {job.status === 'running' && (
                          <Progress value={job.progress} className='h-1.5' />
                        )}
                      </motion.div>
                    ))}

                    {/* Loading more indicator */}
                    {isLoadingMore && (
                      <div className='flex items-center justify-center py-4'>
                        <Loader2 className='text-muted-foreground h-5 w-5 animate-spin' />
                        <span className='text-muted-foreground ml-2 text-sm'>
                          Loading more queues...
                        </span>
                      </div>
                    )}

                    {/* End of list indicator */}
                    {!hasMoreQueues && displayedQueues.length > 0 && (
                      <div className='flex items-center justify-center py-4 text-center'>
                        <span className='text-muted-foreground text-xs'>
                          All {stats.length} queues loaded
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default QueuesPanel
