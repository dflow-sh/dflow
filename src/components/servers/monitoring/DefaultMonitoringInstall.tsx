'use client'

import {
  BarChart3,
  CheckCircle,
  Loader2,
  Shield,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { defaultMonitoring } from '@/lib/default-monitoring'

interface DefaultMonitoringInstallProps {
  serverId: string
  onInstallComplete?: () => void
}

const DefaultMonitoringInstall = ({
  serverId,
  onInstallComplete,
}: DefaultMonitoringInstallProps) => {
  const [isInstalling, setIsInstalling] = useState(false)

  const handleInstall = async () => {
    setIsInstalling(true)
    try {
      const response = await defaultMonitoring.enableDefaultMonitoring(serverId)
      if (response.success) {
        toast.success('Default monitoring enabled successfully')
        onInstallComplete?.()
      } else {
        toast.error('Failed to enable default monitoring')
      }
    } catch (error) {
      toast.error('Failed to enable default monitoring')
    } finally {
      setIsInstalling(false)
    }
  }

  return (
    <Card className='border-2 border-dashed border-primary/20 bg-primary/5'>
      <CardHeader className='pb-4 text-center'>
        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'>
          <TrendingUp className='h-8 w-8 text-primary' />
        </div>

        <CardTitle className='text-xl'>Enable Default Monitoring</CardTitle>
        <CardDescription className='text-base'>
          Get started with essential server monitoring and alerting
        </CardDescription>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Features */}
        <div className='grid gap-4 md:grid-cols-3'>
          <div className='space-y-2 text-center'>
            <div className='mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600'>
              <BarChart3 className='h-5 w-5' />
            </div>
            <h4 className='font-medium'>Real-time Metrics</h4>
            <p className='text-sm text-muted-foreground'>
              CPU, memory, disk, and network monitoring
            </p>
          </div>

          <div className='space-y-2 text-center'>
            <div className='mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600'>
              <Shield className='h-5 w-5' />
            </div>
            <h4 className='font-medium'>Smart Alerts</h4>
            <p className='text-sm text-muted-foreground'>
              Customizable thresholds and notifications
            </p>
          </div>

          <div className='space-y-2 text-center'>
            <div className='mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600'>
              <Zap className='h-5 w-5' />
            </div>
            <h4 className='font-medium'>Quick Setup</h4>
            <p className='text-sm text-muted-foreground'>
              Ready in seconds with zero configuration
            </p>
          </div>
        </div>

        {/* What's Included */}
        <div className='rounded-lg border bg-card p-4'>
          <h4 className='mb-3 flex items-center gap-2 font-medium'>
            <CheckCircle className='h-4 w-4 text-green-500' />
            What's Included
          </h4>

          <div className='grid gap-2 text-sm'>
            <div className='flex items-center gap-2'>
              <div className='h-1.5 w-1.5 rounded-full bg-green-500' />
              System resource monitoring (CPU, RAM, Disk)
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-1.5 w-1.5 rounded-full bg-green-500' />
              Service status tracking
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-1.5 w-1.5 rounded-full bg-green-500' />
              Network traffic monitoring
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-1.5 w-1.5 rounded-full bg-green-500' />
              Configurable alert thresholds
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-1.5 w-1.5 rounded-full bg-green-500' />
              Email notifications (optional)
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-1.5 w-1.5 rounded-full bg-green-500' />
              30-day data retention
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className='flex flex-wrap justify-center gap-2'>
          <Badge variant='secondary'>No Additional Software</Badge>
          <Badge variant='secondary'>Lightweight</Badge>
          <Badge variant='secondary'>Always Free</Badge>
          <Badge variant='secondary'>Instant Setup</Badge>
        </div>

        {/* Install Button */}
        <div className='text-center'>
          <Button
            onClick={handleInstall}
            disabled={isInstalling}
            size='lg'
            className='w-full md:w-auto'>
            {isInstalling ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Enabling Monitoring...
              </>
            ) : (
              <>
                <TrendingUp className='mr-2 h-4 w-4' />
                Enable Default Monitoring
              </>
            )}
          </Button>

          <p className='mt-2 text-xs text-muted-foreground'>
            Takes less than 10 seconds to set up
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default DefaultMonitoringInstall
