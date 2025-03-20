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

const NetworkTab = ({ networkData }: { networkData: never[] }) => {
  return (
    <div className='grid grid-cols-1 gap-4'>
      <Card>
        <CardHeader>
          <CardTitle>Network Traffic</CardTitle>
          <CardDescription>Bandwidth utilization over time</CardDescription>
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
            className='aspect-auto h-[300px] w-full'>
            <AreaChart data={networkData} accessibilityLayer>
              <defs>
                <linearGradient
                  id='fillIncomingDetailed'
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'>
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
                <linearGradient
                  id='fillOutgoingDetailed'
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'>
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
              <Area
                type='monotone'
                dataKey='incoming'
                stroke='var(--color-incoming)'
                fill='url(#fillIncomingDetailed)'
                strokeWidth={2}
              />
              <Area
                type='monotone'
                dataKey='outgoing'
                stroke='var(--color-outgoing)'
                fill='url(#fillOutgoingDetailed)'
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
            <CardTitle>Network Packets</CardTitle>
            <CardDescription>Packet transmission statistics</CardDescription>
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
                received: {
                  label: 'Received',
                  color: 'hsl(var(--chart-1))',
                },
                sent: {
                  label: 'Sent',
                  color: 'hsl(var(--chart-2))',
                },
              }}
              className='aspect-auto h-[250px] w-full'>
              <BarChart
                data={[
                  { time: '00:00', received: 15000, sent: 8000 },
                  { time: '02:00', received: 12000, sent: 6500 },
                  { time: '04:00', received: 10000, sent: 5000 },
                  { time: '06:00', received: 18000, sent: 9500 },
                  { time: '08:00', received: 25000, sent: 15000 },
                  { time: '10:00', received: 22000, sent: 12000 },
                  { time: '12:00', received: 28000, sent: 14000 },
                ]}
                accessibilityLayer>
                <defs>
                  <linearGradient id='fillReceived' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='5%'
                      stopColor='var(--color-received)'
                      stopOpacity={0.8}
                    />
                    <stop
                      offset='95%'
                      stopColor='var(--color-received)'
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id='fillSent' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='5%'
                      stopColor='var(--color-sent)'
                      stopOpacity={0.8}
                    />
                    <stop
                      offset='95%'
                      stopColor='var(--color-sent)'
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
                  dataKey='received'
                  fill='url(#fillReceived)'
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey='sent'
                  fill='url(#fillSent)'
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
            <CardTitle>Network Errors</CardTitle>
            <CardDescription>Error rates and types</CardDescription>
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
                dropped: {
                  label: 'Dropped',
                  color: 'hsl(var(--chart-3))',
                },
                errors: {
                  label: 'Errors',
                  color: 'hsl(var(--chart-4))',
                },
              }}
              className='aspect-auto h-[250px] w-full'>
              <LineChart
                data={[
                  { time: '00:00', dropped: 0.2, errors: 0.1 },
                  { time: '01:00', dropped: 0.1, errors: 0.0 },
                  { time: '02:00', dropped: 0.1, errors: 0.1 },
                  { time: '03:00', dropped: 0.0, errors: 0.0 },
                  { time: '04:00', dropped: 0.1, errors: 0.0 },
                  { time: '05:00', dropped: 0.2, errors: 0.1 },
                  { time: '06:00', dropped: 0.3, errors: 0.2 },
                  { time: '07:00', dropped: 0.4, errors: 0.2 },
                  { time: '08:00', dropped: 0.5, errors: 0.3 },
                  { time: '09:00', dropped: 0.4, errors: 0.2 },
                  { time: '10:00', dropped: 0.3, errors: 0.1 },
                  { time: '11:00', dropped: 0.2, errors: 0.1 },
                  { time: '12:00', dropped: 0.3, errors: 0.2 },
                ]}
                accessibilityLayer>
                <defs>
                  <linearGradient id='fillDropped' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='5%'
                      stopColor='var(--color-dropped)'
                      stopOpacity={0.8}
                    />
                    <stop
                      offset='95%'
                      stopColor='var(--color-dropped)'
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id='fillErrors' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='5%'
                      stopColor='var(--color-errors)'
                      stopOpacity={0.8}
                    />
                    <stop
                      offset='95%'
                      stopColor='var(--color-errors)'
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
                  dataKey='dropped'
                  stroke='var(--color-dropped)'
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line
                  type='monotone'
                  dataKey='errors'
                  stroke='var(--color-errors)'
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

export default NetworkTab
