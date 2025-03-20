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
import { useCallback, useEffect, useState } from 'react'
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
import { netdata } from '@/lib/netdata'
import { ServerType } from '@/payload-types-overrides'

const Monitoring = ({ server }: { server: ServerType }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()

  // State for server metrics
  const [serverStatus, setServerStatus] = useState({
    status: 'loading',
    uptime: '--',
    lastIncident: '--',
    activeAlerts: 0,
  })

  const [dashboardMetrics, setDashboardMetrics] = useState({
    cpuData: [],
    cpuUsageDistributionData: [],
    memoryData: [],
    networkData: [],
    diskSpaceData: [],
    diskIOData: [],
    diskVolumesData: [],
    inodeUsageData: [],
    serverLoadData: [],
    requestData: [],
    responseTimeData: [],
  })

  const {
    cpuData,
    cpuUsageDistributionData,
    diskSpaceData,
    diskIOData,
    diskVolumesData,
    inodeUsageData,
    memoryData,
    networkData,
    requestData,
    responseTimeData,
    serverLoadData,
  } = dashboardMetrics

  // Disk Space Data
  const dummyDiskSpaceData = [
    { name: 'Used', value: 68 },
    { name: 'Free', value: 32 },
  ]

  // Disk Volumes Data
  const dummyDiskVolumesData = [
    { name: '/', used: 75, total: 100 },
    { name: '/home', used: 45, total: 100 },
    { name: '/var', used: 25, total: 50 },
    { name: '/tmp', used: 5, total: 20 },
  ]

  // Inode Usage Data
  const dummyInodeUsageData = [
    { name: '/', used: 45 },
    { name: '/home', used: 35 },
    { name: '/var', used: 65 },
    { name: '/tmp', used: 15 },
  ]

  const dummyCpuUsageDistributionData = [
    { name: 'Core 1', usage: 65 },
    { name: 'Core 2', usage: 85 },
    { name: 'Core 3', usage: 72 },
    { name: 'Core 4', usage: 78 },
    { name: 'Core 5', usage: 62 },
    { name: 'Core 6', usage: 90 },
    { name: 'Core 7', usage: 45 },
    { name: 'Core 8', usage: 68 },
  ]

  // Function to fetch server status
  const fetchServerStatus = useCallback(async () => {
    try {
      const response = await netdata.system.getServerDashboardStatus({
        host: server.ip,
      })

      if (response) {
        setServerStatus({
          status: response?.data?.serverStatus?.status || 'unknown',
          uptime: response?.data?.serverStatus?.uptime || '--',
          lastIncident:
            response?.data?.serverStatus?.lastIncident || 'No incidents',
          activeAlerts: response?.data?.serverStatus?.activeAlerts || 0,
        })
      }
    } catch (error) {
      console.error('Error fetching server status:', error)
      setServerStatus(prev => ({
        ...prev,
        status: 'error',
      }))
    }
  }, [server.ip])

  // Function to fetch dashboard metrics
  const fetchDashboardMetrics = useCallback(async () => {
    try {
      const response = await netdata.system.getDashboardMetrics({
        host: server.ip,
      })

      if (response) {
        // Process and transform the API response into chart data
        setDashboardMetrics({
          cpuData: response?.data?.cpuData || [],
          cpuUsageDistributionData:
            response?.data?.cpuUsageDistribution ||
            dummyCpuUsageDistributionData,
          memoryData: response?.data?.memoryData || [],
          networkData: response?.data?.networkData || [],
          diskSpaceData: response?.data?.diskSpaceData || dummyDiskSpaceData,
          diskIOData: response?.data?.diskIOData || [],
          diskVolumesData:
            response?.data?.diskVolumesData || dummyDiskVolumesData,
          inodeUsageData: response?.data?.inodeUsageData || dummyInodeUsageData,
          serverLoadData: response?.data?.serverLoadData || [],
          requestData: response?.data?.requestData || [],
          responseTimeData: response?.data?.responseTimeData || [],
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error)
    }
  }, [server.ip])

  // Setup polling interval
  useEffect(() => {
    // Fetch initial data
    fetchServerStatus()
    fetchDashboardMetrics()

    // Set up polling every minute (60000 ms)
    const statusInterval = setInterval(fetchServerStatus, 60000)
    const metricsInterval = setInterval(fetchDashboardMetrics, 60000)

    // Cleanup intervals on component unmount
    return () => {
      clearInterval(statusInterval)
      clearInterval(metricsInterval)
    }
  }, [fetchServerStatus, fetchDashboardMetrics])

  console.log({ serverStatus, dashboardMetrics })

  // Chart configurations
  const cpuChartConfig = {
    usage: {
      label: 'Usage',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig

  const memoryChartConfig = {
    usage: {
      label: 'Usage',
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
                  {(cpuData as any)?.at(-1)?.usage}%
                </div>
                <Cpu className='h-4 w-4 text-muted-foreground' />
              </div>
              <Progress
                value={(cpuData as any)?.at(-1)?.usage}
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
                  {(memoryData as any)?.at(-1)?.usage}%
                </div>
                <HardDrive className='h-4 w-4 text-muted-foreground' />
              </div>
              <Progress
                value={(memoryData as any)?.at(-1)?.usage}
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
                    {(networkData as any)?.at(-1)?.incoming} MB/s
                  </span>
                </div>
                <div>
                  <span className='mr-2 text-sm text-muted-foreground'>
                    Out:
                  </span>
                  <span className='font-bold'>
                    {(networkData as any)?.at(-1)?.outgoing} MB/s
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
        className='mt-12 space-y-4'
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
                <CardDescription>
                  {cpuData.length > 1
                    ? `${getTimeRange(cpuData)} (from ${(cpuData as any).at(0)?.time} to ${(cpuData as any).at(-1)?.time})`
                    : 'No data available'}
                </CardDescription>
              </CardHeader>
              <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
                <ChartContainer
                  config={cpuChartConfig}
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
                      <linearGradient
                        id='fillWrite'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'>
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
        </TabsContent>

        {/* CPU Tab */}
        <TabsContent value='cpu' className='space-y-4'>
          <div className='grid grid-cols-1 gap-4'>
            <Card>
              <CardHeader>
                <CardTitle>CPU Usage Trend</CardTitle>
                <CardDescription>
                  {cpuData.length > 1
                    ? `${getTimeRange(cpuData)} with detailed metrics - (from ${(diskIOData as any).at(0)?.time} to ${(diskIOData as any).at(-1)?.time})`
                    : 'No data available'}
                </CardDescription>
              </CardHeader>
              <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
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
        </TabsContent>

        {/* Memory Tab */}
        <TabsContent value='memory' className='space-y-4'>
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
        </TabsContent>

        {/* Disk Tab */}
        <TabsContent value='disk' className='space-y-4'>
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
                  config={diskUsageConfig}
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
        </TabsContent>

        {/* Network Tab */}
        <TabsContent value='network' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Network Traffic</CardTitle>
              <CardDescription>Bandwidth utilization over time</CardDescription>
            </CardHeader>
            <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
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
            <Card className='overflow-hidden'>
              <CardHeader className='relative'>
                <CardTitle>Network Packets</CardTitle>
                <CardDescription>
                  Packet transmission statistics
                </CardDescription>
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
        <TabsContent value='requests' className='relative space-y-4'>
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
              <CardContent className='pl-0 pr-2 pt-4 sm:pr-6 sm:pt-6'>
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

const getTimeRange = (data: { time: string }[]) => {
  if (data.length < 2) return 'No data available'

  // Reverse data to ensure ascending order (earliest to latest)
  const sortedData = [...data].reverse()

  // Get today's date (assuming data is from today)
  const today = new Date().toISOString().split('T')[0]

  // Convert time strings to full timestamps
  const firstTimestamp = new Date(`${today}T${sortedData[0].time}:00`)
  const lastTimestamp = new Date(
    `${today}T${sortedData[sortedData.length - 1].time}:00`,
  )

  if (isNaN(firstTimestamp.getTime()) || isNaN(lastTimestamp.getTime())) {
    return 'Invalid time data'
  }

  const diffInMinutes = Math.round(
    (lastTimestamp.getTime() - firstTimestamp.getTime()) / (1000 * 60),
  )

  if (diffInMinutes >= 1440) {
    return `Last ${Math.round(diffInMinutes / 1440)} days`
  } else if (diffInMinutes >= 60) {
    return `Last ${Math.round(diffInMinutes / 60)} hours`
  } else {
    return `Last ${diffInMinutes} minutes`
  }
}
