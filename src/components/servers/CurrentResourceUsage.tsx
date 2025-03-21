'use client'

import { Battery, Cpu, HardDrive, Wifi } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const CurrentResourceUsage = ({
  cpuData,
  memoryData,
  networkData,
}: {
  cpuData: any
  memoryData: any
  networkData: any
}) => {
  // Extract latest data safely
  const latestCpuUsage = cpuData?.at(-1)?.usage ?? 0
  const latestMemoryUsage = memoryData?.at(-1)?.usage ?? 0
  const latestIncoming = networkData?.at(-1)?.incoming ?? 0
  const latestOutgoing = networkData?.at(-1)?.outgoing ?? 0

  // Determine overall system health status
  const highestUsage = Math.max(latestCpuUsage, latestMemoryUsage)

  const getSystemHealthText = () => {
    if (highestUsage > 80) return 'System under heavy load'
    if (highestUsage > 60) return 'System under moderate load'
    return 'System running optimally'
  }

  const getSystemHealthColor = () => {
    if (highestUsage > 80) return 'text-red-500'
    if (highestUsage > 60) return 'text-yellow-500'
    return 'text-green-500'
  }

  return (
    <div className='space-y-6'>
      {/* Resource Cards Grid */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        {/* CPU Usage */}
        <Card className='shadow-sm'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <div className='text-2xl font-bold'>{latestCpuUsage}%</div>
                <Cpu className='h-4 w-4 text-muted-foreground' />
              </div>
              <Progress value={latestCpuUsage} className='h-2' />
            </div>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card className='shadow-sm'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <div className='text-2xl font-bold'>{latestMemoryUsage}%</div>
                <HardDrive className='h-4 w-4 text-muted-foreground' />
              </div>
              <Progress value={latestMemoryUsage} className='h-2' />
            </div>
          </CardContent>
        </Card>

        {/* Network Traffic */}
        <Card className='shadow-sm'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Network Traffic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='mt-2 space-y-2'>
              <div className='flex items-center justify-between'>
                <div className='flex flex-col space-y-1 sm:flex-row sm:space-x-3 sm:space-y-0'>
                  <div>
                    <span className='mr-1 text-sm text-muted-foreground'>
                      In:
                    </span>
                    <span className='font-bold'>{latestIncoming} MB/s</span>
                  </div>
                  <div>
                    <span className='mr-1 text-sm text-muted-foreground'>
                      Out:
                    </span>
                    <span className='font-bold'>{latestOutgoing} MB/s</span>
                  </div>
                </div>
                <Wifi className='h-4 w-4 text-muted-foreground' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health Summary */}
      <Card className='shadow-sm'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm font-medium'>
            System Health Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-2'>
            <Battery className={`h-5 w-5 ${getSystemHealthColor()}`} />
            <span className='font-medium'>{getSystemHealthText()}</span>
          </div>
          <div className='mt-2 text-sm text-muted-foreground'>
            CPU: {latestCpuUsage}% • Memory: {latestMemoryUsage}% • Network:{' '}
            {latestIncoming + latestOutgoing} MB/s
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CurrentResourceUsage
