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
  Settings,
  Trash2,
  WifiOff,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

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

const TooltipIcon = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <AlertCircle className='z-10 h-4 w-4 cursor-pointer text-destructive' />
      </TooltipTrigger>
      <TooltipContent>
        <p>Check server configuration or network status.</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

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
  const isCloudInitRunning = server.cloudInitStatus === 'running'

  const lastChecked = server.connection?.lastChecked
    ? formatDistanceToNow(new Date(server.connection.lastChecked), {
        addSuffix: true,
      })
    : 'unknown'

  // Check if server is in provisioning state (dFlow specific)
  const isProvisioning =
    typeof server.cloudProviderAccount === 'object' &&
    server.cloudProviderAccount?.type === 'dFlow' &&
    server.dflowVpsDetails?.status === 'provisioning'

  // Determine status based on priority logic
  const getServerStatus = () => {
    // Priority 1: Connection failed
    if (!isConnected) {
      return {
        type: 'disconnected',
        borderColor: 'border-l-red-500 hover:border-l-red-600',
        badge: {
          variant: 'destructive' as const,
          text: 'Disconnected',
          dotColor: 'bg-red-400',
          icon: WifiOff,
        },
      }
    }

    // Priority 2: Connection success + dFlow provisioning
    if (isConnected && isProvisioning) {
      return {
        type: 'provisioning',
        borderColor: 'border-l-purple-500 hover:border-l-purple-600',
        badge: {
          variant: 'secondary' as const,
          text: 'Provisioning',
          dotColor: 'bg-purple-400',
          icon: Cloud,
        },
      }
    }

    // Priority 3: Connection success + CloudInit running
    if (isConnected && isCloudInitRunning) {
      return {
        type: 'initializing',
        borderColor: 'border-l-blue-500 hover:border-l-blue-600',
        badge: {
          variant: 'secondary' as const,
          text: 'Initializing',
          dotColor: 'bg-blue-400',
          icon: Settings,
        },
      }
    }

    // Priority 4: Connection success + CloudInit done + Not onboarded
    if (isConnected && !isCloudInitRunning && !isOnboarded) {
      return {
        type: 'onboarding',
        borderColor: 'border-l-amber-500 hover:border-l-amber-600',
        badge: {
          variant: 'warning' as const,
          text: 'Onboarding Pending',
          dotColor: 'bg-amber-400',
          icon: AlertCircle,
        },
      }
    }

    // Priority 5: Connection success + CloudInit done + Onboarded
    return {
      type: 'connected',
      borderColor: 'border-l-green-500 hover:border-l-green-600',
      badge: {
        variant: 'success' as const,
        text: 'Connected',
        dotColor: 'bg-green-400',
        icon: null,
      },
    }
  }

  const serverStatus = getServerStatus()

  return (
    <>
      <div className='relative'>
        <Card
          className={cn(
            'h-full min-h-48 border-l-4 transition-all duration-200 hover:shadow-md',
            serverStatus.borderColor,
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
              <Badge variant={serverStatus.badge.variant} className='text-xs'>
                <div
                  className={cn(
                    'mr-1.5 h-2 w-2 rounded-full',
                    serverStatus.badge.dotColor,
                  )}
                />
                {serverStatus.badge.icon && (
                  <serverStatus.badge.icon className='mr-1 h-3 w-3' />
                )}
                {serverStatus.badge.text}
              </Badge>
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
                server?.dflowVpsDetails?.next_billing_date && (
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <Calendar className='h-4 w-4' />
                      <span>Next Billing</span>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className='cursor-help text-sm'>
                            {format(
                              server?.dflowVpsDetails?.next_billing_date,
                              'MMM d, yyyy',
                            )}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Dflow instance expires on{' '}
                            {format(
                              server?.dflowVpsDetails?.next_billing_date,
                              'MMM d, yyyy',
                            )}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}

              {/* Status-specific alerts */}
              {serverStatus.type === 'disconnected' && (
                <Alert variant='destructive' className='z-10 px-2 py-2 text-xs'>
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

              {serverStatus.type === 'provisioning' && (
                <Alert
                  variant='default'
                  className='z-10 border-purple-200 bg-purple-50 px-2 py-2 text-xs'>
                  <div className='flex flex-row items-center justify-between gap-2'>
                    <div className='flex flex-row items-center gap-2'>
                      <Cloud className='h-4 w-4 text-purple-600' />
                      <span className='text-purple-700'>
                        Server Provisioning
                      </span>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className='h-4 w-4 cursor-help text-purple-600' />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            dFlow server is being provisioned. This may take a
                            few minutes.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </Alert>
              )}

              {serverStatus.type === 'initializing' && (
                <Alert
                  variant='default'
                  className='z-10 border-blue-200 bg-blue-50 px-2 py-2 text-xs'>
                  <div className='flex flex-row items-center justify-between gap-2'>
                    <div className='flex flex-row items-center gap-2'>
                      <Settings className='h-4 w-4 text-blue-600' />
                      <span className='text-blue-700'>Server Initializing</span>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className='h-4 w-4 cursor-help text-blue-600' />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Cloud-init is running. Please wait for
                            initialization to complete.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </Alert>
              )}

              {serverStatus.type === 'onboarding' && (
                <Alert
                  variant='default'
                  className='z-10 border-amber-200 bg-amber-50 px-2 py-2 text-xs'>
                  <div className='flex flex-row items-center justify-between gap-2'>
                    <div className='flex flex-row items-center gap-2'>
                      <AlertCircle className='h-4 w-4 text-amber-600' />
                      <span className='text-amber-700'>
                        Onboarding Required
                      </span>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className='h-4 w-4 cursor-help text-amber-600' />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Server is connected but needs to be onboarded.</p>
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
              <div className='z-10 flex w-full items-center gap-2 text-xs text-muted-foreground'>
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
