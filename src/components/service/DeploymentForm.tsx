'use client'

import { Button } from '../ui/button'
import { Ban, Database, DatabaseBackup, RefreshCcw, Rocket } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { createDeploymentAction } from '@/actions/deployment'
import { restartServiceAction, stopServerAction } from '@/actions/service'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Service } from '@/payload-types'
import { useDisableDeploymentContext } from '@/providers/DisableDeployment'

const Deploy = ({ service }: { service: Service }) => {
  const { deployments } = service

  const params = useParams<{ id: string; serviceId: string }>()
  const [showRedeploymentDialog, setShowRedeploymentDialog] = useState(false)
  const [cacheOption, setCacheOption] = useState<'no-cache' | 'cache'>(
    'no-cache',
  )
  const router = useRouter()
  const { disable: deploymentDisabled } = useDisableDeploymentContext()

  const { execute: createDeployment, isPending } = useAction(
    createDeploymentAction,
    {
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
    },
  )

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
    <>
      <Button
        disabled={isPending || disabled || deploymentDisabled}
        isLoading={isPending}
        onClick={() => {
          // once app is deployed user should select with or without cache for deployment
          if (deploymentSucceed) {
            setShowRedeploymentDialog(true)
            return
          }

          if (disabled) {
            toast.warning('Please attach all git-provider details to deploy')
          } else {
            createDeployment({
              serviceId: params.serviceId,
              projectId: params.id,
            })
          }
        }}>
        <Rocket />
        {deploymentSucceed ? 'Redeploy' : 'Deploy'}
      </Button>

      <Dialog
        open={showRedeploymentDialog}
        onOpenChange={setShowRedeploymentDialog}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Redeployment</DialogTitle>
            <DialogDescription>
              Select an option for redeployment of app
            </DialogDescription>
          </DialogHeader>

          <RadioGroup
            className='gap-2'
            defaultValue={cacheOption}
            onValueChange={value =>
              setCacheOption(value as 'no-cache' | 'cache')
            }>
            <div className='has-data-[state=checked]:border-primary/50 shadow-xs relative flex w-full items-start gap-2 rounded-md border border-input p-4 outline-none'>
              <RadioGroupItem
                value='no-cache'
                id='no-cache'
                className='order-1 after:absolute after:inset-0'
              />
              <div className='flex grow items-start gap-3'>
                <DatabaseBackup size={20} className='text-info' />

                <div className='grid grow gap-2'>
                  <Label htmlFor='no-cache'>Without cache</Label>

                  <p className='text-xs text-muted-foreground'>
                    This will redeploy your app by creating or pulling docker
                    image
                  </p>
                </div>
              </div>
            </div>

            <div className='has-data-[state=checked]:border-primary/50 shadow-xs relative flex w-full items-start gap-2 rounded-md border border-input p-4 outline-none'>
              <RadioGroupItem
                value='cache'
                id='cache'
                className='order-1 after:absolute after:inset-0'
              />
              <div className='flex grow items-start gap-3'>
                <Database size={20} className='text-success' />

                <div className='grid grow gap-2'>
                  <Label htmlFor='cache'>Use existing cache</Label>
                  <p className='text-xs text-muted-foreground'>
                    This will redeploy your app using the existing docker image
                  </p>
                </div>
              </div>
            </div>
          </RadioGroup>

          <DialogFooter>
            <Button
              type='submit'
              onClick={() => {
                createDeployment({
                  serviceId: params.serviceId,
                  projectId: params.id,
                  cache: cacheOption,
                })

                setShowRedeploymentDialog(false)
              }}>
              Redeploy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

const DeploymentForm = ({ service }: { service: Service }) => {
  const { deployments } = service
  const { disable: deploymentDisabled } = useDisableDeploymentContext()

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
      onError: ({ error }) => {
        toast.error(`Failed to restart: ${error?.serverError}`)
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
      onError: ({ error }) => {
        toast.error(`Failed to stop: ${error?.serverError}`)
      },
    },
  )

  const noDeployments = deployments?.docs?.length === 0

  return (
    <div className='mt-6 flex gap-x-2 md:mt-0'>
      <Deploy service={service} />

      <Button
        disabled={isRestartingService || deploymentDisabled}
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
        disabled={isStoppingServer || deploymentDisabled}
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
