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

const OverviewTab = ({
  cpuData,
  memoryData,
  networkData,
  diskIOData,
}: {
  cpuData: never[]
  memoryData: never[]
  networkData: never[]
  diskIOData: never[]
}) => {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle>CPU Usage Trend</CardTitle>
          <CardDescription>
            {cpuData.length > 1
              ? `${getTimeRange(cpuData)} (from ${(cpuData as any).at(0)?.time} to ${(cpuData as any).at(-1)?.time})`
              : 'No data available'}
          </CardDescription>
        </CardHeader>
        <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
          <ChartContainer
            config={{
              usage: {
                label: 'Usage',
                color: 'hsl(var(--chart-1))',
              },
            }}
            className='aspect-auto h-[250px] w-full'>
            <LineChart data={cpuData} accessibilityLayer>
              <defs>
                <linearGradient id='fillCpu' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='5%'
                    stopColor='var(--color-usage)'
                    stopOpacity={0.8}
                  />
                  <stop
                    offset='95%'
                    stopColor='var(--color-usage)'
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='time'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <Line
                type='monotone'
                dataKey='usage'
                stroke='var(--color-usage)'
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator='dot' />}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Memory Usage Trend</CardTitle>
          <CardDescription>
            {memoryData.length > 1
              ? `${getTimeRange(memoryData)} (from ${(memoryData as any).at(0)?.time} to ${(memoryData as any).at(-1)?.time})`
              : 'No data available'}
          </CardDescription>
        </CardHeader>
        <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
          <ChartContainer
            config={{
              usage: {
                label: 'Usage',
                color: 'hsl(var(--chart-2))',
              },
            }}
            className='aspect-auto h-[250px] w-full'>
            <AreaChart data={memoryData} accessibilityLayer>
              <defs>
                <linearGradient id='fillMemory' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='5%'
                    stopColor='var(--color-usage)'
                    stopOpacity={0.8}
                  />
                  <stop
                    offset='95%'
                    stopColor='var(--color-usage)'
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='time'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <Area
                type='monotone'
                dataKey='usage'
                stroke='var(--color-usage)'
                fill='url(#fillMemory)'
                strokeWidth={2}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator='dot' />}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Network Traffic</CardTitle>
          <CardDescription>
            {networkData.length > 1
              ? `${getTimeRange(networkData)} (from ${(networkData as any).at(0)?.time} to ${(networkData as any).at(-1)?.time})`
              : 'No data available'}
          </CardDescription>
        </CardHeader>
        <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
          <ChartContainer
            config={{
              incoming: {
                label: 'Incoming',
                color: 'hsl(var(--chart-1))',
              },
              outgoing: {
                label: 'Outgoing',
                color: 'hsl(var(--chart-2))',
              },
            }}
            className='aspect-auto h-[250px] w-full'>
            <LineChart data={networkData} accessibilityLayer>
              <defs>
                <linearGradient id='fillIncoming' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='5%'
                    stopColor='var(--color-incoming)'
                    stopOpacity={0.8}
                  />
                  <stop
                    offset='95%'
                    stopColor='var(--color-incoming)'
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id='fillOutgoing' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='5%'
                    stopColor='var(--color-outgoing)'
                    stopOpacity={0.8}
                  />
                  <stop
                    offset='95%'
                    stopColor='var(--color-outgoing)'
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='time'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <Line
                type='monotone'
                dataKey='incoming'
                stroke='var(--color-incoming)'
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line
                type='monotone'
                dataKey='outgoing'
                stroke='var(--color-outgoing)'
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator='dot' />}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Disk I/O</CardTitle>
          <CardDescription>
            Read/Write operations -{' '}
            {diskIOData.length > 1
              ? `${getTimeRange(diskIOData)} (from ${(diskIOData as any).at(0)?.time} to ${(diskIOData as any).at(-1)?.time})`
              : 'No data available'}
          </CardDescription>
        </CardHeader>
        <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
          <ChartContainer
            config={{
              reads: {
                label: 'Reads',
                color: 'hsl(var(--chart-1))',
              },
              writes: {
                label: 'Writes',
                color: 'hsl(var(--chart-2))',
              },
            }}
            className='aspect-auto h-[250px] w-full'>
            <LineChart data={diskIOData} accessibilityLayer>
              <defs>
                <linearGradient id='fillRead' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='5%'
                    stopColor='var(--color-reads)'
                    stopOpacity={0.8}
                  />
                  <stop
                    offset='95%'
                    stopColor='var(--color-reads)'
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id='fillWrite' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='5%'
                    stopColor='var(--color-writes)'
                    stopOpacity={0.8}
                  />
                  <stop
                    offset='95%'
                    stopColor='var(--color-writes)'
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='time'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <Line
                type='monotone'
                dataKey='reads'
                stroke='var(--color-reads)'
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line
                type='monotone'
                dataKey='writes'
                stroke='var(--color-writes)'
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator='dot' />}
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
