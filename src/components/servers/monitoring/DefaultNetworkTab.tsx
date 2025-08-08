'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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

interface DefaultNetworkTabProps {
  historicalData: {
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

const DefaultNetworkTab = ({
  historicalData,
  timeRange,
}: DefaultNetworkTabProps) => {
  const { network } = historicalData

  // Calculate tick interval based on data density
  const calculateTickInterval = (data: any[]) => {
    const length = data.length
    if (length <= 10) return 1
    if (length <= 30) return 2
    if (length <= 60) return 5
    return Math.floor(length / 12)
  }

  // Calculate cumulative data transfer in bytes
  let cumulativeIn = 0
  let cumulativeOut = 0
  const cumulativeData = network.map(item => {
    // Convert bytes/s to bytes per interval (60s for 1m, etc.)
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

    cumulativeIn += item.incoming * intervalMultiplier
    cumulativeOut += item.outgoing * intervalMultiplier

    return {
      timestamp: item.timestamp,
      fullTimestamp: item.fullTimestamp,
      cumulativeIn,
      cumulativeOut,
      cumulativeTotal: cumulativeIn + cumulativeOut,
    }
  })

  // Get peak values
  const peakIncoming =
    network.length > 0 ? Math.max(...network.map(d => d.incoming)) : 0
  const peakOutgoing =
    network.length > 0 ? Math.max(...network.map(d => d.outgoing)) : 0

  return (
    <div className='space-y-6'>
      {/* Primary Network Traffic Charts */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* Network Traffic Over Time - Updated with stacking */}
        <Card>
          <CardHeader>
            <CardTitle>Network Traffic</CardTitle>
            <CardDescription>Incoming and outgoing traffic</CardDescription>
          </CardHeader>
          <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
            <ChartContainer
              config={{
                incoming: { label: 'Incoming', color: 'hsl(var(--chart-3))' },
                outgoing: { label: 'Outgoing', color: 'hsl(var(--chart-4))' },
              }}
              className='aspect-auto h-[300px] w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={network} accessibilityLayer>
                  <CartesianGrid vertical={false} strokeDasharray='3 3' />
                  <XAxis
                    dataKey='timestamp'
                    tickLine={false}
                    axisLine={false}
                    interval={calculateTickInterval(network)}
                    minTickGap={20}
                    fontSize={11}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={value => formatBytes(value) + '/s'}
                    fontSize={11}
                    domain={[0, (dataMax: number) => dataMax * 1.1]}
                  />
                  <Area
                    type='monotone'
                    dataKey='incoming'
                    stackId='network'
                    stroke='hsl(var(--chart-3))'
                    fill='hsl(var(--chart-3))'
                    fillOpacity={0.6}
                    strokeWidth={2}
                    connectNulls
                  />
                  <Area
                    type='monotone'
                    dataKey='outgoing'
                    stackId='network'
                    stroke='hsl(var(--chart-4))'
                    fill='hsl(var(--chart-4))'
                    fillOpacity={0.4}
                    strokeWidth={2}
                    connectNulls
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        indicator='dot'
                        labelFormatter={label => {
                          const dataPoint = network.find(
                            d => d.timestamp === label,
                          )
                          return dataPoint?.fullTimestamp || `Time: ${label}`
                        }}
                        formatter={(value, name) => [
                          `${formatBytes(Number(value), Number(value) < 1024 ? 0 : 2)}/s`,
                          name === 'incoming' ? 'Incoming' : 'Outgoing',
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

        {/* Total Network Traffic */}
        <Card>
          <CardHeader>
            <CardTitle>Total Network Traffic</CardTitle>
            <CardDescription>
              Combined incoming and outgoing traffic
            </CardDescription>
          </CardHeader>
          <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
            <ChartContainer
              config={{
                total: { label: 'Total Traffic', color: 'hsl(var(--chart-1))' },
              }}
              className='aspect-auto h-[300px] w-full'>
              <LineChart
                data={network.map(item => ({
                  ...item,
                  total: item.incoming + item.outgoing,
                }))}
                accessibilityLayer>
                <CartesianGrid vertical={false} strokeDasharray='3 3' />
                <XAxis
                  dataKey='timestamp'
                  tickLine={false}
                  axisLine={false}
                  interval={calculateTickInterval(network)}
                  minTickGap={20}
                  fontSize={11}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={value => formatBytes(value) + '/s'}
                  fontSize={11}
                />
                <Line
                  type='monotone'
                  dataKey='total'
                  stroke='hsl(var(--chart-1))'
                  strokeWidth={3}
                  dot={false}
                  connectNulls
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator='dot'
                      labelFormatter={label => {
                        const dataPoint = network.find(
                          d => d.timestamp === label,
                        )
                        return dataPoint?.fullTimestamp || `Time: ${label}`
                      }}
                      formatter={value => [
                        `${formatBytes(Number(value))}/s`,
                        'Total Traffic',
                      ]}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Network Charts */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* Bandwidth Chart (if available) */}
        {network.some(item => item.bandwidth && item.bandwidth.length >= 2) && (
          <Card>
            <CardHeader>
              <CardTitle>Bandwidth Utilization</CardTitle>
              <CardDescription>Received and sent speeds</CardDescription>
            </CardHeader>
            <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
              <ChartContainer
                config={{
                  received: { label: 'Received', color: 'hsl(var(--chart-2))' },
                  sent: { label: 'Sent', color: 'hsl(var(--chart-5))' },
                }}
                className='aspect-auto h-[300px] w-full'>
                <BarChart
                  data={network.map(item => ({
                    timestamp: item.timestamp,
                    fullTimestamp: item.fullTimestamp,
                    received: item.bandwidth?.[0] || 0,
                    sent: item.bandwidth?.[1] || 0,
                  }))}
                  accessibilityLayer>
                  <CartesianGrid vertical={false} strokeDasharray='3 3' />
                  <XAxis
                    dataKey='timestamp'
                    tickLine={false}
                    axisLine={false}
                    interval={calculateTickInterval(network)}
                    minTickGap={20}
                    fontSize={11}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={value => formatBytes(value) + '/s'}
                    fontSize={11}
                  />
                  <Bar
                    dataKey='received'
                    fill='hsl(var(--chart-2))'
                    fillOpacity={0.8}
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey='sent'
                    fill='hsl(var(--chart-5))'
                    fillOpacity={0.6}
                    radius={[2, 2, 0, 0]}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        indicator='dot'
                        labelFormatter={label => {
                          const dataPoint = network.find(
                            d => d.timestamp === label,
                          )
                          return dataPoint?.fullTimestamp || `Time: ${label}`
                        }}
                        formatter={(value, name) => [
                          `${formatBytes(Number(value))}/s`,
                          name === 'received' ? 'Received' : 'Sent',
                        ]}
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Cumulative Data Transfer */}
        <Card>
          <CardHeader>
            <CardTitle>Cumulative Data Transfer</CardTitle>
            <CardDescription>Total data transferred over time</CardDescription>
          </CardHeader>
          <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
            <ChartContainer
              config={{
                cumulativeIn: {
                  label: 'Total In',
                  color: 'hsl(var(--chart-3))',
                },
                cumulativeOut: {
                  label: 'Total Out',
                  color: 'hsl(var(--chart-4))',
                },
              }}
              className='aspect-auto h-[300px] w-full'>
              <LineChart data={cumulativeData} accessibilityLayer>
                <CartesianGrid vertical={false} strokeDasharray='3 3' />
                <XAxis
                  dataKey='timestamp'
                  tickLine={false}
                  axisLine={false}
                  interval={calculateTickInterval(cumulativeData)}
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
                  dataKey='cumulativeIn'
                  stroke='hsl(var(--chart-3))'
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
                <Line
                  type='monotone'
                  dataKey='cumulativeOut'
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
                        const dataPoint = cumulativeData.find(
                          d => d.timestamp === label,
                        )
                        return dataPoint?.fullTimestamp || `Time: ${label}`
                      }}
                      formatter={(value, name) => [
                        formatBytes(Number(value)),
                        name === 'cumulativeIn' ? 'Total In' : 'Total Out',
                      ]}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Network Statistics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Network Statistics Summary</CardTitle>
          <CardDescription>Current session network statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            <div className='space-y-2'>
              <div className='text-2xl font-bold text-chart-3'>
                {formatBytes(
                  cumulativeData[cumulativeData.length - 1]?.cumulativeIn || 0,
                )}
              </div>
              <div className='text-sm text-muted-foreground'>
                Total Received
              </div>
            </div>
            <div className='space-y-2'>
              <div className='text-2xl font-bold text-chart-4'>
                {formatBytes(
                  cumulativeData[cumulativeData.length - 1]?.cumulativeOut || 0,
                )}
              </div>
              <div className='text-sm text-muted-foreground'>Total Sent</div>
            </div>
            <div className='space-y-2'>
              <div className='text-2xl font-bold text-chart-1'>
                {formatBytes(peakIncoming)}/s
              </div>
              <div className='text-sm text-muted-foreground'>Peak Received</div>
            </div>
            <div className='space-y-2'>
              <div className='text-2xl font-bold text-chart-2'>
                {formatBytes(peakOutgoing)}/s
              </div>
              <div className='text-sm text-muted-foreground'>Peak Sent</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DefaultNetworkTab
