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
} from '@dflow/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@dflow/components/ui/chart'

import { getTimeRange } from './getTimeRange'

const OverviewTab = ({
  cpuUtilization,
  memoryUsage,
  networkTraffic,
  diskIO,
}: {
  cpuUtilization: any[]
  memoryUsage: any[]
  networkTraffic: any[]
  diskIO: any[]
}) => {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      {/* CPU Usage */}
      <Card>
        <CardHeader>
          <CardTitle>CPU Usage Trend</CardTitle>
          <CardDescription>
            {cpuUtilization?.length > 1
              ? `${getTimeRange(cpuUtilization)} (from ${cpuUtilization.at(0)?.timestamp} to ${cpuUtilization.at(-1)?.timestamp})`
              : 'No data available'}
          </CardDescription>
        </CardHeader>
        <CardContent className='pt-4 pr-2 pl-0 sm:pt-6 sm:pr-6'>
          <ChartContainer
            config={{ usage: { label: 'Usage', color: 'var(--chart-1)' } }}
            className='aspect-auto h-[250px] w-full'>
            <LineChart
              data={cpuUtilization}
              syncId='overview-metrics'
              accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey='timestamp' tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
              <Line
                type='monotone'
                dataKey='usage'
                stroke='var(--chart-1)'
                strokeWidth={2}
                dot={false}
              />
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

      {/* Memory Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Memory Usage Trend</CardTitle>
          <CardDescription>
            {memoryUsage?.length > 1
              ? `${getTimeRange(memoryUsage)} (from ${memoryUsage.at(0)?.timestamp} to ${memoryUsage.at(-1)?.timestamp})`
              : 'No data available'}
          </CardDescription>
        </CardHeader>
        <CardContent className='pt-4 pr-2 pl-0 sm:pt-6 sm:pr-6'>
          <ChartContainer
            config={{ usage: { label: 'Usage', color: 'var(--chart-2)' } }}
            className='aspect-auto h-[250px] w-full'>
            <AreaChart
              data={memoryUsage}
              syncId='overview-metrics'
              accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey='timestamp' tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
              <Area
                type='monotone'
                dataKey='usage'
                stroke='var(--chart-2)'
                fill='var(--chart-2)'
                strokeWidth={2}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator='dot'
                    labelFormatter={label => {
                      const dataPoint = memoryUsage.find(
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
        <CardContent className='pt-4 pr-2 pl-0 sm:pt-6 sm:pr-6'>
          <ChartContainer
            config={{
              incoming: { label: 'Incoming', color: 'var(--chart-3)' },
              outgoing: { label: 'Outgoing', color: 'var(--chart-4)' },
            }}
            className='aspect-auto h-[250px] w-full'>
            <LineChart
              data={networkTraffic}
              syncId='overview-metrics'
              accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey='timestamp' tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Line
                type='monotone'
                dataKey='incoming'
                stroke='var(--chart-3)'
                strokeWidth={2}
                dot={false}
              />
              <Line
                type='monotone'
                dataKey='outgoing'
                stroke='var(--chart-4)'
                strokeWidth={2}
                dot={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator='dot'
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

      {/* Disk I/O */}
      <Card>
        <CardHeader>
          <CardTitle>Disk I/O</CardTitle>
          <CardDescription>
            {diskIO?.length > 1
              ? `${getTimeRange(diskIO)} (from ${diskIO.at(0)?.timestamp} to ${diskIO.at(-1)?.timestamp})`
              : 'No data available'}
          </CardDescription>
        </CardHeader>
        <CardContent className='pt-4 pr-2 pl-0 sm:pt-6 sm:pr-6'>
          <ChartContainer
            config={{
              reads: { label: 'Reads', color: 'var(--chart-1)' },
              writes: { label: 'Writes', color: 'var(--chart-2)' },
            }}
            className='aspect-auto h-[250px] w-full'>
            <LineChart
              data={diskIO}
              syncId='overview-metrics'
              accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey='timestamp' tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Line
                type='monotone'
                dataKey='reads'
                stroke='var(--chart-1)'
                strokeWidth={2}
                dot={false}
              />
              <Line
                type='monotone'
                dataKey='writes'
                stroke='var(--chart-2)'
                strokeWidth={2}
                dot={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator='dot'
                    labelFormatter={label => {
                      const dataPoint = diskIO.find(d => d.timestamp === label)
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

export default OverviewTab
