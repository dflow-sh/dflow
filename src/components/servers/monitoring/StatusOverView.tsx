'use client'

import { AlertCircle, CheckCircle, Clock, Server } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Separator } from '@/components/ui/separator'

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

const StatusOverView = ({
  serverStatus,
  dashboardMetrics,
}: {
  serverStatus: {
    status: string
    uptime: string
    lastIncident: string
    activeAlerts: number
  }
  dashboardMetrics: {
    overview: any
    detailed: {
      systemAlerts: {
        alarms: {
          name: string
          type: string
          status: string
          summary: string
          fullTimestamp: string
        }[]
      }
    }
  }
}) => {
  const systemAlerts = dashboardMetrics?.detailed?.systemAlerts?.alarms || []

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
          <div className='flex cursor-pointer items-center justify-between'>
            <div className='flex items-center'>
              <span className='mr-2 text-2xl font-bold'>
                {serverStatus.activeAlerts}
              </span>
              <HoverCard>
                <HoverCardTrigger asChild>
                  {serverStatus.activeAlerts > 0 && (
                    <Badge variant='destructive'>Attention Needed</Badge>
                  )}
                </HoverCardTrigger>
                <HoverCardContent className='w-auto min-w-[320px] max-w-[400px]'>
                  <div className='flex justify-between'>
                    <h4 className='text-sm font-semibold'>System Alerts</h4>
                    <Badge
                      variant={
                        systemAlerts.length > 0 ? 'destructive' : 'secondary'
                      }>
                      {systemAlerts.length}{' '}
                      {systemAlerts.length === 1 ? 'Alert' : 'Alerts'}
                    </Badge>
                  </div>

                  {systemAlerts.length > 0 ? (
                    <div className='mt-2 space-y-3'>
                      {systemAlerts.map((alert, index) => (
                        <div key={index} className='space-y-1'>
                          {index > 0 && <Separator className='my-2' />}
                          <div className='flex items-center justify-between'>
                            <h5 className='font-medium'>{alert.name}</h5>
                            <Badge
                              variant={
                                alert.status.toLowerCase() === 'critical'
                                  ? 'destructive'
                                  : alert.status.toLowerCase() === 'warning'
                                    ? 'secondary'
                                    : 'outline'
                              }
                              className='ml-2 text-xs'>
                              {alert.status}
                            </Badge>
                          </div>
                          <p className='text-sm text-muted-foreground'>
                            {alert.summary}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {alert.fullTimestamp}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='flex h-20 items-center justify-center'>
                      <p className='text-sm text-muted-foreground'>
                        No active alerts
                      </p>
                    </div>
                  )}
                </HoverCardContent>
              </HoverCard>
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
