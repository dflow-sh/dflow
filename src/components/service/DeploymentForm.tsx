'use client'

import { Button } from '../ui/button'
import { Ban, RefreshCcw, Rocket } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { createDeploymentAction } from '@/actions/deployment'
import { restartServiceAction, stopServerAction } from '@/actions/service'
import { Service } from '@/payload-types'

const DeploymentForm = ({ service }: { service: Service }) => {
  const params = useParams<{ id: string; serviceId: string }>()
  const router = useRouter()
  const { deployments } = service

  const { execute, isPending } = useAction(createDeploymentAction, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.info('Deployment Queued', {
          description: 'Added service to deployment queue',
        })

        if (data?.redirectURL) {
          router.push(data?.redirectURL)
        }
      }
    },
    onError: ({ error }) => {
      console.log({ error })
      toast.error(`Failed to trigger deployment: ${error.serverError}`)
    },
  })

  const { execute: restartService, isPending: isRestartingService } = useAction(
    restartServiceAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.info('Added to queue', {
            description: `Added restarting ${service.type === 'database' ? 'database' : 'app'} to queue`,
          })
        }
      },
    },
  )

  const { execute: stopServer, isPending: isStoppingServer } = useAction(
    stopServerAction,
    {
      onSuccess: ({ data }) => {
        if (data) {
          toast.info('Added to queue', {
            description: `Added stopping ${service.type === 'database' ? 'database' : 'app'} to queue`,
          })
        }
      },
    },
  )

  const Deploy = () => {
    const deploymentList = deployments?.docs
      ? deployments.docs.filter(deployment => typeof deployment !== 'string')
      : []
    const deploymentSucceed = deploymentList.some(
      deployment => deployment.status === 'success',
    )

    // For database services, we don't want to show the deploy button if the last deployment was successful
    if (deploymentSucceed && service.type === 'database') {
      return null
    }

    // Adding disabled state for deploy button
    // 1. if service is app
    // 2. if git provider is not set
    // 3. if git provider is github and branch, owner, repository are not set
    const disabled =
      service.type === 'app' &&
      (!service.providerType ||
        (service?.providerType === 'github' &&
          (!service?.githubSettings?.branch ||
            !service?.githubSettings?.owner ||
            !service?.githubSettings?.repository)))

    return (
      <Button
        disabled={isPending}
        onClick={() => {
          if (disabled) {
            toast.warning('Please attach all git-provider details to deploy')
          } else {
            execute({ serviceId: params.serviceId, projectId: params.id })
          }
        }}>
        <Rocket />
        {deploymentSucceed ? 'Redeploy' : 'Deploy'}
      </Button>
    )
  }

  const noDeployments = deployments?.docs?.length === 0

  return (
    <div className='mt-6 flex gap-x-2 md:mt-0'>
      <Deploy />

      <Button
        disabled={isRestartingService}
        variant='secondary'
        onClick={() => {
          if (noDeployments) {
            toast.warning('Please deploy the service before restarting')
          } else {
            restartService({ id: service.id })
          }
        }}>
        <RefreshCcw />
        Restart
      </Button>

      <Button
        disabled={isStoppingServer}
        onClick={() => {
          if (noDeployments) {
            toast.warning('Please deploy the service before stopping')
          } else {
            stopServer({ id: service.id })
          }
        }}
        variant='destructive'>
        <Ban />
        Stop
      </Button>
    </div>
  )
}

export default DeploymentForm
