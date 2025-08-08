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

interface DefaultSystemTabProps {
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
  }
  timeRange: {
    type: '1m' | '10m' | '20m' | '120m' | '480m'
    from: string
  }
}

const DefaultSystemTab = ({
  historicalData,
  timeRange,
}: DefaultSystemTabProps) => {
  const { cpu, memory } = historicalData

  // Process load average data for separate visualization
  const loadAvgData = cpu
    .filter(item => item.loadAvg && item.loadAvg.length >= 3)
    .map(item => ({
      timestamp: item.timestamp,
      fullTimestamp: item.fullTimestamp,
      load1m: item.loadAvg![0],
      load5m: item.loadAvg![1],
      load15m: item.loadAvg![2],
    }))

  // Process memory data with absolute values
  const memoryAbsoluteData = memory.map(item => ({
    ...item,
    free: item.total - item.used,
  }))

  // Calculate tick interval based on data density
  const calculateTickInterval = (data: any[]) => {
    const length = data.length
    if (length <= 10) return 1
    if (length <= 30) return 2
    if (length <= 60) return 5
    return Math.floor(length / 12)
  }

  return (
    <div className='space-y-6'>
      {/* CPU Detailed Charts */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* CPU Usage Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>CPU Usage Details</CardTitle>
            <CardDescription>
              Detailed CPU utilization over time
            </CardDescription>
          </CardHeader>
          <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
            <ChartContainer
              config={{
                usage: { label: 'CPU %', color: 'hsl(var(--chart-1))' },
              }}
              className='aspect-auto h-[300px] w-full'>
              <AreaChart data={cpu} accessibilityLayer>
                <CartesianGrid vertical={false} strokeDasharray='3 3' />
                <XAxis
                  dataKey='timestamp'
                  tickLine={false}
                  axisLine={false}
                  interval={calculateTickInterval(cpu)}
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
                  fillOpacity={0.4}
                  strokeWidth={2}
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
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Load Average */}
        {loadAvgData.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>System Load Average</CardTitle>
              <CardDescription>
                1min, 5min, and 15min load averages
              </CardDescription>
            </CardHeader>
            <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
              <ChartContainer
                config={{
                  load1m: { label: '1min', color: 'hsl(var(--chart-2))' },
                  load5m: { label: '5min', color: 'hsl(var(--chart-3))' },
                  load15m: { label: '15min', color: 'hsl(var(--chart-4))' },
                }}
                className='aspect-auto h-[300px] w-full'>
                <LineChart data={loadAvgData} accessibilityLayer>
                  <CartesianGrid vertical={false} strokeDasharray='3 3' />
                  <XAxis
                    dataKey='timestamp'
                    tickLine={false}
                    axisLine={false}
                    interval={calculateTickInterval(loadAvgData)}
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
                    dataKey='load1m'
                    stroke='hsl(var(--chart-2))'
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                  <Line
                    type='monotone'
                    dataKey='load5m'
                    stroke='hsl(var(--chart-3))'
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                  <Line
                    type='monotone'
                    dataKey='load15m'
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
                          const dataPoint = loadAvgData.find(
                            d => d.timestamp === label,
                          )
                          return dataPoint?.fullTimestamp || `Time: ${label}`
                        }}
                        formatter={(value, name) => [
                          Number(value).toFixed(2),
                          name === 'load1m'
                            ? '1min'
                            : name === 'load5m'
                              ? '5min'
                              : '15min',
                        ]}
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>System Load Average</CardTitle>
              <CardDescription>No load average data available</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* Memory Detailed Charts */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* Memory Usage Percentage */}
        <Card>
          <CardHeader>
            <CardTitle>Memory Usage Percentage</CardTitle>
            <CardDescription>
              Memory utilization percentage over time
            </CardDescription>
          </CardHeader>
          <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
            <ChartContainer
              config={{
                usage: { label: 'Memory %', color: 'hsl(var(--chart-2))' },
              }}
              className='aspect-auto h-[300px] w-full'>
              <AreaChart data={memory} accessibilityLayer>
                <CartesianGrid vertical={false} strokeDasharray='3 3' />
                <XAxis
                  dataKey='timestamp'
                  tickLine={false}
                  axisLine={false}
                  interval={calculateTickInterval(memory)}
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
                  stroke='hsl(var(--chart-2))'
                  fill='hsl(var(--chart-2))'
                  fillOpacity={0.4}
                  strokeWidth={2}
                  connectNulls
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator='dot'
                      labelFormatter={label => {
                        const dataPoint = memory.find(
                          d => d.timestamp === label,
                        )
                        return dataPoint?.fullTimestamp || `Time: ${label}`
                      }}
                      formatter={value => [
                        `${Number(value).toFixed(2)}%`,
                        'Memory Usage',
                      ]}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Memory Absolute Values */}
        <Card>
          <CardHeader>
            <CardTitle>Memory Usage (Absolute)</CardTitle>
            <CardDescription>Used vs Free memory</CardDescription>
          </CardHeader>
          <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
            <ChartContainer
              config={{
                used: { label: 'Used GB', color: 'hsl(var(--chart-1))' },
                free: { label: 'Free GB', color: 'hsl(var(--chart-3))' },
              }}
              className='aspect-auto h-[300px] w-full'>
              <AreaChart data={memoryAbsoluteData} accessibilityLayer>
                <CartesianGrid vertical={false} strokeDasharray='3 3' />
                <XAxis
                  dataKey='timestamp'
                  tickLine={false}
                  axisLine={false}
                  interval={calculateTickInterval(memoryAbsoluteData)}
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
                  stackId='memory'
                  stroke='hsl(var(--chart-1))'
                  fill='hsl(var(--chart-1))'
                  fillOpacity={0.6}
                  strokeWidth={2}
                  connectNulls
                />
                <Area
                  type='monotone'
                  dataKey='free'
                  stackId='memory'
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
                        const dataPoint = memoryAbsoluteData.find(
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
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DefaultSystemTab
