'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import DefaultDiskTab from './DefaultDiskTab'
import DefaultNetworkTab from './DefaultNetworkTab'
import DefaultOverviewTab from './DefaultOverviewTab'
import DefaultSystemTab from './DefaultSystemTab'

interface DefaultMonitoringTabsProps {
  historicalData: {
    cpu: Array<{
      timestamp: string
      fullTimestamp: string
      usage: number
      loadAvg?: number[]
    }>
    memory: Array<{
      timestamp: string
      fullTimestamp: string
      usage: number
      used: number
      total: number
    }>
    disk: Array<{
      timestamp: string
      fullTimestamp: string
      usage: number
      used: number
      total: number
      reads?: number
      writes?: number
    }>
    network: Array<{
      timestamp: string
      fullTimestamp: string
      incoming: number
      outgoing: number
      bandwidth?: number[]
    }>
  }
  timeRange: {
    type: '1m' | '10m' | '20m' | '120m' | '480m'
    from: string
  }
}

const DefaultMonitoringTabs = ({
  historicalData,
  timeRange,
}: DefaultMonitoringTabsProps) => {
  return (
    <Tabs defaultValue='overview' className='w-full'>
      <TabsList className='grid w-full grid-cols-4'>
        <TabsTrigger value='overview'>Overview</TabsTrigger>
        <TabsTrigger value='system'>System</TabsTrigger>
        <TabsTrigger value='network'>Network</TabsTrigger>
        <TabsTrigger value='disk'>Disk I/O</TabsTrigger>
      </TabsList>

      <TabsContent value='overview' className='mt-4'>
        <DefaultOverviewTab
          historicalData={historicalData}
          timeRange={timeRange}
        />
      </TabsContent>

      <TabsContent value='system' className='mt-4'>
        <DefaultSystemTab
          historicalData={historicalData}
          timeRange={timeRange}
        />
      </TabsContent>

      <TabsContent value='network' className='mt-4'>
        <DefaultNetworkTab
          historicalData={historicalData}
          timeRange={timeRange}
        />
      </TabsContent>

      <TabsContent value='disk' className='mt-4'>
        <DefaultDiskTab historicalData={historicalData} timeRange={timeRange} />
      </TabsContent>
    </Tabs>
  )
}

export default DefaultMonitoringTabs
