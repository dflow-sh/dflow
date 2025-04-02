'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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

import { getTimeRange } from './getTimeRange'

const NetworkTab = ({
  networkBandwidth,
  networkTraffic,
  networkPackets,
  networkErrors,
}: {
  networkBandwidth: any[]
  networkTraffic: any[]
  networkPackets: any[]
  networkErrors: any[]
}) => {
  const bandwidthMetrics = [
    { key: 'incoming', label: 'Incoming', color: 'hsl(var(--chart-1))' },
    { key: 'outgoing', label: 'Outgoing', color: 'hsl(var(--chart-2))' },
  ]

  const trafficMetrics = [
    { key: 'incoming', label: 'Incoming', color: 'hsl(var(--chart-3))' },
    { key: 'outgoing', label: 'Outgoing', color: 'hsl(var(--chart-4))' },
  ]

  const packetMetrics = [
    { key: 'received', label: 'Received', color: 'hsl(var(--chart-5))' },
    { key: 'sent', label: 'Sent', color: 'hsl(var(--chart-6))' },
    { key: 'dropped', label: 'Dropped', color: 'hsl(var(--chart-7))' },
  ]

  const errorMetrics = [
    { key: 'inbound', label: 'Inbound', color: 'hsl(var(--chart-8))' },
    { key: 'outbound', label: 'Outbound', color: 'hsl(var(--chart-9))' },
  ]

  return (
    <div className='grid grid-cols-1 gap-4'>
      {/* Network Bandwidth */}
      <Card>
        <CardHeader>
          <CardTitle>Network Bandwidth</CardTitle>
          <CardDescription>
            {networkBandwidth?.length > 1
              ? `${getTimeRange(networkBandwidth)} (from ${networkBandwidth.at(0)?.timestamp} to ${networkBandwidth.at(-1)?.timestamp})`
              : 'No data available'}
          </CardDescription>
        </CardHeader>
        <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
          <ChartContainer
            config={Object.fromEntries(
              bandwidthMetrics.map(m => [
                m.key,
                { label: m.label, color: m.color },
              ]),
            )}
            className='aspect-auto h-[300px] w-full'>
            <AreaChart
              data={networkBandwidth}
              syncId='network-metrics'
              accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='time'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              {bandwidthMetrics.map(metric => (
                <Area
                  key={metric.key}
                  type='monotone'
                  dataKey={metric.key}
                  stroke={metric.color}
                  fill={metric.color}
                  strokeWidth={2}
                />
              ))}
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator='line'
                    labelFormatter={label => {
                      const dataPoint = networkBandwidth.find(
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
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Network Traffic */}
      <Card>
        <CardHeader>
          <CardTitle>Network Traffic</CardTitle>
          <CardDescription>
            {networkTraffic?.length > 1
              ? `${getTimeRange(networkTraffic)} (from ${networkTraffic.at(0)?.timestamp} to ${networkTraffic.at(-1)?.timestamp})`
              : 'No data available'}
          </CardDescription>
        </CardHeader>
        <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
          <ChartContainer
            config={Object.fromEntries(
              trafficMetrics.map(m => [
                m.key,
                { label: m.label, color: m.color },
              ]),
            )}
            className='aspect-auto h-[300px] w-full'>
            <LineChart
              data={networkTraffic}
              syncId='network-metrics'
              accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='time'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              {trafficMetrics.map(metric => (
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
                    indicator='line'
                    labelFormatter={label => {
                      const dataPoint = networkTraffic.find(
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

      {/* Network Packets */}
      <Card>
        <CardHeader>
          <CardTitle>Network Packets</CardTitle>
          <CardDescription>
            {networkPackets?.length > 1
              ? `${getTimeRange(networkPackets)} (from ${networkPackets.at(0)?.timestamp} to ${networkPackets.at(-1)?.timestamp})`
              : 'No data available'}
          </CardDescription>
        </CardHeader>
        <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
          <ChartContainer
            config={Object.fromEntries(
              packetMetrics.map(m => [
                m.key,
                { label: m.label, color: m.color },
              ]),
            )}
            className='aspect-auto h-[250px] w-full'>
            <BarChart
              data={networkPackets}
              syncId='network-metrics'
              accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='time'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              {packetMetrics.map(metric => (
                <Bar
                  key={metric.key}
                  dataKey={metric.key}
                  fill={metric.color}
                  radius={[4, 4, 0, 0]}
                />
              ))}
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator='line'
                    labelFormatter={label => {
                      const dataPoint = networkPackets.find(
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
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Network Errors */}
      <Card>
        <CardHeader>
          <CardTitle>Network Errors</CardTitle>
          <CardDescription>
            {networkErrors?.length > 1
              ? `${getTimeRange(networkErrors)} (from ${networkErrors.at(0)?.timestamp} to ${networkErrors.at(-1)?.timestamp})`
              : 'No data available'}
          </CardDescription>
        </CardHeader>
        <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
          <ChartContainer
            config={Object.fromEntries(
              errorMetrics.map(m => [
                m.key,
                { label: m.label, color: m.color },
              ]),
            )}
            className='aspect-auto h-[250px] w-full'>
            <LineChart
              data={networkErrors}
              syncId='network-metrics'
              accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='time'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              {errorMetrics.map(metric => (
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
                    indicator='line'
                    labelFormatter={label => {
                      const dataPoint = networkErrors.find(
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

export default NetworkTab
