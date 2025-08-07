'use client'

import { CheckCircle, Clock, Server } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Status indicators
const StatusIndicator = ({ status }: { status: string }) => {
  const getColor = () => {
    switch (status.toLowerCase()) {
      case 'online':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'offline':
      case 'error':
        return 'bg-red-500'
      case 'loading':
        return 'bg-blue-500 animate-pulse'
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

interface DefaultStatusOverviewProps {
  serverStatus: {
    status: string
    uptime: string
    lastIncident: string
    activeAlerts: number
  }
  monitoringData: {
    systemInfo: {
      hostname: string
      status: string
    }
    alerts: any[]
  }
}

const DefaultStatusOverview = ({
  serverStatus,
  monitoringData,
}: DefaultStatusOverviewProps) => {
  const systemAlerts = monitoringData?.alerts || []

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
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
            <div className='text-sm'>{serverStatus.lastIncident}</div>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm font-medium'>System Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-1'>
            <div className='text-sm font-medium'>
              {monitoringData.systemInfo.hostname}
            </div>
            <div className='flex items-center'>
              <StatusIndicator status={monitoringData.systemInfo.status} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DefaultStatusOverview
