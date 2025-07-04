'use client'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { format } from 'date-fns'
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  Cloud,
  Ellipsis,
  Globe,
  HardDrive,
  Server as ServerIcon,
  Settings,
  Shield,
  Trash2,
  WifiOff,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
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
  const isCloudInitRunning = server.cloudInitStatus === 'running'

  // Check if server is in provisioning state (dFlow specific)
  const isProvisioning =
    server?.provider?.toLowerCase() === 'dflow' &&
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
          icon: WifiOff,
          tooltip: 'Check server configuration or network status.',
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
          icon: Cloud,
          tooltip:
            'dFlow server is being provisioned. This may take a few minutes.',
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
          icon: Settings,
          tooltip:
            'Cloud-init is running. Please wait for initialization to complete.',
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
          text: 'Onboarding Required',
          icon: AlertCircle,
          tooltip: 'Server is connected but needs to be onboarded.',
        },
      }
    }

    // Priority 5: Connection success + CloudInit done + Onboarded
    if (isConnected && !isCloudInitRunning && isOnboarded) {
      return {
        type: 'connected',
        borderColor: 'border-l-green-500 hover:border-l-green-600',
        badge: {
          variant: 'success' as const,
          text: 'Connected',
          icon: null,
          tooltip: null,
        },
      }
    }

    // Default fallback for unknown states
    return {
      type: 'unknown',
      borderColor: 'border-l-gray-500 hover:border-l-gray-600',
      badge: {
        variant: 'secondary' as const,
        text: 'Unknown Status',
        icon: AlertCircle,
        tooltip: 'Unable to determine server status.',
      },
    }
  }

  const getIpDetails = (server: Server) => {
    // For SSH connections, prioritize the IP field
    if (server.preferConnectionType === 'ssh') {
      return {
        label: 'IP Address',
        value: server.ip || 'No IP available',
        hasValue: !!server.ip,
        icon: ServerIcon,
        bgColor: 'bg-muted',
        textColor: 'text-foreground',
        borderColor: '',
      }
    }

    // For tailscale connection, follow priority: publicIp > tailscalePrivateIp
    if (server.publicIp && server.publicIp !== '999.999.999.999') {
      return {
        label: 'Public IP',
        value: server.publicIp,
        hasValue: true,
        icon: Globe,
        bgColor: 'bg-muted',
        textColor: 'text-foreground',
        borderColor: '',
      }
    }

    if (server.tailscalePrivateIp) {
      return {
        label: 'Tailscale IP',
        value: server.tailscalePrivateIp,
        hasValue: true,
        icon: Shield,
        bgColor: 'bg-secondary',
        textColor: 'text-secondary-foreground',
        borderColor: 'border-secondary',
      }
    }

    return {
      label: 'IP Address',
      value: 'No IP available',
      hasValue: false,
      icon: ServerIcon,
      bgColor: 'bg-muted/50',
      textColor: 'text-muted-foreground',
      borderColor: '',
    }
  }

  const shouldShowNoPublicIpBadge = (server: Server) => {
    // Show badge if using Tailscale IP (no public IP available)
    return (
      server.preferConnectionType !== 'ssh' &&
      (!server.publicIp || server.publicIp === '999.999.999.999') &&
      server.tailscalePrivateIp
    )
  }

  const serverStatus = getServerStatus()
  const ipInfo = getIpDetails(server)
  const showNoPublicIpBadge = shouldShowNoPublicIpBadge(server)

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

            {/* Combined Status Badge with Tooltip */}
            <div className='flex justify-start gap-2'>
              {/* No Public IP Badge */}
              {showNoPublicIpBadge && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant='secondary'
                        className='cursor-help text-xs'>
                        <AlertTriangle className='mr-1.5 h-3 w-3' />
                        No Public IP
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Server is only accessible via Tailscale private network
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Server Status Badge */}
              {serverStatus.badge.tooltip ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant={serverStatus.badge.variant}
                        className='cursor-help text-xs'>
                        {serverStatus.badge.icon && (
                          <serverStatus.badge.icon className='mr-1.5 h-3 w-3' />
                        )}
                        {serverStatus.badge.text}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{serverStatus.badge.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <Badge
                  variant={serverStatus.badge.variant}
                  className='z-10 text-xs'>
                  {serverStatus.badge.icon && (
                    <serverStatus.badge.icon className='mr-1.5 h-3 w-3' />
                  )}
                  {serverStatus.badge.text}
                </Badge>
              )}
            </div>
          </CardHeader>

          {/* Content Section */}
          <CardContent className='space-y-4 py-4'>
            {/* Server Details Grid */}
            <div className='grid grid-cols-1 gap-3'>
              {/* IP Address */}
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <ipInfo.icon className='h-4 w-4' />
                  <span>{ipInfo.label}</span>
                </div>
                <span
                  className={cn(
                    'rounded border px-2 py-1 text-right font-mono text-sm',
                    ipInfo.bgColor,
                    ipInfo.textColor,
                    ipInfo.borderColor,
                  )}>
                  {ipInfo.value}
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
            </div>
          </CardContent>

          {/* Footer Section */}
          {/* {server.connection && (
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
          )} */}
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
