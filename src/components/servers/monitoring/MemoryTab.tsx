'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
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

const MemoryTab = ({
  memoryData,
  diskSpaceData,
  diskColors,
}: {
  memoryData: never[]
  diskSpaceData: never[]
  diskColors: string[]
}) => {
  return (
    <div className='grid grid-cols-1 gap-4'>
      {' '}
      <Card>
        <CardHeader>
          <CardTitle>Memory Usage Trend</CardTitle>
          <CardDescription>
            {getTimeRange(memoryData)} with detailed metrics{' '}
            {memoryData.length > 1
              ? ` - (from ${(memoryData as any).at(0)?.time} to ${(memoryData as any).at(-1)?.time})`
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
            className='aspect-auto h-[300px] w-full'>
            <AreaChart data={memoryData} accessibilityLayer>
              <defs>
                <linearGradient
                  id='fillMemoryDetailed'
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
                fill='url(#fillMemoryDetailed)'
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
        <Card className='overflow-hidden'>
          <CardHeader className='relative'>
            <CardTitle>Memory Allocation</CardTitle>
            <CardDescription>Current memory distribution</CardDescription>
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
                applications: {
                  label: 'Applications',
                  color: 'hsl(var(--chart-1))',
                },
                system: {
                  label: 'System',
                  color: 'hsl(var(--chart-2))',
                },
                cached: {
                  label: 'Cached',
                  color: 'hsl(var(--chart-3))',
                },
                free: {
                  label: 'Free',
                  color: 'hsl(var(--chart-4))',
                },
              }}
              className='aspect-auto h-[250px] w-full'>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Applications', value: 45 },
                    { name: 'System', value: 20 },
                    { name: 'Cached', value: 15 },
                    { name: 'Free', value: 20 },
                  ]}
                  cx='50%'
                  cy='50%'
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey='value'
                  nameKey='name'>
                  {diskSpaceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={diskColors[index % diskColors.length]}
                      stroke='transparent'
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={value => 'Memory Allocation'}
                    />
                  }
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='relative'>
            <CardTitle>Swap Usage</CardTitle>
            <CardDescription>Virtual memory utilization</CardDescription>
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
                  label: 'Swap Usage',
                  color: 'hsl(var(--chart-3))',
                },
              }}
              className='aspect-auto h-[250px] w-full'>
              <LineChart
                data={[
                  { time: '00:00', usage: 15 },
                  { time: '01:00', usage: 12 },
                  { time: '02:00', usage: 8 },
                  { time: '03:00', usage: 5 },
                  { time: '04:00', usage: 10 },
                  { time: '05:00', usage: 12 },
                  { time: '06:00', usage: 18 },
                  { time: '07:00', usage: 25 },
                  { time: '08:00', usage: 30 },
                  { time: '09:00', usage: 35 },
                  { time: '10:00', usage: 28 },
                  { time: '11:00', usage: 22 },
                  { time: '12:00', usage: 26 },
                ]}
                accessibilityLayer>
                <defs>
                  <linearGradient id='fillSwap' x1='0' y1='0' x2='0' y2='1'>
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
      </div>
    </div>
  )
}

export default MemoryTab
