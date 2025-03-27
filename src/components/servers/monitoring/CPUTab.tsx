'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'

import { Badge } from '@/components/ui/badge'
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

const CPUTab = ({
  cpuData,
  serverLoadData,
  cpuUsageDistributionData,
}: {
  cpuData: never[]
  serverLoadData: never[]
  cpuUsageDistributionData: never[]
}) => {
  return (
    <div className='grid grid-cols-1 gap-4'>
      <Card>
        <CardHeader>
          <CardTitle>CPU Usage Trend</CardTitle>
          <CardDescription>
            {cpuData.length > 1
              ? `${getTimeRange(cpuData)} with detailed metrics - (from ${(cpuData as any).at(0)?.time} to ${(cpuData as any).at(-1)?.time})`
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
            className='aspect-auto h-[300px] w-full'>
            <AreaChart data={cpuData} accessibilityLayer>
              <defs>
                <linearGradient
                  id='fillCpuDetailed'
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'>
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
                fill='url(#fillCpuDetailed)'
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

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>CPU Load Average</CardTitle>
            <CardDescription>
              System load over time -{' '}
              {serverLoadData.length > 1
                ? `${getTimeRange(serverLoadData)} (from ${(serverLoadData as any).at(0)?.time} to ${(serverLoadData as any).at(-1)?.time})`
                : 'No data available'}
            </CardDescription>
          </CardHeader>
          <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
            <ChartContainer
              config={{
                load: {
                  label: 'System Load',
                  color: 'hsl(var(--chart-1))',
                },
              }}
              className='aspect-auto h-[250px] w-full'>
              <BarChart data={serverLoadData} accessibilityLayer>
                <defs>
                  <linearGradient id='fillLoad' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='5%'
                      stopColor='var(--color-load)'
                      stopOpacity={0.8}
                    />
                    <stop
                      offset='95%'
                      stopColor='var(--color-load)'
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
                <Bar
                  dataKey='load'
                  fill='url(#fillLoad)'
                  radius={[4, 4, 0, 0]}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator='dot' />}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className='overflow-hidden'>
          <CardHeader className='relative'>
            <CardTitle>CPU Usage Distribution</CardTitle>
            <CardDescription>Current utilization by core</CardDescription>
            <Badge
              variant='secondary'
              className='absolute right-3 top-2 border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20'>
              Coming Soon
            </Badge>
          </CardHeader>
          <CardContent className='relative pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
            <div className='absolute inset-0 z-10 flex items-center justify-center bg-background/40 backdrop-blur-[2px]'>
              <div className='flex flex-col items-center gap-2 rounded-lg bg-secondary px-8 py-6 shadow-lg'>
                <div className='text-xl font-semibold'>Coming Soon</div>
                <p className='text-sm text-muted-foreground'>
                  This feature is under development
                </p>
              </div>
            </div>

            <ChartContainer
              config={{
                usage: {
                  label: 'Usage',
                  color: 'hsl(var(--chart-1))',
                },
              }}
              className='pointer-events-none h-[250px] w-full opacity-40'>
              <BarChart
                data={cpuUsageDistributionData}
                layout='vertical'
                accessibilityLayer>
                <defs>
                  <linearGradient
                    id='fillCoreUsage'
                    x1='0'
                    y1='0'
                    x2='1'
                    y2='0'>
                    <stop
                      offset='5%'
                      stopColor='var(--color-usage)'
                      stopOpacity={0.8}
                    />
                    <stop
                      offset='95%'
                      stopColor='var(--color-usage)'
                      stopOpacity={0.6}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid horizontal={false} />
                <XAxis
                  type='number'
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  type='category'
                  dataKey='name'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <Bar
                  dataKey='usage'
                  fill='url(#fillCoreUsage)'
                  radius={[4, 4, 0, 0]}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator='dot' />}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CPUTab
