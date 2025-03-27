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

const RequestsTab = ({
  requestData,
  responseTimeData,
}: {
  requestData: never[]
  responseTimeData: never[]
}) => {
  return (
    <div>
      <div className='absolute inset-0 z-10 flex items-center justify-center bg-background/40 backdrop-blur-[2px]'>
        <div className='flex flex-col items-center gap-2 rounded-lg bg-secondary px-8 py-6 shadow-lg'>
          <div className='text-xl font-semibold'>Coming Soon</div>
          <p className='text-sm text-muted-foreground'>
            This feature is under development
          </p>
        </div>
      </div>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Request Volume</CardTitle>
            <CardDescription>Successful vs Error requests</CardDescription>
          </CardHeader>
          <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
            <ChartContainer
              config={{
                success: {
                  label: 'Success',
                  color: 'hsl(var(--chart-2))',
                },
                error: {
                  label: 'Error',
                  color: 'hsl(var(--chart-3))',
                },
              }}
              className='aspect-auto h-[250px] w-full'>
              <BarChart data={requestData} accessibilityLayer>
                <defs>
                  <linearGradient id='fillSuccess' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='5%'
                      stopColor='var(--color-success)'
                      stopOpacity={0.8}
                    />
                    <stop
                      offset='95%'
                      stopColor='var(--color-success)'
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id='fillError' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='5%'
                      stopColor='var(--color-error)'
                      stopOpacity={0.8}
                    />
                    <stop
                      offset='95%'
                      stopColor='var(--color-error)'
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
                  dataKey='success'
                  stackId='a'
                  fill='url(#fillSuccess)'
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey='error'
                  stackId='a'
                  fill='url(#fillError)'
                  radius={[0, 0, 4, 4]}
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

        <Card>
          <CardHeader>
            <CardTitle>Response Time</CardTitle>
            <CardDescription>Average response time (ms)</CardDescription>
          </CardHeader>
          <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
            <ChartContainer
              config={{
                responseTime: {
                  label: 'Response Time',
                  color: 'hsl(var(--chart-1))',
                },
              }}
              className='aspect-auto h-[250px] w-full'>
              <LineChart data={responseTimeData} accessibilityLayer>
                <defs>
                  <linearGradient
                    id='fillResponseTime'
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'>
                    <stop
                      offset='5%'
                      stopColor='var(--color-responseTime)'
                      stopOpacity={0.8}
                    />
                    <stop
                      offset='95%'
                      stopColor='var(--color-responseTime)'
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
                  dataKey='responseTime'
                  stroke='var(--color-responseTime)'
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
            <CardTitle>Request Status Codes</CardTitle>
            <CardDescription>Distribution by HTTP status</CardDescription>
          </CardHeader>

          <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
            <ChartContainer
              config={{
                ok: {
                  label: '200 OK',
                  color: 'hsl(var(--chart-1))',
                },
                redirect: {
                  label: '301/302 Redirect',
                  color: 'hsl(var(--chart-2))',
                },
                notFound: {
                  label: '404 Not Found',
                  color: 'hsl(var(--chart-3))',
                },
                serverError: {
                  label: '500 Server Error',
                  color: 'hsl(var(--chart-4))',
                },
              }}
              className='aspect-auto h-[250px] w-full'>
              <PieChart>
                <Pie
                  data={[
                    { name: '200 OK', value: 82 },
                    { name: '301/302 Redirect', value: 8 },
                    { name: '404 Not Found', value: 6 },
                    { name: '500 Server Error', value: 4 },
                  ]}
                  cx='50%'
                  cy='50%'
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey='value'
                  nameKey='name'>
                  <Cell fill='var(--color-ok)' stroke='transparent' />
                  <Cell fill='var(--color-redirect)' stroke='transparent' />
                  <Cell fill='var(--color-notFound)' stroke='transparent' />
                  <Cell fill='var(--color-serverError)' stroke='transparent' />
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={value => 'HTTP Status Codes'}
                    />
                  }
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Latency</CardTitle>
            <CardDescription>
              Request processing time distribution
            </CardDescription>
          </CardHeader>
          <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
            <ChartContainer
              config={{
                count: {
                  label: 'Request Count',
                  color: 'hsl(var(--chart-1))',
                },
              }}
              className='aspect-auto h-[250px] w-full'>
              <BarChart
                data={[
                  { range: '0-100ms', count: 45 },
                  { range: '100-200ms', count: 30 },
                  { range: '200-300ms', count: 15 },
                  { range: '300-500ms', count: 8 },
                  { range: '500ms+', count: 2 },
                ]}
                accessibilityLayer>
                <defs>
                  <linearGradient id='fillCount' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='5%'
                      stopColor='var(--color-count)'
                      stopOpacity={0.8}
                    />
                    <stop
                      offset='95%'
                      stopColor='var(--color-count)'
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey='range'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <Bar
                  dataKey='count'
                  fill='url(#fillCount)'
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

export default RequestsTab
