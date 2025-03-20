'use client'

import { Cpu, HardDrive, Wifi } from 'lucide-react'

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
  return (
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
            <Progress value={(cpuData as any)?.at(-1)?.usage} className='h-2' />
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
          <CardTitle className='text-sm font-medium'>Network Traffic</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <div>
                <span className='mr-2 text-sm text-muted-foreground'>In:</span>
                <span className='font-bold'>
                  {(networkData as any)?.at(-1)?.incoming} MB/s
                </span>
              </div>
              <div>
                <span className='mr-2 text-sm text-muted-foreground'>Out:</span>
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
  )
}

export default CurrentResourceUsage
