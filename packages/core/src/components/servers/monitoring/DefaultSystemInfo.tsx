'use client'

import { Activity, Clock, Cpu, Monitor, Network, Server } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { System } from '@/lib/beszel/types'

interface DefaultSystemInfoProps {
  monitoringData: {
    systemInfo: {
      status: string
      uptime: string
      hostname: string
      kernel: string
      model: string
      cores: number
      threads: number
      version: string
    }
    resources: {
      cpu: { usage: number }
      memory: { percentage: number }
      disk: { percentage: number }
    }
  }
  systemData?: System | null
}

const DefaultSystemInfo = ({
  monitoringData,
  systemData,
}: DefaultSystemInfoProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '--'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getOSName = (osType?: number) => {
    switch (osType) {
      case 0:
        return 'Linux'
      case 1:
        return 'Windows'
      case 2:
        return 'macOS'
      case 3:
        return 'FreeBSD'
      default:
        return 'Unknown'
    }
  }

  const getStatusBadge = (status?: string) => {
    const systemStatus = status || monitoringData.systemInfo.status
    switch (systemStatus?.toLowerCase()) {
      case 'up':
      case 'online':
        return <Badge variant='success'>Online</Badge>
      case 'down':
      case 'error':
        return <Badge variant='destructive'>Offline</Badge>
      case 'warning':
        return <Badge variant='warning'>Warning</Badge>
      case 'loading':
        return <Badge variant='outline'>Loading...</Badge>
      default:
        return <Badge variant='outline'>Unknown</Badge>
    }
  }

  return (
    <Card className='w-full'>
      <CardHeader className='pb-4'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2 text-lg font-semibold'>
            <Server className='h-5 w-5 text-primary' />
            System Information
          </CardTitle>
          {getStatusBadge(monitoringData.systemInfo.status)}
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Primary System Information */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <div className='flex items-center space-x-3 rounded-lg bg-muted/50 p-3'>
            <div className='rounded-md bg-background p-2'>
              <Server className='h-4 w-4 text-info' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium'>
                {systemData?.name || 'Unknown Host'}
              </p>
              <p className='text-xs text-muted-foreground'>Server Name</p>
            </div>
          </div>

          <div className='flex items-center space-x-3 rounded-lg bg-muted/50 p-3'>
            <div className='rounded-md bg-background p-2'>
              <Monitor className='h-4 w-4 text-primary' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium'>
                {systemData?.host || '--'}
              </p>
              <p className='text-xs text-muted-foreground'>Container/Host ID</p>
            </div>
          </div>

          <div className='flex items-center space-x-3 rounded-lg bg-muted/50 p-3'>
            <div className='rounded-md bg-background p-2'>
              <Activity className='h-4 w-4 text-success' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-sm font-medium'>
                {monitoringData.systemInfo.uptime}
              </p>
              <p className='text-xs text-muted-foreground'>System Uptime</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Hardware Specifications */}
        <div className='space-y-4'>
          <div className='flex items-center gap-2'>
            <Cpu className='h-4 w-4 text-warning' />
            <h3 className='text-base font-semibold'>Hardware Specifications</h3>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            <div className='space-y-2'>
              <div className='rounded-lg border bg-card p-3'>
                <p className='text-sm font-medium'>
                  {monitoringData.systemInfo.model}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {monitoringData.systemInfo.cores} cores •{' '}
                  {monitoringData.systemInfo.threads} threads
                </p>
              </div>
            </div>

            <div className='space-y-2'>
              <div className='rounded-lg border bg-card p-3'>
                <p className='text-sm font-medium'>
                  {monitoringData.systemInfo.kernel}
                </p>
                <p className='text-xs text-muted-foreground'>Kernel Version</p>
              </div>
            </div>

            <div className='space-y-2'>
              <div className='rounded-lg border bg-card p-3'>
                <p className='text-sm font-medium'>
                  {getOSName(systemData?.info?.os)}{' '}
                  {systemData?.info?.bb ? `(${systemData.info.bb}-bit)` : ''}
                </p>
                <p className='text-xs text-muted-foreground'>
                  Operating System
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Monitoring Configuration */}
        <div className='space-y-4'>
          <div className='flex items-center gap-2'>
            <Network className='h-4 w-4 text-info' />
            <h3 className='text-base font-semibold'>
              Monitoring Configuration
            </h3>
          </div>

          <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
            <div className='rounded-lg border bg-card p-3 text-center'>
              <div className='text-lg font-semibold'>
                :{systemData?.port || '--'}
              </div>
              <p className='mt-1 text-xs text-muted-foreground'>Monitor Port</p>
            </div>

            <div className='rounded-lg border bg-card p-3 text-center'>
              <div className='text-lg font-semibold'>
                v{monitoringData.systemInfo.version}
              </div>
              <p className='mt-1 text-xs text-muted-foreground'>
                Agent Version
              </p>
            </div>

            <div className='rounded-lg border bg-card p-3 text-center'>
              <div className='text-lg font-semibold'>
                {systemData?.users?.length || 0}
              </div>
              <p className='mt-1 text-xs text-muted-foreground'>Active Users</p>
            </div>

            <div className='rounded-lg border bg-card p-3 text-center'>
              <div
                className='truncate text-lg font-semibold'
                title={systemData?.collectionName || '--'}>
                {systemData?.collectionName || '--'}
              </div>
              <p className='mt-1 text-xs text-muted-foreground'>Collection</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* System Timeline */}
        <div className='space-y-4'>
          <div className='flex items-center gap-2'>
            <Clock className='h-4 w-4 text-secondary-foreground' />
            <h3 className='text-base font-semibold'>System Timeline</h3>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='flex items-center space-x-3 rounded-lg border bg-card p-3'>
              <div className='rounded-md bg-muted p-2'>
                <Clock className='h-3 w-3 text-muted-foreground' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-medium'>
                  {formatDate(systemData?.created)}
                </p>
                <p className='text-xs text-muted-foreground'>System Added</p>
              </div>
            </div>

            <div className='flex items-center space-x-3 rounded-lg border bg-card p-3'>
              <div className='rounded-md bg-muted p-2'>
                <Activity className='h-3 w-3 text-muted-foreground' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-medium'>
                  {formatDate(systemData?.updated)}
                </p>
                <p className='text-xs text-muted-foreground'>Last Updated</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default DefaultSystemInfo
