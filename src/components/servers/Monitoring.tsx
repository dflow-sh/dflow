'use client'

import {
  AlertCircle,
  CheckCircle,
  Clock,
  Cpu,
  HardDrive,
  Server,
  Wifi,
} from 'lucide-react'
import { useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
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
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const Monitoring = () => {
  const [activeTab, setActiveTab] = useState('overview')

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

  // Colors for charts
  const colors = {
    cpu: '#8884d8',
    memory: '#82ca9d',
    disk: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'],
    network: {
      incoming: '#8884d8',
      outgoing: '#82ca9d',
    },
    requests: {
      success: '#82ca9d',
      error: '#ff8042',
    },
  }

  // Status indicators
  const StatusIndicator = ({ status }: any) => {
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
      <div className='mb-6'>
        <h1 className='mb-2 text-3xl font-bold'>Server Monitoring Dashboard</h1>
        <p className='text-gray-500'>
          Real-time performance metrics and server status
        </p>
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
              <Server className='h-4 w-4 text-gray-500' />
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
              <Clock className='h-4 w-4 text-gray-500' />
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
                className={`h-4 w-4 ${serverStatus.activeAlerts > 0 ? 'text-red-500' : 'text-gray-500'}`}
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
                <Cpu className='h-4 w-4 text-gray-500' />
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
                <HardDrive className='h-4 w-4 text-gray-500' />
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
                  <span className='mr-2 text-sm text-gray-500'>In:</span>
                  <span className='font-bold'>
                    {networkData[networkData.length - 1].incoming} MB/s
                  </span>
                </div>
                <div>
                  <span className='mr-2 text-sm text-gray-500'>Out:</span>
                  <span className='font-bold'>
                    {networkData[networkData.length - 1].outgoing} MB/s
                  </span>
                </div>
                <Wifi className='h-4 w-4 text-gray-500' />
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
              <CardContent>
                <div className='h-80'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <LineChart data={cpuData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='time' />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type='monotone'
                        dataKey='usage'
                        stroke={colors.cpu}
                        name='CPU Usage (%)'
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Usage Trend</CardTitle>
                <CardDescription>Last 12 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-80'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart data={memoryData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='time' />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Area
                        type='monotone'
                        dataKey='usage'
                        stroke={colors.memory}
                        fill={colors.memory}
                        fillOpacity={0.3}
                        name='Memory Usage (%)'
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network Traffic</CardTitle>
                <CardDescription>Incoming vs Outgoing (MB/s)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-80'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <LineChart data={networkData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='time' />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type='monotone'
                        dataKey='incoming'
                        stroke={colors.network.incoming}
                        name='Incoming (MB/s)'
                      />
                      <Line
                        type='monotone'
                        dataKey='outgoing'
                        stroke={colors.network.outgoing}
                        name='Outgoing (MB/s)'
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Disk Usage</CardTitle>
                <CardDescription>Storage allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-80'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={diskUsageData}
                        cx='50%'
                        cy='50%'
                        labelLine={false}
                        outerRadius={80}
                        fill='#8884d8'
                        dataKey='value'
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }>
                        {diskUsageData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={colors.disk[index % colors.disk.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
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
              <CardContent>
                <div className='h-96'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <LineChart data={cpuData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='time' />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type='monotone'
                        dataKey='usage'
                        stroke={colors.cpu}
                        strokeWidth={2}
                        name='CPU Usage (%)'
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <Card>
                <CardHeader>
                  <CardTitle>CPU Load Average</CardTitle>
                  <CardDescription>System load over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='h-80'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart data={serverLoadData}>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey='time' />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey='load' fill='#8884d8' name='System Load' />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>CPU Usage Distribution</CardTitle>
                  <CardDescription>Current utilization by core</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='h-80'>
                    <ResponsiveContainer width='100%' height='100%'>
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
                        layout='vertical'>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis type='number' domain={[0, 100]} />
                        <YAxis type='category' dataKey='name' />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey='usage' fill='#8884d8' name='Usage (%)' />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
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
            <CardContent>
              <div className='h-96'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={memoryData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='time' />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Area
                      type='monotone'
                      dataKey='usage'
                      stroke={colors.memory}
                      fill={colors.memory}
                      fillOpacity={0.3}
                      name='Memory Usage (%)'
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Memory Allocation</CardTitle>
                <CardDescription>Current memory distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-80'>
                  <ResponsiveContainer width='100%' height='100%'>
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
                        labelLine={false}
                        outerRadius={80}
                        fill='#8884d8'
                        dataKey='value'
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }>
                        {diskUsageData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={colors.disk[index % colors.disk.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Swap Usage</CardTitle>
                <CardDescription>Virtual memory utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-80'>
                  <ResponsiveContainer width='100%' height='100%'>
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
                      ]}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='time' />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type='monotone'
                        dataKey='usage'
                        stroke='#ff8042'
                        name='Swap Usage (%)'
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
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
              <CardContent>
                <div className='h-80'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={diskUsageData}
                        cx='50%'
                        cy='50%'
                        labelLine={false}
                        outerRadius={80}
                        fill='#8884d8'
                        dataKey='value'
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }>
                        {diskUsageData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={colors.disk[index % colors.disk.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Disk I/O</CardTitle>
                <CardDescription>Read/Write operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-80'>
                  <ResponsiveContainer width='100%' height='100%'>
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
                      ]}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='time' />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type='monotone'
                        dataKey='read'
                        stroke='#8884d8'
                        name='Read (MB/s)'
                      />
                      <Line
                        type='monotone'
                        dataKey='write'
                        stroke='#82ca9d'
                        name='Write (MB/s)'
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Disk Volumes</CardTitle>
                <CardDescription>Space usage by volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-80'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                      data={[
                        { name: '/', used: 75, total: 100 },
                        { name: '/home', used: 45, total: 100 },
                        { name: '/var', used: 25, total: 50 },
                        { name: '/tmp', used: 5, total: 20 },
                      ]}
                      layout='vertical'>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis type='number' />
                      <YAxis type='category' dataKey='name' />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey='used'
                        stackId='a'
                        fill='#8884d8'
                        name='Used (GB)'
                      />
                      <Bar
                        dataKey='total'
                        stackId='a'
                        fill='#82ca9d'
                        name='Total (GB)'
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inode Usage</CardTitle>
                <CardDescription>File system metadata usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-80'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                      data={[
                        { name: '/', used: 45 },
                        { name: '/home', used: 35 },
                        { name: '/var', used: 65 },
                        { name: '/tmp', used: 15 },
                      ]}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='name' />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey='used' fill='#8884d8' name='Used (%)' />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
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
            <CardContent>
              <div className='h-96'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={networkData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='time' />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type='monotone'
                      dataKey='incoming'
                      stroke={colors.network.incoming}
                      strokeWidth={2}
                      name='Incoming (MB/s)'
                    />
                    <Line
                      type='monotone'
                      dataKey='outgoing'
                      stroke={colors.network.outgoing}
                      strokeWidth={2}
                      name='Outgoing (MB/s)'
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
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
              <CardContent>
                <div className='h-80'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                      data={[
                        { time: '00:00', received: 15000, sent: 8000 },
                        { time: '02:00', received: 12000, sent: 6500 },
                        { time: '04:00', received: 10000, sent: 5000 },
                        { time: '06:00', received: 18000, sent: 9500 },
                        { time: '08:00', received: 25000, sent: 15000 },
                        { time: '10:00', received: 22000, sent: 12000 },
                        { time: '12:00', received: 28000, sent: 14000 },
                      ]}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='time' />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey='received'
                        fill='#8884d8'
                        name='Packets Received'
                      />
                      <Bar dataKey='sent' fill='#82ca9d' name='Packets Sent' />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network Errors</CardTitle>
                <CardDescription>Error rates and types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-80'>
                  <ResponsiveContainer width='100%' height='100%'>
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
                      ]}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='time' />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type='monotone'
                        dataKey='dropped'
                        stroke='#ff8042'
                        name='Dropped Packets (%)'
                      />
                      <Line
                        type='monotone'
                        dataKey='errors'
                        stroke='#ff0000'
                        name='Errors (%)'
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
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
              <CardContent>
                <div className='h-80'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={requestData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='time' />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey='success'
                        stackId='a'
                        fill={colors.requests.success}
                        name='Successful Requests'
                      />
                      <Bar
                        dataKey='error'
                        stackId='a'
                        fill={colors.requests.error}
                        name='Error Requests'
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Time</CardTitle>
                <CardDescription>Average response time (ms)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-80'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <LineChart data={responseTimeData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='time' />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type='monotone'
                        dataKey='responseTime'
                        stroke='#8884d8'
                        name='Response Time (ms)'
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request Status Codes</CardTitle>
                <CardDescription>Distribution by HTTP status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-80'>
                  <ResponsiveContainer width='100%' height='100%'>
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
                        labelLine={false}
                        outerRadius={80}
                        fill='#8884d8'
                        dataKey='value'
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }>
                        <Cell fill='#82ca9d' />
                        <Cell fill='#8884d8' />
                        <Cell fill='#ffc658' />
                        <Cell fill='#ff8042' />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request Latency</CardTitle>
                <CardDescription>
                  Request processing time distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-80'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                      data={[
                        { range: '0-100ms', count: 45 },
                        { range: '100-200ms', count: 30 },
                        { range: '200-300ms', count: 15 },
                        { range: '300-500ms', count: 8 },
                        { range: '500ms+', count: 2 },
                      ]}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='range' />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey='count'
                        fill='#8884d8'
                        name='Request Count (%)'
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Monitoring
