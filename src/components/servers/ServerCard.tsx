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
import React, { useState } from 'react'

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

  // Get complete server status logic
  const getServerStatus = (server: Server) => {
    const isDflow = server?.provider?.toLowerCase() === 'dflow'
    const dflowStatus = server.dflowVpsDetails?.status
    const connectionAttempts = server.connectionAttempts ?? 0
    const connectionStatus = server.connection?.status || 'unknown'
    const isConnected = connectionStatus === 'success'
    const isOnboarded = server.onboarded === true
    const isCloudInitRunning = server.cloudInitStatus === 'running'

    // 1. DFlow provisioning state
    if (isDflow && dflowStatus === 'provisioning') {
      return {
        type: 'provisioning' as const,
        title: 'Server Provisioning',
        subtitle: `${server.name ? `"${server.name}"` : 'Your dFlow server'} is being provisioned. This may take a few minutes.`,
        badge: {
          variant: 'secondary' as const,
          text: 'Provisioning',
          tooltip:
            'dFlow server is being provisioned. This may take a few minutes.',
        },
        borderColor: 'border-l-purple-500 hover:border-l-purple-600',
        showBanner: true,
        bannerProps: {
          serverName: server.name,
        },
      }
    }

    // 2. DFlow connecting state (attempting to connect) - only after status becomes 'running'
    if (isDflow && dflowStatus === 'running' && connectionAttempts < 30) {
      // If the server is connected mid-attempt, show connected status
      if (isConnected) {
        return {
          type: 'connected' as const,
          title: 'Server Connected',
          subtitle: 'Server is connected and ready for use.',
          badge: {
            variant: 'success' as const,
            text: 'Connected',
            tooltip: undefined,
          },
          borderColor: 'border-l-green-500 hover:border-l-green-600',
          showBanner: false,
        }
      }

      // If not connected, show connecting status
      return {
        type: 'connecting' as const,
        title: 'Connecting to Server',
        subtitle: `${server.name ? `"${server.name}"` : 'Your dFlow server'} is being connected. This may take a few minutes.`,
        badge: {
          variant: 'secondary' as const,
          text: 'Connecting',
          tooltip:
            'Attempting to connect to the server. This may take a few minutes.',
        },
        borderColor: 'border-l-blue-500 hover:border-l-blue-600',
        showBanner: true,
        bannerProps: {
          attempts: connectionAttempts,
          maxAttempts: 30,
          serverName: server.name,
        },
      }
    }

    // 3. Connection error state (30+ attempts failed) - but if connected after 30 attempts, show connected
    if (isDflow && dflowStatus === 'running' && connectionAttempts >= 30) {
      // If the server is connected after 30 attempts, show connected status
      if (isConnected) {
        return {
          type: 'connected' as const,
          title: 'Server Connected',
          subtitle: 'Server is connected and ready for use.',
          badge: {
            variant: 'success' as const,
            text: 'Connected',
            tooltip: undefined,
          },
          borderColor: 'border-l-green-500 hover:border-l-green-600',
          showBanner: false,
        }
      }

      // If not connected after 30 attempts, show connection error
      return {
        type: 'connection-error' as const,
        title: 'Connection Issue Detected',
        subtitle: `${server.name ? `"${server.name}"` : 'Your server'} could not be connected after multiple attempts.`,
        badge: {
          variant: 'destructive' as const,
          text: 'Connection Error',
          tooltip:
            'Server could not be connected after multiple attempts. Please contact support.',
        },
        borderColor: 'border-l-red-500 hover:border-l-red-600',
        showBanner: true,
        bannerProps: {
          serverName: server.name,
        },
      }
    }

    // 4. Disconnected state (non-DFlow or general connection failure)
    if (!isConnected) {
      return {
        type: 'disconnected' as const,
        title: 'Server Disconnected',
        subtitle: 'Unable to connect to the server.',
        badge: {
          variant: 'destructive' as const,
          text: 'Disconnected',
          tooltip: 'Check server configuration or network status.',
        },
        borderColor: 'border-l-red-500 hover:border-l-red-600',
        showBanner: false,
      }
    }

    // 5. Cloud-init running state
    if (isConnected && isCloudInitRunning) {
      return {
        type: 'cloud-init' as const,
        title: 'Server Initialization Running',
        subtitle: `${server.name ? `"${server.name}"` : 'Your server'} is being initialized. This may take a few minutes.`,
        badge: {
          variant: 'secondary' as const,
          text: 'Initializing',
          tooltip:
            'Cloud-init is running. Please wait for initialization to complete.',
        },
        borderColor: 'border-l-blue-500 hover:border-l-blue-600',
        showBanner: true,
        bannerProps: {
          serverName: server.name,
        },
      }
    }

    // 6. Onboarding required state
    if (isConnected && !isCloudInitRunning && !isOnboarded) {
      return {
        type: 'onboarding' as const,
        title: 'Onboarding Required',
        subtitle: 'Server is connected but needs to be onboarded.',
        badge: {
          variant: 'warning' as const,
          text: 'Onboarding Required',
          tooltip: 'Server is connected but needs to be onboarded.',
        },
        borderColor: 'border-l-amber-500 hover:border-l-amber-600',
        showBanner: false,
      }
    }

    // 7. Connected and ready state
    if (isConnected && !isCloudInitRunning && isOnboarded) {
      return {
        type: 'connected' as const,
        title: 'Server Connected',
        subtitle: 'Server is connected and ready for use.',
        badge: {
          variant: 'success' as const,
          text: 'Connected',
          tooltip: undefined,
        },
        borderColor: 'border-l-green-500 hover:border-l-green-600',
        showBanner: false,
      }
    }

    // Default fallback
    return {
      type: 'disconnected' as const,
      title: 'Unknown Status',
      subtitle: 'Unable to determine server status.',
      badge: {
        variant: 'secondary' as const,
        text: 'Unknown Status',
        tooltip: 'Unable to determine server status.',
      },
      borderColor: 'border-l-gray-500 hover:border-l-gray-600',
      showBanner: false,
    }
  }

  const serverStatus = getServerStatus(server)

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

  const ipInfo = getIpDetails(server)
  const showNoPublicIpBadge = shouldShowNoPublicIpBadge(server)

  // Get appropriate icon for the status badge
  const getStatusIcon = () => {
    switch (serverStatus.type) {
      case 'provisioning':
      case 'connecting':
        return Cloud
      case 'cloud-init':
        return Settings
      case 'onboarding':
        return AlertCircle
      case 'disconnected':
      case 'connection-error':
        return WifiOff
      case 'connected':
        return null
      default:
        return AlertCircle
    }
  }

  const statusIcon = getStatusIcon()

  // Get connection attempts info for DFlow servers
  const getConnectionAttemptsInfo = () => {
    if (
      server?.provider?.toLowerCase() === 'dflow' &&
      serverStatus.type === 'connecting'
    ) {
      const attempts = server.connectionAttempts ?? 0
      return ` (${attempts + 1}/30)`
    }
    return ''
  }

  return (
    <>
      <div className='relative'>
        <Card
          className={`h-full min-h-48 border-b-0 border-l-4 border-r-0 border-t-0 transition-all duration-200 hover:shadow-md ${serverStatus.borderColor}`}>
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
                        {statusIcon &&
                          React.createElement(statusIcon, {
                            className: 'mr-1.5 h-3 w-3',
                          })}
                        {serverStatus.badge.text}
                        {getConnectionAttemptsInfo()}
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
                  {statusIcon &&
                    React.createElement(statusIcon, {
                      className: 'mr-1.5 h-3 w-3',
                    })}
                  {serverStatus.badge.text}
                  {getConnectionAttemptsInfo()}
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
