'use client'

import { useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import CPUTab from './CPUTab'
import DiskTab from './DiskTab'
import MemoryTab from './MemoryTab'
import NetworkTab from './NetworkTab'
import OverviewTab from './OverviewTab'
import RequestsTab from './RequestsTab'

const MonitoringTabs = ({
  dashboardMetrics,
}: {
  dashboardMetrics: {
    cpuData: never[]
    cpuUsageDistributionData: never[]
    memoryData: never[]
    networkData: never[]
    diskSpaceData: never[]
    diskIOData: never[]
    diskVolumesData: never[]
    inodeUsageData: never[]
    serverLoadData: never[]
    requestData: never[]
    responseTimeData: never[]
  }
}) => {
  const [activeTab, setActiveTab] = useState('overview')

  const {
    cpuData,
    cpuUsageDistributionData,
    diskSpaceData,
    diskIOData,
    diskVolumesData,
    inodeUsageData,
    memoryData,
    networkData,
    requestData,
    responseTimeData,
    serverLoadData,
  } = dashboardMetrics

  const diskColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
  ]

  return (
    <Tabs
      defaultValue='overview'
      className='mt-12 space-y-4'
      onValueChange={setActiveTab}>
      <TabsList
        className='w-full max-w-max overflow-x-scroll'
        style={{ scrollbarWidth: 'none' }}>
        <TabsTrigger value='overview'>Overview</TabsTrigger>
        <TabsTrigger value='cpu'>CPU</TabsTrigger>
        <TabsTrigger value='memory'>Memory</TabsTrigger>
        <TabsTrigger value='disk'>Disk</TabsTrigger>
        <TabsTrigger value='network'>Network</TabsTrigger>
        <TabsTrigger value='requests'>Requests</TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value='overview' className='space-y-4'>
        <OverviewTab
          cpuData={cpuData}
          diskIOData={diskIOData}
          memoryData={memoryData}
          networkData={networkData}
        />
      </TabsContent>

      {/* CPU Tab */}
      <TabsContent value='cpu' className='space-y-4'>
        <CPUTab
          cpuData={cpuData}
          cpuUsageDistributionData={cpuUsageDistributionData}
          serverLoadData={serverLoadData}
        />
      </TabsContent>

      {/* Memory Tab */}
      <TabsContent value='memory' className='space-y-4'>
        <MemoryTab
          diskColors={diskColors}
          diskSpaceData={diskSpaceData}
          memoryData={memoryData}
        />
      </TabsContent>

      {/* Disk Tab */}
      <TabsContent value='disk' className='space-y-4'>
        <DiskTab
          diskColors={diskColors}
          diskIOData={diskIOData}
          diskSpaceData={diskSpaceData}
          diskVolumesData={diskVolumesData}
        />
      </TabsContent>

      {/* Network Tab */}
      <TabsContent value='network' className='space-y-4'>
        <NetworkTab networkData={networkData} />
      </TabsContent>

      {/* Requests Tab */}
      <TabsContent value='requests' className='relative space-y-4'>
        <RequestsTab
          requestData={requestData}
          responseTimeData={responseTimeData}
        />
      </TabsContent>
    </Tabs>
  )
}

export default MonitoringTabs
