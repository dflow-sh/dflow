'use client'

import { Monitor, TrendingUp, Zap } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ServerType } from '@/payload-types-overrides'

import DefaultMonitoring from './DefaultMonitoring'
import DefaultMonitoringInstall from './DefaultMonitoringInstall'
import NetdataInstallPrompt from './NetdataInstallPrompt'
import NetdataMonitoring from './NetdataMonitoring'

const MonitoringTab = ({
  server,
  isSshConnected,
}: {
  server: ServerType
  isSshConnected: boolean
}) => {
  // TODO: Need check the beszel is installed are not
  const hasDefaultMonitoring = true
  const hasNetdata = !!server.netdataVersion

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h2 className='flex items-center gap-2 text-2xl font-semibold tracking-tight'>
            <Monitor className='h-6 w-6' />
            Server Monitoring
          </h2>
          <p className='mt-1 text-sm text-muted-foreground'>
            Comprehensive monitoring for your server
          </p>
        </div>
        <div className='flex gap-2'>
          {hasDefaultMonitoring && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              <TrendingUp className='h-3 w-3' />
              Default Active
            </Badge>
          )}
          {hasNetdata && (
            <Badge variant='outline' className='flex items-center gap-1'>
              <Zap className='h-3 w-3' />
              Netdata Active
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue='default' className='w-full'>
        <TabsList className='grid w-fit grid-cols-2'>
          <TabsTrigger value='default' className='flex items-center gap-2'>
            <TrendingUp className='h-4 w-4' />
            Default Monitoring
            {!hasDefaultMonitoring && (
              <Badge variant='outline' className='ml-2 scale-75 text-xs'>
                Setup
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value='netdata'
            className='relative flex items-center gap-2'>
            <Zap className='h-4 w-4' />
            Netdata
            {!hasNetdata && (
              <Badge variant='outline' className='ml-2 scale-75 text-xs'>
                Setup
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='default' className='mt-6'>
          {!hasDefaultMonitoring ? (
            <DefaultMonitoringInstall serverId={server.id} />
          ) : (
            <DefaultMonitoring
              server={server}
              isSshConnected={isSshConnected}
            />
          )}
        </TabsContent>

        <TabsContent value='netdata' className='mt-6'>
          <div className='space-y-4'>
            {!hasNetdata ? (
              <NetdataInstallPrompt
                server={server}
                disableInstallButton={!isSshConnected}
              />
            ) : (
              <NetdataMonitoring server={server} />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MonitoringTab
