'use client'

import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  Loader2,
  RotateCcw,
  Shield,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'
import { toast } from 'sonner'

import { installMonitoringToolsAction } from '@/actions/beszel'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface DefaultMonitoringInstallProps {
  serverId: string
  onInstallComplete?: (data?: {
    servicesCreated?: number
    servicesUpdated?: number
  }) => void
}

const DefaultMonitoringInstall = ({
  serverId,
  onInstallComplete,
}: DefaultMonitoringInstallProps) => {
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isInstalled, setIsInstalled] = useState(false)

  const { execute, isPending, hasSucceeded } = useAction(
    installMonitoringToolsAction,
    {
      onError: ({ error }) => {
        const errorMsg = error?.serverError || 'Unknown error occurred'
        setErrorMessage(errorMsg)
        setHasError(true)
        toast.error(`Monitoring installation failed: ${errorMsg}`)
      },
      onSuccess: ({ data }) => {
        setHasError(false)
        setErrorMessage('')

        if (data?.success) {
          // Handle already installed case
          if (data.alreadyInstalled) {
            toast.success('Monitoring tools are already installed and running!')
            setIsInstalled(true)
            onInstallComplete?.(data)
            return
          }

          const servicesDeployed =
            (data.servicesCreated || 0) + (data.servicesUpdated || 0)

          if (servicesDeployed > 0) {
            const createdMsg = data.servicesCreated
              ? `${data.servicesCreated} new services`
              : ''
            const updatedMsg = data.servicesUpdated
              ? `${data.servicesUpdated} updated services`
              : ''
            const deploymentMsg = [createdMsg, updatedMsg]
              .filter(Boolean)
              .join(', ')

            toast.success(
              `Monitoring tools installed successfully! Deployed: ${deploymentMsg}.`,
            )
          } else {
            toast.success(
              'Monitoring tools verified - all services already up to date.',
            )
          }

          setIsInstalled(true)
          onInstallComplete?.(data)
        } else {
          const errorMsg = data?.error || 'Monitoring installation failed'

          // Handle specific error cases
          if (errorMsg.includes('Missing Beszel config')) {
            toast.warning(
              'Cannot install monitoring: Environment not properly configured',
            )
            setErrorMessage('Environment configuration required')
            setHasError(true)
          } else if (errorMsg.includes('already installed')) {
            toast.info('Monitoring tools are already installed')
            setIsInstalled(true)
            onInstallComplete?.(data)
          } else {
            setErrorMessage(errorMsg)
            setHasError(true)
            toast.error(errorMsg)
          }
        }
      },
    },
  )

  const handleInstall = () => {
    setHasError(false)
    setErrorMessage('')
    execute({ serverId })
  }

  const handleRetry = () => {
    setHasError(false)
    setErrorMessage('')
    execute({ serverId })
  }

  if (isInstalled) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <div className='flex items-center justify-center gap-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-success/20'>
              <CheckCircle className='h-6 w-6 text-success' />
            </div>
            <div>
              <h3 className='font-semibold'>Monitoring Enabled</h3>
              <p className='text-sm text-muted-foreground'>
                Your server is now being monitored
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
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
            <div className='mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-success/20'>
              <BarChart3 className='h-5 w-5 text-success' />
            </div>
            <h4 className='font-medium'>Real-time Metrics</h4>
            <p className='text-sm text-muted-foreground'>
              CPU, memory, disk, and network monitoring
            </p>
          </div>

          <div className='space-y-2 text-center'>
            <div className='mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-info/20'>
              <Shield className='h-5 w-5 text-info' />
            </div>
            <h4 className='font-medium'>Smart Alerts</h4>
            <p className='text-sm text-muted-foreground'>
              Customizable thresholds and notifications
            </p>
          </div>

          <div className='space-y-2 text-center'>
            <div className='mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20'>
              <Zap className='h-5 w-5 text-primary' />
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
            <CheckCircle className='h-4 w-4 text-success' />
            What's Included
          </h4>

          <div className='grid gap-2 text-sm'>
            <div className='flex items-center gap-2'>
              <div className='h-1.5 w-1.5 rounded-full bg-success' />
              System resource monitoring (CPU, RAM, Disk)
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-1.5 w-1.5 rounded-full bg-success' />
              Service status tracking
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-1.5 w-1.5 rounded-full bg-success' />
              Network traffic monitoring
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-1.5 w-1.5 rounded-full bg-success' />
              Configurable alert thresholds
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-1.5 w-1.5 rounded-full bg-success' />
              Email notifications (optional)
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-1.5 w-1.5 rounded-full bg-success' />
              30-day data retention
            </div>
          </div>
        </div>

        {/* Error State */}
        {hasError && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              Monitoring installation failed: {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Benefits */}
        <div className='flex flex-wrap justify-center gap-2'>
          <Badge variant='secondary'>No Additional Software</Badge>
          <Badge variant='secondary'>Lightweight</Badge>
          <Badge variant='secondary'>Always Free</Badge>
          <Badge variant='secondary'>Instant Setup</Badge>
        </div>

        {/* Install/Retry Button */}
        <div className='space-y-2 text-center'>
          {hasError ? (
            <Button
              onClick={handleRetry}
              disabled={isPending}
              variant='outline'
              size='lg'
              className='w-full md:w-auto'>
              {isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Retrying...
                </>
              ) : (
                <>
                  <RotateCcw className='mr-2 h-4 w-4' />
                  Retry Installation
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleInstall}
              disabled={isPending}
              size='lg'
              className='w-full md:w-auto'>
              {isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Installing Monitoring...
                </>
              ) : (
                <>
                  <TrendingUp className='mr-2 h-4 w-4' />
                  Enable Default Monitoring
                </>
              )}
            </Button>
          )}

          <p className='text-xs text-muted-foreground'>
            {isPending
              ? 'This may take a few moments...'
              : 'Takes less than 10 seconds to set up'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default DefaultMonitoringInstall
