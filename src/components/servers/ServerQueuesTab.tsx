'use client'

import {
  Activity,
  AlertCircle,
  Database,
  Loader2,
  MoreHorizontal,
  RefreshCcw,
  Trash,
  Zap,
} from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useCallback, useEffect, useState } from 'react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ServerType } from '@/payload-types-overrides'

interface ServerQueuesTabProps {
  server: ServerType
}

type QueueStats = {
  name: string
  counts: Record<string, number>
}

const ServerQueuesTab = ({ server }: ServerQueuesTabProps) => {
  const [queues, setQueues] = useState<string[]>([])
  const [stats, setStats] = useState<QueueStats[]>([])
  const [error, setError] = useState<string | null>(null)

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
    if (!server.id) return
    await getQueuesAndStats({ serverId: server.id })
  }, [server.id, getQueuesAndStats])

  // Initial data fetch
  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Handle flush all queues
  const handleFlushAll = (force: boolean) => {
    if (!server.id || queues.length === 0) {
      toast.info('No queues to flush')
      return
    }
    flushAllQueues({ serverId: server.id, force })
  }

  // Handle flush single queue
  const handleFlushSingle = (queueName: string, force: boolean) => {
    flushSingleQueue({ queueName, force })
  }

  // Calculate totals
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

  const hasQueues = stats.length > 0
  const isOperating = isLoading || isFlushingAll || isFlushingSingle

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h2 className='flex items-center gap-2 text-2xl font-semibold tracking-tight'>
            <Database className='h-6 w-6' />
            Queue Management
          </h2>
          <p className='text-muted-foreground mt-1 text-sm'>
            Monitor and manage your server queues
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={refreshData}
            disabled={isOperating}>
            {isLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <RefreshCcw className='h-4 w-4' />
            )}
            Refresh
          </Button>

          {/* Normal Flush All */}
          <Button
            variant='outline'
            size='sm'
            onClick={() => handleFlushAll(false)}
            disabled={!hasQueues || isOperating}>
            {isFlushingAll ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Trash className='h-4 w-4' />
            )}
            Flush All
          </Button>

          {/* Force Flush All - with confirmation dialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant='destructive'
                size='sm'
                disabled={!hasQueues || isOperating}>
                <Zap className='h-4 w-4' />
                Force Flush All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className='text-destructive flex items-center gap-2'>
                  <AlertCircle className='h-5 w-5' />
                  Force Flush All Queues
                </AlertDialogTitle>
                <AlertDialogDescription className='space-y-2'>
                  <p>
                    <strong>WARNING:</strong> This will permanently remove{' '}
                    <strong>ALL jobs</strong> from all queues on server "
                    {server.name}", including:
                  </p>
                  <ul className='list-disc space-y-1 pl-6 text-sm'>
                    <li>
                      <strong>{totals.waiting}</strong> waiting jobs
                    </li>
                    <li>
                      <strong>{totals.active}</strong> active jobs (currently
                      processing)
                    </li>
                    <li>
                      <strong>{totals.delayed}</strong> delayed jobs
                    </li>
                    <li>
                      <strong>{totals.completed}</strong> completed jobs
                    </li>
                    <li>
                      <strong>{totals.failed}</strong> failed jobs
                    </li>
                  </ul>
                  <p className='text-destructive font-medium'>
                    This action cannot be undone and may disrupt active
                    processes.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleFlushAll(true)}
                  className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                  <Zap className='mr-2 h-4 w-4' />
                  Force Flush All Queues
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Summary Stats Card */}
      {hasQueues && !isLoading && (
        <Card>
          <CardHeader className='pb-4'>
            <CardTitle className='text-lg'>Queue Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-5 gap-4'>
              <div className='text-center'>
                <div className='text-foreground text-2xl font-bold'>
                  {totals.waiting}
                </div>
                <div className='text-muted-foreground text-xs tracking-wide uppercase'>
                  Waiting
                </div>
              </div>
              <div className='text-center'>
                <div className='text-primary text-2xl font-bold'>
                  {totals.active}
                </div>
                <div className='text-muted-foreground text-xs tracking-wide uppercase'>
                  Active
                </div>
              </div>
              <div className='text-center'>
                <div className='text-muted-foreground text-2xl font-bold'>
                  {totals.delayed}
                </div>
                <div className='text-muted-foreground text-xs tracking-wide uppercase'>
                  Delayed
                </div>
              </div>
              <div className='text-center'>
                <div className='text-foreground text-2xl font-bold'>
                  {totals.completed}
                </div>
                <div className='text-muted-foreground text-xs tracking-wide uppercase'>
                  Completed
                </div>
              </div>
              <div className='text-center'>
                <div className='text-destructive text-2xl font-bold'>
                  {totals.failed}
                </div>
                <div className='text-muted-foreground text-xs tracking-wide uppercase'>
                  Failed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Activity className='text-muted-foreground h-4 w-4' />
              <CardTitle className='text-lg'>Queue Details</CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Error State */}
          {error && (
            <Alert variant='destructive' className='mb-6'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className='flex flex-col items-center justify-center space-y-4 py-12'>
              <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
              <div className='text-muted-foreground text-sm'>
                Loading queue information...
              </div>
            </div>
          ) : !hasQueues ? (
            /* Empty State */
            <div className='flex flex-col items-center justify-center space-y-4 py-12'>
              <Database className='text-muted-foreground/50 h-12 w-12' />
              <div className='space-y-2 text-center'>
                <div className='text-lg font-medium'>No Queues Found</div>
                <div className='text-muted-foreground max-w-md text-sm'>
                  There are currently no queues configured for this server.
                  Queues will appear here once they are created.
                </div>
              </div>
            </div>
          ) : (
            /* Data Table */
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[200px]'>Queue Name</TableHead>
                    <TableHead className='text-center'>Waiting</TableHead>
                    <TableHead className='text-center'>Active</TableHead>
                    <TableHead className='text-center'>Delayed</TableHead>
                    <TableHead className='text-center'>Completed</TableHead>
                    <TableHead className='text-center'>Failed</TableHead>
                    <TableHead className='w-[50px]'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.map(queue => {
                    const hasActiveJobs =
                      (queue.counts.waiting || 0) +
                        (queue.counts.active || 0) +
                        (queue.counts.delayed || 0) >
                      0

                    return (
                      <TableRow key={queue.name}>
                        <TableCell>
                          <div className='font-mono text-sm font-medium'>
                            {queue.name}
                          </div>
                        </TableCell>
                        <TableCell className='text-center'>
                          <Badge
                            variant={
                              queue.counts.waiting > 0 ? 'default' : 'secondary'
                            }
                            className='min-w-[40px]'>
                            {queue.counts.waiting || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-center'>
                          <Badge
                            variant={
                              queue.counts.active > 0 ? 'default' : 'secondary'
                            }
                            className='min-w-[40px]'>
                            {queue.counts.active || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-center'>
                          <Badge
                            variant={
                              queue.counts.delayed > 0 ? 'default' : 'secondary'
                            }
                            className='min-w-[40px]'>
                            {queue.counts.delayed || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-center'>
                          <Badge
                            variant={
                              queue.counts.completed > 0
                                ? 'default'
                                : 'secondary'
                            }
                            className='min-w-[40px]'>
                            {queue.counts.completed || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-center'>
                          <Badge
                            variant={
                              queue.counts.failed > 0
                                ? 'destructive'
                                : 'secondary'
                            }
                            className='min-w-[40px]'>
                            {queue.counts.failed || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant='ghost'
                                size='sm'
                                disabled={isOperating}
                                className='h-8 w-8 p-0'>
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              {hasActiveJobs ? (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                      onSelect={e => e.preventDefault()}
                                      disabled={isOperating}>
                                      <Trash className='mr-2 h-4 w-4' />
                                      Flush Queue
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className='text-destructive flex items-center gap-2'>
                                        <AlertCircle className='h-5 w-5' />
                                        Flush Queue "{queue.name}"
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className='space-y-3'>
                                        <div className='bg-destructive/10 border-destructive/20 rounded-md border p-3'>
                                          <p className='text-destructive font-medium'>
                                            ⚠️ WARNING: This queue has active
                                            jobs!
                                          </p>
                                        </div>
                                        <p>
                                          This will permanently remove{' '}
                                          <strong>ALL jobs</strong> from queue "
                                          {queue.name}", including jobs that are
                                          currently processing.
                                        </p>
                                        <div className='bg-muted rounded-md p-3 text-sm'>
                                          <p className='mb-2 font-medium'>
                                            Jobs to be removed:
                                          </p>
                                          <ul className='space-y-1'>
                                            {queue.counts.waiting > 0 && (
                                              <li>
                                                •{' '}
                                                <strong>
                                                  {queue.counts.waiting}
                                                </strong>{' '}
                                                waiting jobs
                                              </li>
                                            )}
                                            {queue.counts.active > 0 && (
                                              <li>
                                                •{' '}
                                                <strong>
                                                  {queue.counts.active}
                                                </strong>{' '}
                                                active jobs (currently
                                                processing)
                                              </li>
                                            )}
                                            {queue.counts.delayed > 0 && (
                                              <li>
                                                •{' '}
                                                <strong>
                                                  {queue.counts.delayed}
                                                </strong>{' '}
                                                delayed jobs
                                              </li>
                                            )}
                                            {queue.counts.completed > 0 && (
                                              <li>
                                                •{' '}
                                                <strong>
                                                  {queue.counts.completed}
                                                </strong>{' '}
                                                completed jobs
                                              </li>
                                            )}
                                            {queue.counts.failed > 0 && (
                                              <li>
                                                •{' '}
                                                <strong>
                                                  {queue.counts.failed}
                                                </strong>{' '}
                                                failed jobs
                                              </li>
                                            )}
                                          </ul>
                                        </div>
                                        <p className='text-destructive text-sm font-medium'>
                                          This action cannot be undone and will
                                          disrupt any jobs currently being
                                          processed in this queue.
                                        </p>
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleFlushSingle(queue.name, true)
                                        }
                                        className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                                        <Trash className='mr-2 h-4 w-4' />
                                        Flush Queue
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleFlushSingle(queue.name, false)
                                  }
                                  disabled={isOperating}>
                                  <Trash className='mr-2 h-4 w-4' />
                                  Flush Queue
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ServerQueuesTab
