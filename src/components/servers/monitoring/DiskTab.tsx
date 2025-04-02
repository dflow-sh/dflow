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

import { getTimeRange } from './getTimeRange'

const DiskTab = ({
  diskSpace,
  diskIO,
  systemIO,
}: {
  diskSpace: any[]
  diskIO: any[]
  systemIO: any[]
}) => {
  const diskIOMetrics = [
    { key: 'reads', label: 'Reads', color: 'hsl(var(--chart-1))' },
    { key: 'writes', label: 'Writes', color: 'hsl(var(--chart-2))' },
  ]

  const systemIOMetrics = [
    { key: 'reads', label: 'Reads', color: 'hsl(var(--chart-3))' },
    { key: 'writes', label: 'Writes', color: 'hsl(var(--chart-4))' },
  ]

  const diskSpaceMetrics = [
    { key: 'avail', label: 'Avail', color: 'hsl(var(--chart-2))' },
    { key: 'used', label: 'Used', color: 'hsl(var(--chart-1))' },
    {
      key: 'reserved for root',
      label: 'Reserved for root',
      color: 'hsl(var(--chart-3))',
    },
  ]

  console.log({ diskSpace })

  return (
    <div className='grid grid-cols-1 gap-4'>
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
        <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
          <ChartContainer
            config={Object.fromEntries(
              diskIOMetrics.map(m => [
                m.key,
                { label: m.label, color: m.color },
              ]),
            )}
            className='aspect-auto h-[300px] w-full'>
            <LineChart data={diskIO} syncId='disk-metrics'>
              <CartesianGrid vertical={false} />
              <XAxis dataKey='timestamp' tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              {diskIOMetrics.map(metric => (
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

      {/* Disk Space (Stacked Graph) */}
      <Card>
        <CardHeader>
          <CardTitle>Disk Space</CardTitle>
          <CardDescription>
            {diskSpace?.length > 1
              ? `${getTimeRange(diskSpace)} (from ${diskSpace.at(0)?.timestamp} to ${diskSpace.at(-1)?.timestamp})`
              : 'No data available'}
          </CardDescription>
        </CardHeader>
        <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
          <ChartContainer
            config={Object.fromEntries(
              diskSpaceMetrics.map(m => [
                m.key,
                { label: m.label, color: m.color },
              ]),
            )}
            className='aspect-auto h-[300px] w-full'>
            <AreaChart
              data={diskSpace}
              syncId='disk-metrics'
              stackOffset='expand'>
              <CartesianGrid vertical={false} />
              <XAxis dataKey='timestamp' tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              {diskSpaceMetrics.map(metric => (
                <Area
                  key={metric.key}
                  type='monotone'
                  dataKey={metric.key}
                  stackId='1'
                  stroke={metric.color}
                  fill={metric.color}
                />
              ))}
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator='dot'
                    labelFormatter={label => {
                      const dataPoint = diskSpace.find(
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

      {/* System I/O */}
      <Card>
        <CardHeader>
          <CardTitle>System I/O</CardTitle>
          <CardDescription>
            {systemIO?.length > 1
              ? `${getTimeRange(systemIO)} (from ${systemIO.at(0)?.timestamp} to ${systemIO.at(-1)?.timestamp})`
              : 'No data available'}
          </CardDescription>
        </CardHeader>
        <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
          <ChartContainer
            config={Object.fromEntries(
              systemIOMetrics.map(m => [
                m.key,
                { label: m.label, color: m.color },
              ]),
            )}
            className='aspect-auto h-[300px] w-full'>
            <LineChart data={systemIO} syncId='disk-metrics'>
              <CartesianGrid vertical={false} />
              <XAxis dataKey='timestamp' tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              {systemIOMetrics.map(metric => (
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
                      const dataPoint = systemIO.find(
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

export default DiskTab
