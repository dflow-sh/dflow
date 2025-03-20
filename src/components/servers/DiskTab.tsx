'use client'

import {
  Bar,
  BarChart,
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

const DiskTab = ({
  diskIOData,
  diskVolumesData,
  diskSpaceData,
  diskColors,
}: {
  diskIOData: never[]
  diskVolumesData: never[]
  diskSpaceData: never[]
  diskColors: string[]
}) => {
  return (
    <div className='grid grid-cols-1 gap-4'>
      <Card className='overflow-hidden'>
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

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <Card className='overflow-hidden'>
          <CardHeader className='relative'>
            <CardTitle>Disk Usage</CardTitle>
            <CardDescription>Storage allocation</CardDescription>
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
                system: {
                  label: 'System',
                  color: 'hsl(var(--chart-1))',
                },
                applications: {
                  label: 'Applications',
                  color: 'hsl(var(--chart-2))',
                },
                userData: {
                  label: 'User Data',
                  color: 'hsl(var(--chart-3))',
                },
                freeSpace: {
                  label: 'Free Space',
                  color: 'hsl(var(--chart-4))',
                },
              }}
              className='aspect-auto h-[250px] w-full'>
              <PieChart>
                <Pie
                  data={diskSpaceData}
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
                      labelFormatter={value => 'Disk Usage'}
                    />
                  }
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className='overflow-hidden'>
          <CardHeader className='relative'>
            <CardTitle>Disk Volumes</CardTitle>
            <CardDescription>Space usage by volume</CardDescription>
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
                used: {
                  label: 'Used',
                  color: 'hsl(var(--chart-1))',
                },
                total: {
                  label: 'Total',
                  color: 'hsl(var(--chart-2))',
                },
              }}
              className='aspect-auto h-[250px] w-full'>
              <BarChart
                data={diskVolumesData}
                layout='vertical'
                accessibilityLayer>
                <defs>
                  <linearGradient id='fillUsed' x1='0' y1='0' x2='1' y2='0'>
                    <stop
                      offset='5%'
                      stopColor='var(--color-used)'
                      stopOpacity={0.8}
                    />
                    <stop
                      offset='95%'
                      stopColor='var(--color-used)'
                      stopOpacity={0.6}
                    />
                  </linearGradient>
                  <linearGradient id='fillTotal' x1='0' y1='0' x2='1' y2='0'>
                    <stop
                      offset='5%'
                      stopColor='var(--color-total)'
                      stopOpacity={0.8}
                    />
                    <stop
                      offset='95%'
                      stopColor='var(--color-total)'
                      stopOpacity={0.6}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid horizontal={false} />
                <XAxis
                  type='number'
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
                  dataKey='used'
                  stackId='a'
                  fill='url(#fillUsed)'
                  radius={[4, 0, 0, 4]}
                />
                <Bar
                  dataKey='total'
                  stackId='a'
                  fill='url(#fillTotal)'
                  radius={[0, 4, 4, 0]}
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

        {/* <Card className='overflow-hidden'>
              <CardHeader>
                <CardTitle>Inode Usage</CardTitle>
                <CardDescription>File system metadata usage</CardDescription>
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
                    used: {
                      label: 'Used',
                      color: 'hsl(var(--chart-1))',
                    },
                  }}
                  className='aspect-auto h-[250px] w-full'>
                  <BarChart data={inodeUsageData} accessibilityLayer>
                    <defs>
                      <linearGradient
                        id='fillInodeUsed'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'>
                        <stop
                          offset='5%'
                          stopColor='var(--color-used)'
                          stopOpacity={0.8}
                        />
                        <stop
                          offset='95%'
                          stopColor='var(--color-used)'
                          stopOpacity={0.6}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey='name'
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
                    <Bar
                      dataKey='used'
                      fill='url(#fillInodeUsed)'
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
            </Card> */}
      </div>
    </div>
  )
}

export default DiskTab
