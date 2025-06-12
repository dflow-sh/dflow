'use client'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { formatDistanceToNow } from 'date-fns'
import {
  AlertCircle,
  Clock,
  Ellipsis,
  HardDrive,
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

  return (
    <>
      <div className='relative'>
        <Card
          className={cn(
            'h-full min-h-36 border-l-4 transition-all duration-200',
            !isOnboarded
              ? 'border-l-amber-500 hover:border-l-amber-600'
              : isConnected
                ? 'border-l-green-500 hover:border-l-green-600'
                : 'border-l-red-500 hover:border-l-red-600',
          )}>
          <CardHeader className='w-full flex-row items-start justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <HardDrive />
                {server.name}
                {isOnboarded ? (
                  <Badge variant={isConnected ? 'success' : 'destructive'}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                ) : (
                  <Badge variant='warning'>Onboarding Pending</Badge>
                )}
              </CardTitle>
              <CardDescription className='line-clamp-1'>
                {server.description}
              </CardDescription>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' className='z-10 !mt-0'>
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align='end'>
                <DropdownMenuItem
                  className='cursor-pointer'
                  onClick={() => {
                    setOpen(true)
                  }}>
                  <Trash2 className='mr-2' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>

          <CardContent>
            <div className='flex w-full items-center justify-between'>
              <p className='truncate'>{server.ip}</p>

              {!isConnected && isOnboarded && (
                <div className='flex items-center gap-2 text-sm text-red-500'>
                  <WifiOff size={16} />
                  <span>Connection error</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertCircle size={14} className='cursor-help' />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Check server configuration or network status.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          </CardContent>

          {server.connection && (
            <CardFooter className='text-sm text-muted-foreground'>
              <div className='flex items-center gap-1.5'>
                <Clock size={14} />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      {lastChecked !== 'unknown'
                        ? `Last checked ${lastChecked}`
                        : 'Status unknown'}
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

        <Link
          title={server.name}
          href={`/${organisationSlug}/servers/${server.id}`}
          className='absolute left-0 top-0 h-full w-full'
        />
      </div>

      <DeleteServerDialog server={server} open={open} setOpen={setOpen} />
    </>
  )
}

export default ServerCard
