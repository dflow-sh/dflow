'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface DefaultCurrentResourceUsageProps {
  monitoringData: {
    resources: {
      cpu: { usage: number; cores: number }
      memory: { used: number; total: number; percentage: number }
      disk: { used: number; total: number; percentage: number }
      network: { bytesIn: number; bytesOut: number }
    }
  }
  systemStatsResult?: any
}

const DefaultCurrentResourceUsage = ({
  monitoringData,
  systemStatsResult,
}: DefaultCurrentResourceUsageProps) => {
  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const latestStats =
    systemStatsResult?.data?.data?.items?.[
      systemStatsResult.data.data.items.length - 1
    ]

  return (
    <div className='grid gap-4 md:grid-cols-3'>
      {/* CPU Usage */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm'>CPU Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span>Usage</span>
              <span>{monitoringData.resources.cpu.usage}%</span>
            </div>
            <Progress
              value={monitoringData.resources.cpu.usage}
              className='h-2'
            />
            {latestStats?.stats?.la && (
              <div className='space-y-1'>
                <p className='text-xs text-muted-foreground'>
                  Load Average: {latestStats.stats.la.join(', ')}
                </p>
                <div className='grid grid-cols-3 gap-2 text-xs'>
                  <div className='text-center'>
                    <div className='font-medium'>{latestStats.stats.la[0]}</div>
                    <div className='text-muted-foreground'>1m</div>
                  </div>
                  <div className='text-center'>
                    <div className='font-medium'>{latestStats.stats.la[1]}</div>
                    <div className='text-muted-foreground'>5m</div>
                  </div>
                  <div className='text-center'>
                    <div className='font-medium'>{latestStats.stats.la[2]}</div>
                    <div className='text-muted-foreground'>15m</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Memory Usage */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm'>Memory Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span>Usage</span>
              <span>{monitoringData.resources.memory.percentage}%</span>
            </div>
            <Progress
              value={monitoringData.resources.memory.percentage}
              className='h-2'
            />
            <div className='space-y-1'>
              <p className='text-xs text-muted-foreground'>
                {monitoringData.resources.memory.used.toFixed(2)}GB /{' '}
                {monitoringData.resources.memory.total.toFixed(2)}GB
              </p>
              <div className='grid grid-cols-2 gap-2 text-xs'>
                <div>
                  <div className='font-medium'>
                    {formatBytes(
                      monitoringData.resources.memory.used * 1024 * 1024 * 1024,
                    )}
                  </div>
                  <div className='text-muted-foreground'>Used</div>
                </div>
                <div>
                  <div className='font-medium'>
                    {formatBytes(
                      (monitoringData.resources.memory.total -
                        monitoringData.resources.memory.used) *
                        1024 *
                        1024 *
                        1024,
                    )}
                  </div>
                  <div className='text-muted-foreground'>Available</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disk Usage */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm'>Disk Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span>Usage</span>
              <span>{monitoringData.resources.disk.percentage}%</span>
            </div>
            <Progress
              value={monitoringData.resources.disk.percentage}
              className='h-2'
            />
            <div className='space-y-1'>
              <p className='text-xs text-muted-foreground'>
                {monitoringData.resources.disk.used.toFixed(2)}GB /{' '}
                {monitoringData.resources.disk.total.toFixed(2)}GB
              </p>
              <div className='grid grid-cols-2 gap-2 text-xs'>
                <div>
                  <div className='font-medium'>
                    {formatBytes(
                      monitoringData.resources.disk.used * 1024 * 1024 * 1024,
                    )}
                  </div>
                  <div className='text-muted-foreground'>Used</div>
                </div>
                <div>
                  <div className='font-medium'>
                    {formatBytes(
                      (monitoringData.resources.disk.total -
                        monitoringData.resources.disk.used) *
                        1024 *
                        1024 *
                        1024,
                    )}
                  </div>
                  <div className='text-muted-foreground'>Free</div>
                </div>
              </div>
            </div>
            {latestStats?.stats && (
              <div className='mt-2 grid grid-cols-2 gap-2 text-xs'>
                <div>
                  <div className='font-medium'>
                    {formatBytes((latestStats.stats.dr || 0) * 1024 * 1024)}/s
                  </div>
                  <div className='text-muted-foreground'>Disk Read</div>
                </div>
                <div>
                  <div className='font-medium'>
                    {formatBytes((latestStats.stats.dw || 0) * 1024 * 1024)}/s
                  </div>
                  <div className='text-muted-foreground'>Disk Write</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DefaultCurrentResourceUsage
