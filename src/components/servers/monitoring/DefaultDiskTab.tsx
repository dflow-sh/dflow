'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
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

interface DefaultDiskTabProps {
  historicalData: {
    disk: Array<{
      timestamp: string
      fullTimestamp: string
      usage: number
      used: number
      total: number
      reads?: number
      writes?: number
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

const DefaultDiskTab = ({ historicalData, timeRange }: DefaultDiskTabProps) => {
  const { disk } = historicalData

  // Calculate tick interval based on data density
  const calculateTickInterval = (data: any[]) => {
    const length = data.length
    if (length <= 10) return 1
    if (length <= 30) return 2
    if (length <= 60) return 5
    return Math.floor(length / 12)
  }

  // Process disk I/O data
  const diskIOData = disk.map(item => ({
    ...item,
    reads: item.reads || 0,
    writes: item.writes || 0,
    totalIO: (item.reads || 0) + (item.writes || 0),
  }))

  // Process disk space data
  const diskSpaceData = disk.map(item => ({
    ...item,
    free: item.total - item.used,
    freePercentage: ((item.total - item.used) / item.total) * 100,
  }))

  // Calculate cumulative I/O operations with time interval consideration
  const intervalMultiplier =
    timeRange.type === '1m'
      ? 60
      : timeRange.type === '10m'
        ? 600
        : timeRange.type === '20m'
          ? 1200
          : timeRange.type === '120m'
            ? 7200
            : 28800

  let cumulativeReads = 0
  let cumulativeWrites = 0
  const cumulativeIOData = diskIOData.map(item => {
    cumulativeReads += item.reads * intervalMultiplier
    cumulativeWrites += item.writes * intervalMultiplier
    return {
      timestamp: item.timestamp,
      fullTimestamp: item.fullTimestamp,
      cumulativeReads,
      cumulativeWrites,
      cumulativeTotal: cumulativeReads + cumulativeWrites,
    }
  })

  // Get latest disk data for pie chart
  const latestDiskData = disk.length > 0 ? disk[disk.length - 1] : null
  const pieData = latestDiskData
    ? [
        {
          name: 'Used',
          value: latestDiskData.used,
          color: 'hsl(var(--chart-1))',
        },
        {
          name: 'Free',
          value: latestDiskData.total - latestDiskData.used,
          color: 'hsl(var(--chart-3))',
        },
      ]
    : []

  return (
    <div className='space-y-6'>
      {/* Primary Disk Charts */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* Disk Usage Percentage */}
        <Card>
          <CardHeader>
            <CardTitle>Disk Usage Trend</CardTitle>
            <CardDescription>Used vs free space over time</CardDescription>
          </CardHeader>
          <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
            <ChartContainer
              config={{
                usage: { label: 'Used %', color: 'hsl(var(--chart-1))' },
                freePercentage: {
                  label: 'Free %',
                  color: 'hsl(var(--chart-3))',
                },
              }}
              className='aspect-auto h-[300px] w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={diskSpaceData} accessibilityLayer>
                  <CartesianGrid vertical={false} strokeDasharray='3 3' />
                  <XAxis
                    dataKey='timestamp'
                    tickLine={false}
                    axisLine={false}
                    interval={calculateTickInterval(diskSpaceData)}
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
                    stackId='disk'
                    stroke='hsl(var(--chart-1))'
                    fill='hsl(var(--chart-1))'
                    fillOpacity={0.6}
                    strokeWidth={2}
                    connectNulls
                  />
                  <Area
                    type='monotone'
                    dataKey='freePercentage'
                    stackId='disk'
                    stroke='hsl(var(--chart-3))'
                    fill='hsl(var(--chart-3))'
                    fillOpacity={0.4}
                    strokeWidth={2}
                    connectNulls
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        indicator='dot'
                        labelFormatter={label => {
                          const dataPoint = diskSpaceData.find(
                            d => d.timestamp === label,
                          )
                          return dataPoint?.fullTimestamp || `Time: ${label}`
                        }}
                        formatter={(value, name) => [
                          `${Number(value).toFixed(2)}%`,
                          name === 'usage' ? 'Used' : 'Free',
                        ]}
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Current Disk Space Distribution */}
        {pieData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Current Disk Space</CardTitle>
              <CardDescription>Used vs Free space distribution</CardDescription>
            </CardHeader>
            <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
              <ChartContainer
                config={{
                  used: { label: 'Used', color: 'hsl(var(--chart-1))' },
                  free: { label: 'Free', color: 'hsl(var(--chart-3))' },
                }}
                className='aspect-auto h-[300px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx='50%'
                      cy='50%'
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                      label={({ name, value }) =>
                        `${name}: ${value.toFixed(1)}GB`
                      }>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={value => [
                            `${Number(value).toFixed(2)}GB`,
                            'Space',
                          ]}
                        />
                      }
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Disk Space Details */}
      <div className='grid grid-cols-1 gap-4'>
        {/* Disk Space Absolute Values */}
        <Card>
          <CardHeader>
            <CardTitle>Disk Space (Absolute)</CardTitle>
            <CardDescription>Used vs Free space in GB</CardDescription>
          </CardHeader>
          <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
            <ChartContainer
              config={{
                used: { label: 'Used GB', color: 'hsl(var(--chart-1))' },
                free: { label: 'Free GB', color: 'hsl(var(--chart-3))' },
              }}
              className='aspect-auto h-[300px] w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={diskSpaceData} accessibilityLayer>
                  <CartesianGrid vertical={false} strokeDasharray='3 3' />
                  <XAxis
                    dataKey='timestamp'
                    tickLine={false}
                    axisLine={false}
                    interval={calculateTickInterval(diskSpaceData)}
                    minTickGap={20}
                    fontSize={11}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={value => `${value.toFixed(1)}GB`}
                    fontSize={11}
                  />
                  <Area
                    type='monotone'
                    dataKey='used'
                    stackId='space'
                    stroke='hsl(var(--chart-1))'
                    fill='hsl(var(--chart-1))'
                    fillOpacity={0.6}
                    strokeWidth={2}
                    connectNulls
                  />
                  <Area
                    type='monotone'
                    dataKey='free'
                    stackId='space'
                    stroke='hsl(var(--chart-3))'
                    fill='hsl(var(--chart-3))'
                    fillOpacity={0.4}
                    strokeWidth={2}
                    connectNulls
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        indicator='dot'
                        labelFormatter={label => {
                          const dataPoint = diskSpaceData.find(
                            d => d.timestamp === label,
                          )
                          return dataPoint?.fullTimestamp || `Time: ${label}`
                        }}
                        formatter={(value, name) => [
                          `${Number(value).toFixed(2)}GB`,
                          name === 'used' ? 'Used' : 'Free',
                        ]}
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Disk I/O Charts */}
      {diskIOData.length > 0 && (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {/* Disk I/O Operations */}
          <Card>
            <CardHeader>
              <CardTitle>Disk I/O Throughput</CardTitle>
              <CardDescription>
                Read and write throughput in MB/s
              </CardDescription>
            </CardHeader>
            <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
              <ChartContainer
                config={{
                  reads: { label: 'Reads', color: 'hsl(var(--chart-2))' },
                  writes: { label: 'Writes', color: 'hsl(var(--chart-4))' },
                }}
                className='aspect-auto h-[300px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={diskIOData} accessibilityLayer>
                    <CartesianGrid vertical={false} strokeDasharray='3 3' />
                    <XAxis
                      dataKey='timestamp'
                      tickLine={false}
                      axisLine={false}
                      interval={calculateTickInterval(diskIOData)}
                      minTickGap={20}
                      fontSize={11}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={value => `${value} MB/s`}
                      fontSize={11}
                    />
                    <Bar
                      dataKey='reads'
                      fill='hsl(var(--chart-2))'
                      fillOpacity={0.8}
                      radius={[2, 2, 2, 2]}
                    />
                    <Bar
                      dataKey='writes'
                      fill='hsl(var(--chart-4))'
                      fillOpacity={0.6}
                      radius={[2, 2, 2, 2]}
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
                            `${Number(value).toFixed(2)} MB/s`,
                            name === 'reads' ? 'Reads' : 'Writes',
                          ]}
                        />
                      }
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Total Disk I/O */}
          <Card>
            <CardHeader>
              <CardTitle>Total Disk Throughput</CardTitle>
              <CardDescription>
                Combined read and write throughput
              </CardDescription>
            </CardHeader>
            <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
              <ChartContainer
                config={{
                  totalIO: { label: 'Total I/O', color: 'hsl(var(--chart-5))' },
                }}
                className='aspect-auto h-[300px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={diskIOData} accessibilityLayer>
                    <CartesianGrid vertical={false} strokeDasharray='3 3' />
                    <XAxis
                      dataKey='timestamp'
                      tickLine={false}
                      axisLine={false}
                      interval={calculateTickInterval(diskIOData)}
                      minTickGap={20}
                      fontSize={11}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={value => `${value} MB/s`}
                      fontSize={11}
                    />
                    <Line
                      type='monotone'
                      dataKey='totalIO'
                      stroke='hsl(var(--chart-5))'
                      strokeWidth={3}
                      dot={false}
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
                          formatter={value => [
                            `${Number(value).toFixed(2)} MB/s`,
                            'Total I/O',
                          ]}
                        />
                      }
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cumulative I/O Operations */}
      {cumulativeIOData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cumulative Data Transfer</CardTitle>
            <CardDescription>Total data transferred over time</CardDescription>
          </CardHeader>
          <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
            <ChartContainer
              config={{
                cumulativeReads: {
                  label: 'Total Reads',
                  color: 'hsl(var(--chart-2))',
                },
                cumulativeWrites: {
                  label: 'Total Writes',
                  color: 'hsl(var(--chart-4))',
                },
              }}
              className='aspect-auto h-[300px] w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={cumulativeIOData} accessibilityLayer>
                  <CartesianGrid vertical={false} strokeDasharray='3 3' />
                  <XAxis
                    dataKey='timestamp'
                    tickLine={false}
                    axisLine={false}
                    interval={calculateTickInterval(cumulativeIOData)}
                    minTickGap={20}
                    fontSize={11}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={value => formatBytes(value)}
                    fontSize={11}
                  />
                  <Line
                    type='monotone'
                    dataKey='cumulativeReads'
                    stroke='hsl(var(--chart-2))'
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                  <Line
                    type='monotone'
                    dataKey='cumulativeWrites'
                    stroke='hsl(var(--chart-4))'
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        indicator='dot'
                        labelFormatter={label => {
                          const dataPoint = cumulativeIOData.find(
                            d => d.timestamp === label,
                          )
                          return dataPoint?.fullTimestamp || `Time: ${label}`
                        }}
                        formatter={(value, name) => [
                          formatBytes(Number(value)),
                          name === 'cumulativeReads'
                            ? 'Total Reads'
                            : 'Total Writes',
                        ]}
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Disk Statistics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Disk Statistics Summary</CardTitle>
          <CardDescription>
            Current disk usage and I/O statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            <div className='space-y-2'>
              <div className='text-2xl font-bold text-chart-1'>
                {disk.length > 0
                  ? `${disk[disk.length - 1].usage.toFixed(1)}%`
                  : '0%'}
              </div>
              <div className='text-sm text-muted-foreground'>Current Usage</div>
            </div>
            <div className='space-y-2'>
              <div className='text-2xl font-bold text-chart-3'>
                {disk.length > 0
                  ? formatBytes(
                      (disk[disk.length - 1].total -
                        disk[disk.length - 1].used) *
                        1024 *
                        1024 *
                        1024,
                    )
                  : '0 GB'}
              </div>
              <div className='text-sm text-muted-foreground'>Free Space</div>
            </div>
            {diskIOData.length > 0 && (
              <>
                <div className='space-y-2'>
                  <div className='text-2xl font-bold text-chart-2'>
                    {cumulativeIOData.length > 0
                      ? formatBytes(
                          cumulativeIOData[cumulativeIOData.length - 1]
                            .cumulativeReads,
                        )
                      : '0'}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Total Reads
                  </div>
                </div>
                <div className='space-y-2'>
                  <div className='text-2xl font-bold text-chart-4'>
                    {cumulativeIOData.length > 0
                      ? formatBytes(
                          cumulativeIOData[cumulativeIOData.length - 1]
                            .cumulativeWrites,
                        )
                      : '0'}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Total Writes
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DefaultDiskTab
