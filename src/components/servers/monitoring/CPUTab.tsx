'use client'

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

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

import { getTimeRange } from './getTimeRange'

// Helper function to convert uptime string to seconds for plotting
const uptimeToSeconds = (uptimeStr: any) => {
  if (!uptimeStr) return 0

  const str = String(uptimeStr) // Ensure it's a string
  const parts = str.split(' ')
  let totalSeconds = 0

  // Handle days part (e.g., "13d")
  if (parts[0] && parts[0].endsWith('d')) {
    const days = parseInt(parts[0].replace('d', ''), 10)
    totalSeconds += days * 24 * 60 * 60
  }

  // Handle hours:minutes part (e.g., "04:13")
  if (parts[1]) {
    const timeParts = parts[1].split(':')
    if (timeParts[0]) {
      totalSeconds += parseInt(timeParts[0], 10) * 60 * 60 // hours
    }
    if (timeParts[1]) {
      totalSeconds += parseInt(timeParts[1], 10) * 60 // minutes
    }
  }

  return totalSeconds
}

// Helper function to format seconds back to uptime display
const secondsToUptimeFormat = (seconds: number) => {
  const days = Math.floor(seconds / (24 * 60 * 60))
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((seconds % (60 * 60)) / 60)

  return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

const CPUTab = ({
  cpuUtilization,
  cpuSomePressure,
  cpuSomePressureStallTime,
  serverLoad,
  serverUptime,
}: {
  cpuUtilization: any[]
  cpuSomePressure: any[]
  cpuSomePressureStallTime: any[]
  serverLoad: any[]
  serverUptime: any[]
}) => {
  const cpuMetrics = [
    { key: 'utilization', label: 'Utilization', color: 'hsl(var(--chart-1))' },
    { key: 'user', label: 'User', color: 'hsl(var(--chart-2))' },
    { key: 'system', label: 'System', color: 'hsl(var(--chart-3))' },
    { key: 'iowait', label: 'IOWait', color: 'hsl(var(--chart-4))' },
    { key: 'steal', label: 'Steal', color: 'hsl(var(--chart-5))' },
    { key: 'softirq', label: 'SoftIRQ', color: 'hsl(var(--chart-6))' },
    { key: 'irq', label: 'IRQ', color: 'hsl(var(--chart-7))' },
    { key: 'nice', label: 'Nice', color: 'hsl(var(--chart-8))' },
    { key: 'guest', label: 'Guest', color: 'hsl(var(--chart-9))' },
    { key: 'guest_nice', label: 'Guest Nice', color: 'hsl(var(--chart-10))' },
  ]

  const pressureMetrics = [
    { key: 'some10', label: 'Some 10', color: 'hsl(var(--chart-2))' },
    { key: 'some60', label: 'Some 60', color: 'hsl(var(--chart-3))' },
    { key: 'some300', label: 'Some 300', color: 'hsl(var(--chart-4))' },
  ]

  const stallTimeMetrics = [
    { key: 'stallTime', label: 'Stall Time', color: 'hsl(var(--chart-3))' },
  ]

  const loadMetrics = [
    { key: 'load1m', label: 'Load 1 m', color: 'hsl(var(--chart-4))' },
    { key: 'load5m', label: 'Load 5 m', color: 'hsl(var(--chart-5))' },
    { key: 'load15m', label: 'Load 15 m', color: 'hsl(var(--chart-6))' },
  ]

  const uptimeMetrics = [
    { key: 'uptime', label: 'Uptime', color: 'hsl(var(--chart-7))' },
  ]

  // Process uptime data to add a numeric value for charting
  const processedUptimeData =
    serverUptime?.map(item => ({
      ...item,
      uptimeSeconds: uptimeToSeconds(item.uptime),
    })) || []

  // Find min and max values for better scaling
  const uptimeSeconds = processedUptimeData.map(item => item.uptimeSeconds)
  const minUptime = Math.min(...uptimeSeconds)
  const maxUptime = Math.max(...uptimeSeconds)

  return (
    <div className='grid grid-cols-1 gap-4'>
      {/* CPU Utilization */}
      <Card>
        <CardHeader>
          <CardTitle>CPU Utilization</CardTitle>
          <CardDescription>
            {cpuUtilization?.length > 1
              ? `${getTimeRange(cpuUtilization)} (from ${cpuUtilization.at(0)?.timestamp} to ${cpuUtilization.at(-1)?.timestamp})`
              : 'No data available'}
          </CardDescription>
        </CardHeader>
        <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
          <ChartContainer
            config={Object.fromEntries(
              cpuMetrics.map(m => [m.key, { label: m.label, color: m.color }]),
            )}
            className='aspect-auto h-[300px] w-full'>
            <LineChart data={cpuUtilization} syncId='cpu-metrics'>
              <CartesianGrid vertical={false} />
              <XAxis dataKey='timestamp' tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
              {cpuMetrics.map(metric => (
                <Line
                  key={metric.key}
                  type='monotone'
                  dataKey={metric.key}
                  stroke={metric.color}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator='dot'
                    labelFormatter={label => {
                      const dataPoint = cpuUtilization.find(
                        d => d.timestamp === label,
                      )
                      return dataPoint
                        ? dataPoint.fullTimestamp
                        : `Time: ${label}`
                    }}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* CPU Some Pressure */}
      <Card>
        <CardHeader>
          <CardTitle>CPU Some Pressure</CardTitle>
          <CardDescription>
            {cpuSomePressure?.length > 1
              ? `${getTimeRange(cpuSomePressure)} (from ${cpuSomePressure.at(0)?.timestamp} to ${cpuSomePressure.at(-1)?.timestamp})`
              : 'No data available'}
          </CardDescription>
        </CardHeader>
        <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
          <ChartContainer
            config={Object.fromEntries(
              pressureMetrics.map(m => [
                m.key,
                { label: m.label, color: m.color },
              ]),
            )}
            className='aspect-auto h-[250px] w-full'>
            <LineChart data={cpuSomePressure} syncId='cpu-metrics'>
              <CartesianGrid vertical={false} />
              <XAxis dataKey='timestamp' tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              {pressureMetrics.map(metric => (
                <Line
                  key={metric.key}
                  type='monotone'
                  dataKey={metric.key}
                  stroke={metric.color}
                  strokeWidth={2}
                  dot={false}
                />
              ))}

              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator='dot'
                    labelFormatter={label => {
                      const dataPoint = cpuSomePressure.find(
                        d => d.timestamp === label,
                      )
                      return dataPoint
                        ? dataPoint.fullTimestamp
                        : `Time: ${label}`
                    }}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* CPU Some Pressure Stall Time */}
      <Card>
        <CardHeader>
          <CardTitle>CPU Some Pressure Stall Time</CardTitle>
          <CardDescription>
            {cpuSomePressureStallTime?.length > 1
              ? `${getTimeRange(cpuSomePressureStallTime)} (from ${cpuSomePressureStallTime.at(0)?.timestamp} to ${cpuSomePressureStallTime.at(-1)?.timestamp})`
              : 'No data available'}
          </CardDescription>
        </CardHeader>
        <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
          <ChartContainer
            config={Object.fromEntries(
              stallTimeMetrics.map(m => [
                m.key,
                { label: m.label, color: m.color },
              ]),
            )}
            className='aspect-auto h-[250px] w-full'>
            <LineChart data={cpuSomePressureStallTime} syncId='cpu-metrics'>
              <CartesianGrid vertical={false} />
              <XAxis dataKey='timestamp' tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              {stallTimeMetrics.map(metric => (
                <Line
                  key={metric.key}
                  type='monotone'
                  dataKey={metric.key}
                  stroke={metric.color}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator='dot'
                    labelFormatter={label => {
                      const dataPoint = cpuSomePressureStallTime.find(
                        d => d.timestamp === label,
                      )
                      return dataPoint
                        ? dataPoint.fullTimestamp
                        : `Time: ${label}`
                    }}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Server Load */}
      <Card>
        <CardHeader>
          <CardTitle>Server Load</CardTitle>
          <CardDescription>
            {serverLoad?.length > 1
              ? `${getTimeRange(serverLoad)} (from ${serverLoad.at(0)?.timestamp} to ${serverLoad.at(-1)?.timestamp})`
              : 'No data available'}
          </CardDescription>
        </CardHeader>
        <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
          <ChartContainer
            config={Object.fromEntries(
              loadMetrics.map(m => [m.key, { label: m.label, color: m.color }]),
            )}
            className='aspect-auto h-[250px] w-full'>
            <LineChart data={serverLoad} syncId='cpu-metrics'>
              <CartesianGrid vertical={false} />
              <XAxis dataKey='timestamp' tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              {loadMetrics.map(metric => (
                <Line
                  key={metric.key}
                  type='monotone'
                  dataKey={metric.key}
                  stroke={metric.color}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator='dot'
                    labelFormatter={label => {
                      const dataPoint = serverLoad.find(
                        d => d.timestamp === label,
                      )
                      return dataPoint
                        ? dataPoint.fullTimestamp
                        : `Time: ${label}`
                    }}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Server Uptime */}
      <Card>
        <CardHeader>
          <CardTitle>Server Uptime</CardTitle>
          <CardDescription>
            {serverUptime?.length > 1
              ? `${getTimeRange(serverUptime)} (from ${serverUptime.at(0)?.timestamp} to ${serverUptime.at(-1)?.timestamp})`
              : 'No data available'}
          </CardDescription>
        </CardHeader>
        <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
          <ChartContainer
            config={Object.fromEntries(
              uptimeMetrics.map(m => [
                m.key,
                { label: m.label, color: m.color },
              ]),
            )}
            className='aspect-auto h-[250px] w-full'>
            <LineChart data={processedUptimeData} syncId='cpu-metrics'>
              <CartesianGrid vertical={false} />
              <XAxis dataKey='timestamp' tickLine={false} axisLine={false} />
              <YAxis
                dataKey='uptimeSeconds'
                domain={[minUptime, maxUptime]}
                tickLine={false}
                axisLine={false}
                tickFormatter={value => secondsToUptimeFormat(value)}
              />
              {uptimeMetrics.map(metric => (
                <Line
                  key={metric.key}
                  type='monotone'
                  dataKey='uptimeSeconds'
                  stroke={metric.color}
                  strokeWidth={2}
                  dot={false}
                  name='uptime'
                />
              ))}
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator='line'
                    labelFormatter={label => {
                      const dataPoint = cpuUtilization.find(
                        d => d.timestamp === label,
                      )
                      return dataPoint
                        ? dataPoint.fullTimestamp
                        : `Time: ${label}`
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

export default CPUTab
