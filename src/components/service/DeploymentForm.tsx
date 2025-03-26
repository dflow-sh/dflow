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

  const { deployments } = service
  const deploymentList = deployments?.docs
    ? deployments.docs.filter(deployment => typeof deployment !== 'string')
    : []
  const deploymentSucceed = deploymentList.some(
    deployment => deployment.status === 'success',
  )

  return (
    <div className='mt-6 flex gap-x-2 md:mt-0'>
      {deploymentSucceed && service.type === 'database' ? null : (
        <Button
          disabled={isPending}
          onClick={() => {
            execute({ serviceId: params.serviceId, projectId: params.id })
          }}>
          <Rocket />
          Deploy
        </Button>
      )}

      {/* <Button
          disabled={isRestartingService}
          variant='outline'
          onClick={() => {
            restartService({ id: service.id })
          }}>
          <Hammer />
          Rebuild
        </Button> */}

      <Button
        disabled={isRestartingService}
        variant='secondary'
        onClick={() => {
          restartService({ id: service.id })
        }}>
        <RefreshCcw />
        Restart
      </Button>

      <Button
        disabled={isStoppingServer}
        onClick={() => {
          stopServer({ id: service.id })
        }}
        variant='destructive'>
        <Ban />
        Stop
      </Button>
    </div>
  )
}

export default DeploymentForm
