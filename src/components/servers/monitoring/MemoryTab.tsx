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

const MemoryTab = ({
  memoryUsage,
  memoryAvailable,
  memorySomePressure,
  memorySomePressureStallTime,
}: {
  memoryUsage: any[]
  memoryAvailable: any[]
  memorySomePressure: any[]
  memorySomePressureStallTime: any[]
}) => {
  const memoryMetrics = [
    { key: 'buffers', label: 'Buffers', color: 'hsl(var(--chart-1))' },
    { key: 'cached', label: 'Cached', color: 'hsl(var(--chart-2))' },
    { key: 'free', label: 'Free', color: 'hsl(var(--chart-3))' },
    { key: 'used', label: 'Used', color: 'hsl(var(--chart-4))' },
  ]

  const availableMetrics = [
    { key: 'available', label: 'Available', color: 'hsl(var(--chart-7))' },
  ]

  const pressureMetrics = [
    { key: 'some10', label: 'Some 10', color: 'hsl(var(--chart-3))' },
    { key: 'some60', label: 'Some 60', color: 'hsl(var(--chart-4))' },
    { key: 'some300', label: 'Some 300', color: 'hsl(var(--chart-5))' },
  ]

  const stallTimeMetrics = [
    { key: 'stallTime', label: 'Stall Time', color: 'hsl(var(--chart-6))' },
  ]

  return (
    <div className='grid grid-cols-1 gap-4'>
      {/* Memory Usage (Stacked) */}
      <Card>
        <CardHeader>
          <CardTitle>Memory Usage</CardTitle>
          <CardDescription>
            {memoryUsage?.length > 1
              ? `${getTimeRange(memoryUsage)} (from ${memoryUsage.at(0)?.timestamp} to ${memoryUsage.at(-1)?.timestamp})`
              : 'No data available'}
          </CardDescription>
        </CardHeader>
        <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
          <ChartContainer
            config={Object.fromEntries(
              memoryMetrics.map(m => [
                m.key,
                { label: m.label, color: m.color },
              ]),
            )}
            className='aspect-auto h-[300px] w-full'>
            <AreaChart data={memoryUsage} syncId='memory-metrics'>
              <CartesianGrid vertical={false} />
              <XAxis dataKey='timestamp' tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              {memoryMetrics.map(metric => (
                <Area
                  key={metric.key}
                  type='monotone'
                  dataKey={metric.key}
                  stackId='1'
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

      {/* Memory Available */}
      <Card>
        <CardHeader>
          <CardTitle>Memory Available</CardTitle>
          <CardDescription>
            {memoryAvailable?.length > 1
              ? `${getTimeRange(memoryAvailable)} (from ${memoryAvailable.at(0)?.timestamp} to ${memoryAvailable.at(-1)?.timestamp})`
              : 'No data available'}
          </CardDescription>
        </CardHeader>
        <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
          <ChartContainer
            config={Object.fromEntries(
              availableMetrics.map(m => [
                m.key,
                { label: m.label, color: m.color },
              ]),
            )}
            className='aspect-auto h-[300px] w-full'>
            <LineChart data={memoryAvailable} syncId='memory-metrics'>
              <CartesianGrid vertical={false} />
              <XAxis dataKey='timestamp' tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              {availableMetrics.map(metric => (
                <Line
                  key={metric.key}
                  type='monotone'
                  dataKey='available' // Correct key mapping
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
                      const dataPoint = memoryAvailable.find(
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

      {/* Memory Some Pressure */}
      <Card>
        <CardHeader>
          <CardTitle>Memory Pressure</CardTitle>
          <CardDescription>
            {memorySomePressure?.length > 1
              ? `${getTimeRange(memorySomePressure)} (from ${memorySomePressure.at(0)?.timestamp} to ${memorySomePressure.at(-1)?.timestamp})`
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
            <LineChart data={memorySomePressure} syncId='memory-metrics'>
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
                    indicator='line'
                    labelFormatter={label => {
                      const dataPoint = memorySomePressure.find(
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

      {/* Memory Some Pressure Stall Time */}
      <Card>
        <CardHeader>
          <CardTitle>Memory Stall Time</CardTitle>
          <CardDescription>
            {memorySomePressureStallTime?.length > 1
              ? `${getTimeRange(memorySomePressureStallTime)} (from ${memorySomePressureStallTime.at(0)?.timestamp} to ${memorySomePressureStallTime.at(-1)?.timestamp})`
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
            <LineChart
              data={memorySomePressureStallTime}
              syncId='memory-metrics'>
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
                    indicator='line'
                    labelFormatter={label => {
                      const dataPoint = memorySomePressureStallTime.find(
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

export default MemoryTab
