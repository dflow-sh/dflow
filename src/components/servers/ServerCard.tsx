'use client'

import { Alert } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { format, formatDistanceToNow } from 'date-fns'
import {
  AlertCircle,
  Calendar,
  Clock,
  Cloud,
  Ellipsis,
  HardDrive,
  Server as ServerIcon,
  Trash2,
  WifiOff,
} from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { getVpsOrderByInstanceIdAction } from '@/actions/cloud'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Server } from '@/payload-types'

import DeleteServerDialog from './DeleteServerDialog'

const ServerCard = ({
  server,
  organisationSlug,
}: {
  server: Server
  organisationSlug: string
}) => {
  const [open, setOpen] = useState(false)
  const connectionStatus = server.connection?.status || 'unknown'
  const isConnected = connectionStatus === 'success'
  const isOnboarded = server.onboarded === true
  const lastChecked = server.connection?.lastChecked
    ? formatDistanceToNow(new Date(server.connection.lastChecked), {
        addSuffix: true,
      })
    : 'unknown'
  const instanceId = server?.dflowVpsDetails?.instanceId

  const { execute, result } = useAction(getVpsOrderByInstanceIdAction)

  useEffect(() => {
    if (instanceId != null) {
      execute({ instanceId })
    }
  }, [instanceId])

  return (
    <>
      <div className='relative'>
        <Card
          className={cn(
            'h-full min-h-48 border-l-4 transition-all duration-200 hover:shadow-md',
            isConnected
              ? isOnboarded
                ? 'border-l-green-500 hover:border-l-green-600'
                : 'border-l-amber-500 hover:border-l-amber-600'
              : 'border-l-red-500 hover:border-l-red-600',
          )}>
          {/* Header Section */}
          <CardHeader className='pb-4'>
            <div className='flex items-start justify-between'>
              <div className='min-w-0 flex-1'>
                <CardTitle className='mb-2 flex items-center gap-2'>
                  <HardDrive className='h-5 w-5 flex-shrink-0' />
                  <span className='truncate'>{server.name}</span>
                </CardTitle>
                <CardDescription className='line-clamp-2 text-sm'>
                  {server.description || 'No description provided'}
                </CardDescription>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='z-10 h-8 w-8 flex-shrink-0'>
                    <Ellipsis className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem
                    className='cursor-pointer text-red-600 focus:text-red-600'
                    onClick={() => setOpen(true)}>
                    <Trash2 className='mr-2 h-4 w-4' />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Status Badge */}
            <div className='flex justify-start'>
              {isConnected ? (
                isOnboarded ? (
                  <Badge variant='success' className='text-xs'>
                    <div className='mr-1.5 h-2 w-2 rounded-full bg-green-400' />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant='warning' className='text-xs'>
                    <div className='mr-1.5 h-2 w-2 rounded-full bg-amber-400' />
                    Onboarding Pending
                  </Badge>
                )
              ) : (
                <Badge variant='destructive' className='text-xs'>
                  <div className='mr-1.5 h-2 w-2 rounded-full bg-red-400' />
                  Disconnected
                </Badge>
              )}
            </div>
          </CardHeader>

          {/* Content Section */}
          <CardContent className='space-y-4 py-4 pt-0'>
            {/* Server Details Grid */}
            <div className='grid grid-cols-1 gap-3'>
              {/* IP Address */}
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <ServerIcon className='h-4 w-4' />
                  <span>IP Address</span>
                </div>
                <span className='rounded bg-muted px-2 py-1 text-right font-mono text-sm'>
                  {server.ip}
                </span>
              </div>

              {/* Provider */}
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Cloud className='h-4 w-4' />
                  <span>Provider</span>
                </div>
                <Badge variant='info' className='text-xs'>
                  {server.provider}
                </Badge>
              </div>

              {/* Dflow Expiry Date */}
              {server?.provider.toLowerCase() === 'dflow' &&
                result?.data?.next_billing_date && (
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <Calendar className='h-4 w-4' />
                      <span>Valid Until</span>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className='cursor-help text-sm'>
                            {format(
                              result?.data?.next_billing_date,
                              'MMM d, yyyy',
                            )}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Dflow instance expires on{' '}
                            {format(
                              result?.data?.next_billing_date,
                              'MMM d, yyyy',
                            )}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}

              {/* Connection Error */}
              {!isConnected && (
                <Alert variant='destructive' className='px-2 py-2 text-xs'>
                  <div className='flex flex-row items-center justify-between gap-2'>
                    <div className='flex flex-row items-center gap-2'>
                      <WifiOff className='h-4 w-4' />
                      <span>Connection Error</span>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className='h-4 w-4 cursor-help' />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Check server configuration or network status.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </Alert>
              )}
            </div>
          </CardContent>

          {/* Footer Section */}
          {server.connection && (
            <CardFooter className='pb-4 pt-0'>
              <div className='flex w-full items-center gap-2 text-xs text-muted-foreground'>
                <Clock className='h-3 w-3' />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className='cursor-help'>
                        {lastChecked !== 'unknown'
                          ? `Last checked ${lastChecked}`
                          : 'Status unknown'}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Connection status last updated: {lastChecked}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardFooter>
          )}
        </Card>

        {/* Clickable Overlay */}
        <Link
          title={server.name}
          href={`/${organisationSlug}/servers/${server.id}`}
          className='absolute left-0 top-0 z-0 h-full w-full'
        />
      </div>

      <DeleteServerDialog server={server} open={open} setOpen={setOpen} />
    </>
  )
}

export default ServerCard
