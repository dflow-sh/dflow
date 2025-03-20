'use client'

import { AlertCircle, CheckCircle, Clock, Server } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const StatusOverView = ({
  serverStatus,
}: {
  serverStatus: {
    status: string
    uptime: string
    lastIncident: string
    activeAlerts: number
  }
}) => {
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
  )
}

export default StatusOverView
