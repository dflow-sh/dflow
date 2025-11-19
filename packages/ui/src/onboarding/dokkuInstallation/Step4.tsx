import { AlertCircle, CircleCheck, RotateCcw } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { installMonitoringToolsAction } from '@/actions/beszel'
import Loader from '@/components/Loader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ServerType } from '@/payload-types-overrides'

import { useDokkuInstallationStep } from './DokkuInstallationStepContext'

const Step4 = ({ server }: { server: ServerType }) => {
  const {
    dokkuInstallationStep,
    setDokkuInstallationStep,
    monitoringInstalled,
    setMonitoringInstalled,
  } = useDokkuInstallationStep()

  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { execute, isPending, hasSucceeded, result } = useAction(
    installMonitoringToolsAction,
    {
      onError: ({ error }) => {
        // Handle both configuration errors and installation failures
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
            setMonitoringInstalled(true)
            setDokkuInstallationStep(5)
            return
          }

          const servicesCreated = data.servicesCreated || 0
          const servicesUpdated = data.servicesUpdated || 0
          const totalServicesDeployed = servicesCreated + servicesUpdated

          if (totalServicesDeployed > 0) {
            let deploymentMsg = []
            if (servicesCreated > 0)
              deploymentMsg.push(`${servicesCreated} new`)
            if (servicesUpdated > 0)
              deploymentMsg.push(`${servicesUpdated} updated`)

            toast.success(
              `Monitoring tools installed successfully! ${deploymentMsg.join(', ')} services deployed.`,
            )
          } else {
            toast.success(
              'Monitoring tools verified - all services already up to date.',
            )
          }

          setMonitoringInstalled(true)
          setDokkuInstallationStep(5)
        } else {
          // Handle case where monitoring installation failed
          const errorMsg = data?.error || 'Monitoring installation failed'

          if (errorMsg.includes('Missing Beszel config')) {
            toast.warning(
              'Monitoring skipped: Environment not properly configured',
            )
            setMonitoringInstalled(true)
            setDokkuInstallationStep(5)
          } else if (errorMsg.includes('already installed')) {
            toast.info('Monitoring tools are already installed')
            setMonitoringInstalled(true)
            setDokkuInstallationStep(5)
          } else {
            setErrorMessage(errorMsg)
            setHasError(true)
            toast.error(errorMsg)
          }
        }
      },
    },
  )

  const handleRetry = () => {
    setHasError(false)
    setErrorMessage('')
    execute({ serverId: server.id })
  }

  useEffect(() => {
    if (
      dokkuInstallationStep === 4 &&
      !monitoringInstalled &&
      !isPending &&
      !hasError
    ) {
      execute({ serverId: server.id })
    }
  }, [
    dokkuInstallationStep,
    server.id,
    monitoringInstalled,
    isPending,
    hasError,
    execute,
  ])

  return (
    <div className='space-y-4'>
      {isPending ? (
        <div className='flex items-center gap-2'>
          <Loader className='h-max w-max' /> Installing monitoring tools...
        </div>
      ) : monitoringInstalled ? (
        <div className='flex items-center gap-2'>
          <CircleCheck size={24} className='text-primary' />
          Monitoring tools installed
        </div>
      ) : hasError ? (
        <div className='space-y-3'>
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              Monitoring installation failed: {errorMessage}
            </AlertDescription>
          </Alert>
          <Button
            onClick={handleRetry}
            disabled={isPending}
            variant='outline'
            size='sm'
            className='flex items-center gap-2'>
            <RotateCcw size={16} />
            Retry Installation
          </Button>
        </div>
      ) : dokkuInstallationStep === 4 ? (
        <div className='flex items-center gap-2 text-muted-foreground'>
          <Loader className='h-max w-max' /> Preparing to install monitoring
          tools...
        </div>
      ) : null}
    </div>
  )
}

export default Step4
