'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface DefaultOverviewTabProps {
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

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
}

const DefaultOverviewTab = ({
  historicalData,
  timeRange,
}: DefaultOverviewTabProps) => {
  const { cpu, memory, disk, network } = historicalData

  // Process disk I/O data - combining reads and writes
  const diskIOData = disk.map(item => ({
    ...item,
    totalIO: (item.reads || 0) + (item.writes || 0),
    reads: item.reads || 0,
    writes: item.writes || 0,
  }))

  // Process load average data
  const loadAverageData = cpu.map(item => ({
    ...item,
    load1: item.loadAvg?.[0] || 0,
    load5: item.loadAvg?.[1] || 0,
    load15: item.loadAvg?.[2] || 0,
  }))

  // Process memory data in bytes for display
  const memoryBytesData = memory.map(item => ({
    ...item,
    usedBytes: item.used * 1024 * 1024 * 1024, // Convert GB to bytes
    totalBytes: item.total * 1024 * 1024 * 1024,
  }))

  // Process disk usage in bytes
  const diskBytesData = disk.map(item => ({
    ...item,
    usedBytes: item.used * 1024 * 1024 * 1024, // Convert GB to bytes
    totalBytes: item.total * 1024 * 1024 * 1024,
  }))

  // Calculate tick interval based on time range
  const getTickInterval = () => {
    const dataLength = cpu.length
    if (dataLength <= 10) return 1
    if (dataLength <= 30) return 2
    if (dataLength <= 60) return 5
    return Math.floor(dataLength / 12)
  }

  const tickInterval = getTickInterval()

  return (
    <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
      {/* CPU Usage */}
      <Card>
        <CardHeader>
          <CardTitle>CPU Usage</CardTitle>
          <CardDescription>Average system-wide CPU utilization</CardDescription>
        </CardHeader>
        <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
          <ChartContainer
            config={{
              usage: { label: 'CPU %', color: 'hsl(var(--chart-1))' },
            }}
            className='aspect-auto h-[200px] w-full'>
            <AreaChart data={cpu} accessibilityLayer>
              <CartesianGrid vertical={false} strokeDasharray='3 3' />
              <XAxis
                dataKey='timestamp'
                tickLine={false}
                axisLine={false}
                interval={tickInterval}
                minTickGap={20}
                fontSize={11}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tickFormatter={value => `${value}%`}
                fontSize={11}
              />
              <Area
                type='monotone'
                dataKey='usage'
                stroke='hsl(var(--chart-1))'
                fill='hsl(var(--chart-1))'
                fillOpacity={0.2}
                strokeWidth={1.5}
                connectNulls
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator='dot'
                    labelFormatter={label => {
                      const dataPoint = cpu.find(d => d.timestamp === label)
                      return dataPoint?.fullTimestamp || `Time: ${label}`
                    }}
                    formatter={value => [
                      `${Number(value).toFixed(2)}%`,
                      'CPU Usage',
                    ]}
                  />
                }
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Memory Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Memory Usage</CardTitle>
          <CardDescription>
            Precise utilization at the recorded time
          </CardDescription>
        </CardHeader>
        <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
          <ChartContainer
            config={{
              usedBytes: { label: 'Memory', color: 'hsl(var(--chart-2))' },
            }}
            className='aspect-auto h-[200px] w-full'>
            <AreaChart data={memoryBytesData} accessibilityLayer>
              <CartesianGrid vertical={false} strokeDasharray='3 3' />
              <XAxis
                dataKey='timestamp'
                tickLine={false}
                axisLine={false}
                interval={tickInterval}
                minTickGap={20}
                fontSize={11}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={value => formatBytes(value)}
                fontSize={11}
              />
              <Area
                type='monotone'
                dataKey='usedBytes'
                stroke='hsl(var(--chart-2))'
                fill='hsl(var(--chart-2))'
                fillOpacity={0.2}
                strokeWidth={1.5}
                connectNulls
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator='dot'
                    labelFormatter={label => {
                      const dataPoint = memoryBytesData.find(
                        d => d.timestamp === label,
                      )
                      return dataPoint?.fullTimestamp || `Time: ${label}`
                    }}
                    formatter={value => [
                      formatBytes(Number(value)),
                      'Memory Used',
                    ]}
                  />
                }
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Disk Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Disk Usage</CardTitle>
          <CardDescription>Usage of root partition</CardDescription>
        </CardHeader>
        <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
          <ChartContainer
            config={{
              usedBytes: { label: 'Disk', color: 'hsl(var(--chart-3))' },
            }}
            className='aspect-auto h-[200px] w-full'>
            <AreaChart data={diskBytesData} accessibilityLayer>
              <CartesianGrid vertical={false} strokeDasharray='3 3' />
              <XAxis
                dataKey='timestamp'
                tickLine={false}
                axisLine={false}
                interval={tickInterval}
                minTickGap={20}
                fontSize={11}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={value => formatBytes(value)}
                fontSize={11}
              />
              <Area
                type='monotone'
                dataKey='usedBytes'
                stroke='hsl(var(--chart-3))'
                fill='hsl(var(--chart-3))'
                fillOpacity={0.2}
                strokeWidth={1.5}
                connectNulls
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator='dot'
                    labelFormatter={label => {
                      const dataPoint = diskBytesData.find(
                        d => d.timestamp === label,
                      )
                      return dataPoint?.fullTimestamp || `Time: ${label}`
                    }}
                    formatter={value => [
                      formatBytes(Number(value)),
                      'Disk Used',
                    ]}
                  />
                }
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Disk I/O */}
      <Card>
        <CardHeader>
          <CardTitle>Disk I/O</CardTitle>
          <CardDescription>Throughput of root filesystem</CardDescription>
        </CardHeader>
        <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
          <ChartContainer
            config={{
              reads: { label: 'Reads', color: 'hsl(var(--chart-4))' },
              writes: { label: 'Writes', color: 'hsl(var(--chart-5))' },
            }}
            className='aspect-auto h-[200px] w-full'>
            <AreaChart data={diskIOData} accessibilityLayer>
              <CartesianGrid vertical={false} strokeDasharray='3 3' />
              <XAxis
                dataKey='timestamp'
                tickLine={false}
                axisLine={false}
                interval={tickInterval}
                minTickGap={20}
                fontSize={11}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={value => `${formatBytes(value)}/s`}
                fontSize={11}
              />
              <Area
                type='monotone'
                dataKey='writes'
                stackId='io'
                stroke='hsl(var(--chart-5))'
                fill='hsl(var(--chart-5))'
                fillOpacity={0.6}
                strokeWidth={1}
                connectNulls
              />
              <Area
                type='monotone'
                dataKey='reads'
                stackId='io'
                stroke='hsl(var(--chart-4))'
                fill='hsl(var(--chart-4))'
                fillOpacity={0.6}
                strokeWidth={1}
                connectNulls
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator='dot'
                    labelFormatter={label => {
                      const dataPoint = diskIOData.find(
                        d => d.timestamp === label,
                      )
                      return dataPoint?.fullTimestamp || `Time: ${label}`
                    }}
                    formatter={(value, name) => [
                      `${formatBytes(Number(value))}/s`,
                      name === 'reads' ? 'Reads' : 'Writes',
                    ]}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Bandwidth (Network Traffic) */}
      <Card>
        <CardHeader>
          <CardTitle>Bandwidth</CardTitle>
          <CardDescription>
            Network traffic of public interfaces
          </CardDescription>
        </CardHeader>
        <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
          <ChartContainer
            config={{
              incoming: { label: 'Incoming', color: 'hsl(var(--chart-1))' },
              outgoing: { label: 'Outgoing', color: 'hsl(var(--chart-2))' },
            }}
            className='aspect-auto h-[200px] w-full'>
            <AreaChart data={network} accessibilityLayer>
              <CartesianGrid vertical={false} strokeDasharray='3 3' />
              <XAxis
                dataKey='timestamp'
                tickLine={false}
                axisLine={false}
                interval={tickInterval}
                minTickGap={20}
                fontSize={11}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={value => `${formatBytes(value)}/s`}
                fontSize={11}
              />
              <Area
                type='monotone'
                dataKey='outgoing'
                stackId='network'
                stroke='hsl(var(--chart-2))'
                fill='hsl(var(--chart-2))'
                fillOpacity={0.6}
                strokeWidth={1}
                connectNulls
              />
              <Area
                type='monotone'
                dataKey='incoming'
                stackId='network'
                stroke='hsl(var(--chart-1))'
                fill='hsl(var(--chart-1))'
                fillOpacity={0.6}
                strokeWidth={1}
                connectNulls
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator='dot'
                    labelFormatter={label => {
                      const dataPoint = network.find(d => d.timestamp === label)
                      return dataPoint?.fullTimestamp || `Time: ${label}`
                    }}
                    formatter={(value, name) => [
                      `${formatBytes(Number(value))}/s`,
                      name === 'incoming' ? 'Incoming' : 'Outgoing',
                    ]}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Load Average */}
      <Card>
        <CardHeader>
          <CardTitle>Load Average</CardTitle>
          <CardDescription>System load averages over time</CardDescription>
        </CardHeader>
        <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
          <ChartContainer
            config={{
              load1: { label: '1 min', color: 'hsl(var(--chart-1))' },
              load5: { label: '5 min', color: 'hsl(var(--chart-2))' },
              load15: { label: '15 min', color: 'hsl(var(--chart-3))' },
            }}
            className='aspect-auto h-[200px] w-full'>
            <LineChart data={loadAverageData} accessibilityLayer>
              <CartesianGrid vertical={false} strokeDasharray='3 3' />
              <XAxis
                dataKey='timestamp'
                tickLine={false}
                axisLine={false}
                interval={tickInterval}
                minTickGap={20}
                fontSize={11}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={11}
                domain={[0, 'auto']}
              />
              <Line
                type='monotone'
                dataKey='load1'
                stroke='hsl(var(--chart-1))'
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line
                type='monotone'
                dataKey='load5'
                stroke='hsl(var(--chart-2))'
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line
                type='monotone'
                dataKey='load15'
                stroke='hsl(var(--chart-3))'
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator='dot'
                    labelFormatter={label => {
                      const dataPoint = loadAverageData.find(
                        d => d.timestamp === label,
                      )
                      return dataPoint?.fullTimestamp || `Time: ${label}`
                    }}
                    formatter={(value, name) => {
                      const labels = {
                        load1: '1 min',
                        load5: '5 min',
                        load15: '15 min',
                      }
                      return [
                        Number(value).toFixed(2),
                        labels[name as keyof typeof labels],
                      ]
                    }}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default DefaultOverviewTab
