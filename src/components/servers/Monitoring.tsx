'use client'

import { AlertTriangle, Cpu, HardDrive, Server, Wifi } from 'lucide-react'
import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const Monitoring = () => {
  // Sample data - in a real app, this would come from an API
  const [performanceData] = useState([
    {
      time: '00:00',
      cpu: 45,
      memory: 32,
      network: 15,
      disk: 23,
      response: 180,
    },
    {
      time: '01:00',
      cpu: 42,
      memory: 35,
      network: 18,
      disk: 25,
      response: 175,
    },
    {
      time: '02:00',
      cpu: 38,
      memory: 33,
      network: 12,
      disk: 22,
      response: 190,
    },
    {
      time: '03:00',
      cpu: 40,
      memory: 37,
      network: 16,
      disk: 24,
      response: 210,
    },
    {
      time: '04:00',
      cpu: 45,
      memory: 40,
      network: 20,
      disk: 27,
      response: 230,
    },
    {
      time: '05:00',
      cpu: 52,
      memory: 45,
      network: 25,
      disk: 30,
      response: 250,
    },
    {
      time: '06:00',
      cpu: 60,
      memory: 50,
      network: 32,
      disk: 35,
      response: 300,
    },
    {
      time: '07:00',
      cpu: 68,
      memory: 55,
      network: 38,
      disk: 40,
      response: 320,
    },
    {
      time: '08:00',
      cpu: 75,
      memory: 62,
      network: 45,
      disk: 42,
      response: 280,
    },
    {
      time: '09:00',
      cpu: 80,
      memory: 68,
      network: 50,
      disk: 45,
      response: 260,
    },
    {
      time: '10:00',
      cpu: 85,
      memory: 72,
      network: 55,
      disk: 48,
      response: 240,
    },
    {
      time: '11:00',
      cpu: 82,
      memory: 70,
      network: 52,
      disk: 46,
      response: 220,
    },
    {
      time: '12:00',
      cpu: 78,
      memory: 65,
      network: 48,
      disk: 43,
      response: 200,
    },
  ])

  const [serverStatus] = useState([
    { name: 'Web Server 1', status: 'online', uptime: 99.98, alerts: 0 },
    { name: 'Web Server 2', status: 'online', uptime: 99.95, alerts: 1 },
    { name: 'Database Server', status: 'online', uptime: 99.99, alerts: 0 },
    { name: 'Cache Server', status: 'online', uptime: 100, alerts: 0 },
    { name: 'API Server', status: 'degraded', uptime: 98.7, alerts: 3 },
    { name: 'Backup Server', status: 'offline', uptime: 85.4, alerts: 5 },
  ])

  const [errorData] = useState([
    { type: '404 Not Found', count: 234 },
    { type: '500 Server Error', count: 45 },
    { type: '403 Forbidden', count: 67 },
    { type: 'Timeout', count: 123 },
    { type: 'Connection Error', count: 78 },
  ])

  return (
    <div className='space-y-6 p-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Server Monitoring Dashboard</h1>
        <div className='flex items-center gap-2 text-sm'>
          <div className='flex items-center'>
            <div className='mr-1 h-3 w-3 rounded-full bg-green-500'></div>
            <span>5 Online</span>
          </div>
          <div className='flex items-center'>
            <div className='mr-1 h-3 w-3 rounded-full bg-yellow-500'></div>
            <span>1 Degraded</span>
          </div>
          <div className='flex items-center'>
            <div className='mr-1 h-3 w-3 rounded-full bg-red-500'></div>
            <span>1 Offline</span>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Average CPU</CardTitle>
            <Cpu className='h-4 w-4 text-gray-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>64.2%</div>
            <p className='text-xs text-gray-500'>+12% from last hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Memory Usage</CardTitle>
            <HardDrive className='h-4 w-4 text-gray-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>54.6%</div>
            <p className='text-xs text-gray-500'>+5% from last hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>
              Network Traffic
            </CardTitle>
            <Wifi className='h-4 w-4 text-gray-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>38.2 MB/s</div>
            <p className='text-xs text-gray-500'>+8% from last hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Active Alerts</CardTitle>
            <AlertTriangle className='h-4 w-4 text-red-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>9</div>
            <p className='text-xs text-gray-500'>+3 from last hour</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue='performance'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='performance'>Performance</TabsTrigger>
          <TabsTrigger value='servers'>Servers</TabsTrigger>
          <TabsTrigger value='errors'>Errors</TabsTrigger>
        </TabsList>

        <TabsContent value='performance' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>
                CPU, memory, network, and disk usage over the past 12 hours
              </CardDescription>
            </CardHeader>
            <CardContent className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='time' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type='monotone'
                    dataKey='cpu'
                    stroke='#8884d8'
                    name='CPU (%)'
                    strokeWidth={2}
                  />
                  <Line
                    type='monotone'
                    dataKey='memory'
                    stroke='#82ca9d'
                    name='Memory (%)'
                    strokeWidth={2}
                  />
                  <Line
                    type='monotone'
                    dataKey='network'
                    stroke='#ffc658'
                    name='Network (MB/s)'
                    strokeWidth={2}
                  />
                  <Line
                    type='monotone'
                    dataKey='disk'
                    stroke='#ff8042'
                    name='Disk I/O (MB/s)'
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Response Time</CardTitle>
              <CardDescription>
                Average response time in milliseconds
              </CardDescription>
            </CardHeader>
            <CardContent className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='time' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type='monotone'
                    dataKey='response'
                    stroke='#ff0000'
                    name='Response Time (ms)'
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='servers'>
          <Card>
            <CardHeader>
              <CardTitle>Server Status</CardTitle>
              <CardDescription>
                Current status and uptime for all servers
              </CardDescription>
            </CardHeader>
            <CardContent className='h-96'>
              <div className='space-y-4'>
                {serverStatus.map(server => (
                  <div
                    key={server.name}
                    className='flex items-center rounded border p-3'>
                    <Server className='mr-3 h-5 w-5' />
                    <div className='flex-1'>
                      <div className='font-medium'>{server.name}</div>
                      <div className='text-sm text-gray-500'>
                        Uptime: {server.uptime}%
                      </div>
                    </div>
                    <div className='flex items-center'>
                      {server.alerts > 0 && (
                        <div className='mr-2 rounded bg-red-100 px-2 py-1 text-xs text-red-800'>
                          {server.alerts}{' '}
                          {server.alerts === 1 ? 'alert' : 'alerts'}
                        </div>
                      )}
                      <div
                        className={`rounded px-2 py-1 text-xs ${
                          server.status === 'online'
                            ? 'bg-green-100 text-green-800'
                            : server.status === 'degraded'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                        {server.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='errors'>
          <Card>
            <CardHeader>
              <CardTitle>Error Distribution</CardTitle>
              <CardDescription>
                Distribution of error types in the last 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={errorData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='type' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey='count' fill='#8884d8' name='Count' />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Monitoring
