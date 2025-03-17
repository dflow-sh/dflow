'use client'

import { Button } from '../ui/button'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Cpu,
  HardDrive,
  Server,
  Wifi,
} from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Area,
  AreaChart,
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
import { toast } from 'sonner'

import { uninstallNetdataAction } from '@/actions/netdata'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ServerType } from '@/payload-types-overrides'

const Monitoring = ({ server }: { server: ServerType }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()

  // Sample data - in a real app this would come from your API
  const serverStatus = {
    status: 'online',
    uptime: '99.98%',
    lastIncident: '23 days ago',
    activeAlerts: 2,
  }

  const cpuData = [
    { time: '00:00', usage: 45 },
    { time: '01:00', usage: 32 },
    { time: '02:00', usage: 28 },
    { time: '03:00', usage: 25 },
    { time: '04:00', usage: 30 },
    { time: '05:00', usage: 42 },
    { time: '06:00', usage: 68 },
    { time: '07:00', usage: 75 },
    { time: '08:00', usage: 80 },
    { time: '09:00', usage: 85 },
    { time: '10:00', usage: 78 },
    { time: '11:00', usage: 72 },
    { time: '12:00', usage: 86 },
  ]

  const memoryData = [
    { time: '00:00', usage: 55 },
    { time: '01:00', usage: 52 },
    { time: '02:00', usage: 48 },
    { time: '03:00', usage: 45 },
    { time: '04:00', usage: 50 },
    { time: '05:00', usage: 52 },
    { time: '06:00', usage: 58 },
    { time: '07:00', usage: 65 },
    { time: '08:00', usage: 70 },
    { time: '09:00', usage: 75 },
    { time: '10:00', usage: 78 },
    { time: '11:00', usage: 82 },
    { time: '12:00', usage: 76 },
  ]

  const networkData = [
    { time: '00:00', incoming: 3.2, outgoing: 1.8 },
    { time: '01:00', incoming: 2.8, outgoing: 1.5 },
    { time: '02:00', incoming: 2.2, outgoing: 1.2 },
    { time: '03:00', incoming: 1.8, outgoing: 0.9 },
    { time: '04:00', incoming: 2.0, outgoing: 1.0 },
    { time: '05:00', incoming: 2.5, outgoing: 1.3 },
    { time: '06:00', incoming: 4.2, outgoing: 2.1 },
    { time: '07:00', incoming: 5.8, outgoing: 3.2 },
    { time: '08:00', incoming: 7.5, outgoing: 4.8 },
    { time: '09:00', incoming: 8.2, outgoing: 5.5 },
    { time: '10:00', incoming: 7.8, outgoing: 5.2 },
    { time: '11:00', incoming: 6.2, outgoing: 4.5 },
    { time: '12:00', incoming: 8.5, outgoing: 6.2 },
  ]

  const diskUsageData = [
    { name: 'System', value: 12 },
    { name: 'Applications', value: 25 },
    { name: 'User Data', value: 45 },
    { name: 'Free Space', value: 18 },
  ]

  const serverLoadData = [
    { time: '00:00', load: 2.4 },
    { time: '02:00', load: 1.8 },
    { time: '04:00', load: 1.6 },
    { time: '06:00', load: 2.2 },
    { time: '08:00', load: 3.8 },
    { time: '10:00', load: 4.2 },
    { time: '12:00', load: 4.8 },
  ]

  const requestData = [
    { time: '00:00', success: 120, error: 4 },
    { time: '01:00', success: 105, error: 2 },
    { time: '02:00', success: 95, error: 1 },
    { time: '03:00', success: 85, error: 0 },
    { time: '04:00', success: 90, error: 1 },
    { time: '05:00', success: 110, error: 3 },
    { time: '06:00', success: 145, error: 5 },
    { time: '07:00', success: 210, error: 7 },
    { time: '08:00', success: 250, error: 6 },
    { time: '09:00', success: 280, error: 8 },
    { time: '10:00', success: 240, error: 5 },
    { time: '11:00', success: 200, error: 4 },
    { time: '12:00', success: 260, error: 6 },
  ]

  const responseTimeData = [
    { time: '00:00', responseTime: 245 },
    { time: '01:00', responseTime: 232 },
    { time: '02:00', responseTime: 228 },
    { time: '03:00', responseTime: 225 },
    { time: '04:00', responseTime: 230 },
    { time: '05:00', responseTime: 242 },
    { time: '06:00', responseTime: 268 },
    { time: '07:00', responseTime: 295 },
    { time: '08:00', responseTime: 320 },
    { time: '09:00', responseTime: 345 },
    { time: '10:00', responseTime: 328 },
    { time: '11:00', responseTime: 302 },
    { time: '12:00', responseTime: 336 },
  ]

  // Chart configurations
  const cpuChartConfig = {
    cpu: {
      label: 'CPU Usage',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig

  const memoryChartConfig = {
    memory: {
      label: 'Memory Usage',
      color: 'hsl(var(--chart-2))',
    },
  } satisfies ChartConfig

  const networkChartConfig = {
    incoming: {
      label: 'Incoming',
      color: 'hsl(var(--chart-1))',
    },
    outgoing: {
      label: 'Outgoing',
      color: 'hsl(var(--chart-2))',
    },
  } satisfies ChartConfig

  const requestChartConfig = {
    success: {
      label: 'Success',
      color: 'hsl(var(--chart-2))',
    },
    error: {
      label: 'Error',
      color: 'hsl(var(--chart-3))',
    },
  } satisfies ChartConfig

  const responseTimeChartConfig = {
    responseTime: {
      label: 'Response Time',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig

  const loadChartConfig = {
    load: {
      label: 'System Load',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig

  const diskUsageConfig = {
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
  } satisfies ChartConfig

  const diskColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
  ]

  const { execute: uninstallNetdata, isPending: isUninstallingNetdata } =
    useAction(uninstallNetdataAction, {
      onSuccess: () => {
        toast.success('Successfully uninstalled netdata')
        router.refresh()
      },
    })

  const handleUninstall = () => {
    uninstallNetdata({ serverId: server.id })
  }

  // Status indicators
  const StatusIndicator = ({ status }: { status: string }) => {
    const getColor = () => {
      switch (status.toLowerCase()) {
        case 'online':
          return 'bg-green-500'
        case 'warning':
          return 'bg-yellow-500'
        case 'offline':
          return 'bg-red-500'
        default:
          return 'bg-gray-500'
      }
    }

    return (
      <div className='flex items-center'>
        <div className={`mr-2 h-3 w-3 rounded-full ${getColor()}`}></div>
        <span className='capitalize'>{status}</span>
      </div>
    )
  }

  return (
    <div className='container mx-auto p-4'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='mb-2 text-3xl font-bold'>
            Server Monitoring Dashboard
          </h1>
          <p className='text-muted-foreground'>
            Real-time performance metrics and server status
          </p>
        </div>
        <Button variant='destructive' onClick={handleUninstall}>
          Uninstall
        </Button>
      </div>

      {/* Status Overview */}
      <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Server Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <StatusIndicator status={serverStatus.status} />
              <Server className='h-4 w-4 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Server Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <div className='text-2xl font-bold'>{serverStatus.uptime}</div>
              <CheckCircle className='h-4 w-4 text-green-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Last Incident</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <div>{serverStatus.lastIncident}</div>
              <Clock className='h-4 w-4 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <span className='mr-2 text-2xl font-bold'>
                  {serverStatus.activeAlerts}
                </span>
                {serverStatus.activeAlerts > 0 && (
                  <Badge variant='destructive'>Attention Needed</Badge>
                )}
              </div>
              <AlertCircle
                className={`h-4 w-4 ${serverStatus.activeAlerts > 0 ? 'text-destructive' : 'text-muted-foreground'}`}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Resource Usage */}
      <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <div className='text-2xl font-bold'>
                  {cpuData[cpuData.length - 1].usage}%
                </div>
                <Cpu className='h-4 w-4 text-muted-foreground' />
              </div>
              <Progress
                value={cpuData[cpuData.length - 1].usage}
                className='h-2'
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <div className='text-2xl font-bold'>
                  {memoryData[memoryData.length - 1].usage}%
                </div>
                <HardDrive className='h-4 w-4 text-muted-foreground' />
              </div>
              <Progress
                value={memoryData[memoryData.length - 1].usage}
                className='h-2'
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Network Traffic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <div>
                  <span className='mr-2 text-sm text-muted-foreground'>
                    In:
                  </span>
                  <span className='font-bold'>
                    {networkData[networkData.length - 1].incoming} MB/s
                  </span>
                </div>
                <div>
                  <span className='mr-2 text-sm text-muted-foreground'>
                    Out:
                  </span>
                  <span className='font-bold'>
                    {networkData[networkData.length - 1].outgoing} MB/s
                  </span>
                </div>
                <Wifi className='h-4 w-4 text-muted-foreground' />
              </div>
              <Progress value={70} className='h-2' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed charts */}
      <Tabs
        defaultValue='overview'
        className='space-y-4'
        onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='cpu'>CPU</TabsTrigger>
          <TabsTrigger value='memory'>Memory</TabsTrigger>
          <TabsTrigger value='disk'>Disk</TabsTrigger>
          <TabsTrigger value='network'>Network</TabsTrigger>
          <TabsTrigger value='requests'>Requests</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>CPU Usage Trend</CardTitle>
                <CardDescription>Last 12 hours</CardDescription>
              </CardHeader>
              <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
                <ChartContainer
                  config={cpuChartConfig}
                  className='aspect-auto h-[250px] w-full'>
                  <LineChart data={cpuData} accessibilityLayer>
                    <defs>
                      <linearGradient id='fillCpu' x1='0' y1='0' x2='0' y2='1'>
                        <stop
                          offset='5%'
                          stopColor='var(--color-cpu)'
                          stopOpacity={0.8}
                        />
                        <stop
                          offset='95%'
                          stopColor='var(--color-cpu)'
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
                      stroke='var(--color-cpu)'
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
                <CardDescription>Last 12 hours</CardDescription>
              </CardHeader>
              <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
                <ChartContainer
                  config={memoryChartConfig}
                  className='aspect-auto h-[250px] w-full'>
                  <AreaChart data={memoryData} accessibilityLayer>
                    <defs>
                      <linearGradient
                        id='fillMemory'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'>
                        <stop
                          offset='5%'
                          stopColor='var(--color-memory)'
                          stopOpacity={0.8}
                        />
                        <stop
                          offset='95%'
                          stopColor='var(--color-memory)'
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
                      stroke='var(--color-memory)'
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
                <CardDescription>Incoming vs Outgoing (MB/s)</CardDescription>
              </CardHeader>
              <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
                <ChartContainer
                  config={networkChartConfig}
                  className='aspect-auto h-[250px] w-full'>
                  <LineChart data={networkData} accessibilityLayer>
                    <defs>
                      <linearGradient
                        id='fillIncoming'
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
                        id='fillOutgoing'
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
                <CardTitle>Disk Usage</CardTitle>
                <CardDescription>Storage allocation</CardDescription>
              </CardHeader>

              <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
                <ChartContainer
                  config={diskUsageConfig}
                  className='aspect-auto h-[250px] w-full'>
                  <PieChart>
                    <Pie
                      data={diskUsageData}
                      cx='50%'
                      cy='50%'
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey='value'
                      nameKey='name'>
                      {diskUsageData.map((entry, index) => (
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
          </div>
        </TabsContent>

        {/* CPU Tab */}
        <TabsContent value='cpu' className='space-y-4'>
          <div className='grid grid-cols-1 gap-4'>
            <Card>
              <CardHeader>
                <CardTitle>CPU Usage Trend</CardTitle>
                <CardDescription>
                  Last 12 hours with detailed metrics
                </CardDescription>
              </CardHeader>
              <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
                <ChartContainer
                  config={cpuChartConfig}
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
                          stopColor='var(--color-cpu)'
                          stopOpacity={0.8}
                        />
                        <stop
                          offset='95%'
                          stopColor='var(--color-cpu)'
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
                      stroke='var(--color-cpu)'
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
                  <CardDescription>System load over time</CardDescription>
                </CardHeader>
                <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
                  <ChartContainer
                    config={loadChartConfig}
                    className='aspect-auto h-[250px] w-full'>
                    <BarChart data={serverLoadData} accessibilityLayer>
                      <defs>
                        <linearGradient
                          id='fillLoad'
                          x1='0'
                          y1='0'
                          x2='0'
                          y2='1'>
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

              <Card>
                <CardHeader>
                  <CardTitle>CPU Usage Distribution</CardTitle>
                  <CardDescription>Current utilization by core</CardDescription>
                </CardHeader>
                <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
                  <ChartContainer
                    config={{
                      usage: {
                        label: 'Usage',
                        color: 'hsl(var(--chart-1))',
                      },
                    }}
                    className='aspect-auto h-[250px] w-full'>
                    <BarChart
                      data={[
                        { name: 'Core 1', usage: 65 },
                        { name: 'Core 2', usage: 85 },
                        { name: 'Core 3', usage: 72 },
                        { name: 'Core 4', usage: 78 },
                        { name: 'Core 5', usage: 62 },
                        { name: 'Core 6', usage: 90 },
                        { name: 'Core 7', usage: 45 },
                        { name: 'Core 8', usage: 68 },
                      ]}
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
        </TabsContent>

        {/* Memory Tab */}
        <TabsContent value='memory' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Memory Usage Trend</CardTitle>
              <CardDescription>
                Last 12 hours with detailed metrics
              </CardDescription>
            </CardHeader>
            <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
              <ChartContainer
                config={memoryChartConfig}
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
                        stopColor='var(--color-memory)'
                        stopOpacity={0.8}
                      />
                      <stop
                        offset='95%'
                        stopColor='var(--color-memory)'
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
                    stroke='var(--color-memory)'
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
            <Card>
              <CardHeader>
                <CardTitle>Memory Allocation</CardTitle>
                <CardDescription>Current memory distribution</CardDescription>
              </CardHeader>

              <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
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
                      {diskUsageData.map((entry, index) => (
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
              <CardHeader>
                <CardTitle>Swap Usage</CardTitle>
                <CardDescription>Virtual memory utilization</CardDescription>
              </CardHeader>
              <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
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
        </TabsContent>

        {/* Disk Tab */}
        <TabsContent value='disk' className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Disk Usage</CardTitle>
                <CardDescription>Storage allocation</CardDescription>
              </CardHeader>

              <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
                <ChartContainer
                  config={diskUsageConfig}
                  className='aspect-auto h-[250px] w-full'>
                  <PieChart>
                    <Pie
                      data={diskUsageData}
                      cx='50%'
                      cy='50%'
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey='value'
                      nameKey='name'>
                      {diskUsageData.map((entry, index) => (
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

            <Card>
              <CardHeader>
                <CardTitle>Disk I/O</CardTitle>
                <CardDescription>Read/Write operations</CardDescription>
              </CardHeader>
              <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
                <ChartContainer
                  config={{
                    read: {
                      label: 'Read',
                      color: 'hsl(var(--chart-1))',
                    },
                    write: {
                      label: 'Write',
                      color: 'hsl(var(--chart-2))',
                    },
                  }}
                  className='aspect-auto h-[250px] w-full'>
                  <LineChart
                    data={[
                      { time: '00:00', read: 25, write: 15 },
                      { time: '01:00', read: 20, write: 12 },
                      { time: '02:00', read: 18, write: 10 },
                      { time: '03:00', read: 15, write: 8 },
                      { time: '04:00', read: 20, write: 10 },
                      { time: '05:00', read: 22, write: 12 },
                      { time: '06:00', read: 28, write: 18 },
                      { time: '07:00', read: 35, write: 25 },
                      { time: '08:00', read: 40, write: 30 },
                      { time: '09:00', read: 45, write: 35 },
                      { time: '10:00', read: 38, write: 28 },
                      { time: '11:00', read: 32, write: 22 },
                      { time: '12:00', read: 36, write: 26 },
                    ]}
                    accessibilityLayer>
                    <defs>
                      <linearGradient id='fillRead' x1='0' y1='0' x2='0' y2='1'>
                        <stop
                          offset='5%'
                          stopColor='var(--color-read)'
                          stopOpacity={0.8}
                        />
                        <stop
                          offset='95%'
                          stopColor='var(--color-read)'
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient
                        id='fillWrite'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'>
                        <stop
                          offset='5%'
                          stopColor='var(--color-write)'
                          stopOpacity={0.8}
                        />
                        <stop
                          offset='95%'
                          stopColor='var(--color-write)'
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
                      dataKey='read'
                      stroke='var(--color-read)'
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line
                      type='monotone'
                      dataKey='write'
                      stroke='var(--color-write)'
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
                <CardTitle>Disk Volumes</CardTitle>
                <CardDescription>Space usage by volume</CardDescription>
              </CardHeader>
              <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
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
                    data={[
                      { name: '/', used: 75, total: 100 },
                      { name: '/home', used: 45, total: 100 },
                      { name: '/var', used: 25, total: 50 },
                      { name: '/tmp', used: 5, total: 20 },
                    ]}
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
                      <linearGradient
                        id='fillTotal'
                        x1='0'
                        y1='0'
                        x2='1'
                        y2='0'>
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

            <Card>
              <CardHeader>
                <CardTitle>Inode Usage</CardTitle>
                <CardDescription>File system metadata usage</CardDescription>
              </CardHeader>
              <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
                <ChartContainer
                  config={{
                    used: {
                      label: 'Used',
                      color: 'hsl(var(--chart-1))',
                    },
                  }}
                  className='aspect-auto h-[250px] w-full'>
                  <BarChart
                    data={[
                      { name: '/', used: 45 },
                      { name: '/home', used: 35 },
                      { name: '/var', used: 65 },
                      { name: '/tmp', used: 15 },
                    ]}
                    accessibilityLayer>
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
            </Card>
          </div>
        </TabsContent>

        {/* Network Tab */}
        <TabsContent value='network' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Network Traffic</CardTitle>
              <CardDescription>Bandwidth utilization over time</CardDescription>
            </CardHeader>
            <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
              <ChartContainer
                config={networkChartConfig}
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
            <Card>
              <CardHeader>
                <CardTitle>Network Packets</CardTitle>
                <CardDescription>
                  Packet transmission statistics
                </CardDescription>
              </CardHeader>
              <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
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
                      <linearGradient
                        id='fillReceived'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'>
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

            <Card>
              <CardHeader>
                <CardTitle>Network Errors</CardTitle>
                <CardDescription>Error rates and types</CardDescription>
              </CardHeader>
              <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
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
                      <linearGradient
                        id='fillDropped'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'>
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
                      <linearGradient
                        id='fillErrors'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'>
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
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value='requests' className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Request Volume</CardTitle>
                <CardDescription>Successful vs Error requests</CardDescription>
              </CardHeader>
              <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
                <ChartContainer
                  config={requestChartConfig}
                  className='aspect-auto h-[250px] w-full'>
                  <BarChart data={requestData} accessibilityLayer>
                    <defs>
                      <linearGradient
                        id='fillSuccess'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'>
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
                      <linearGradient
                        id='fillError'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'>
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
              <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
                <ChartContainer
                  config={responseTimeChartConfig}
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

              <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
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
                      <Cell
                        fill='var(--color-serverError)'
                        stroke='transparent'
                      />
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
              <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
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
                      <linearGradient
                        id='fillCount'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Monitoring
