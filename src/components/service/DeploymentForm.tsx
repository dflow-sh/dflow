'use client'

import { Button } from '../ui/button'
import { Ban, RefreshCcw } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

import { createDeploymentAction } from '@/actions/deployment'
import { restartDatabaseAction, stopDatabaseAction } from '@/actions/service'
import { Service } from '@/payload-types'

const DeploymentForm = ({ service }: { service: Service }) => {
  const params = useParams<{ id: string; serviceId: string }>()
  const { execute, isPending } = useAction(createDeploymentAction, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.info('Deployment Queued', {
          description: 'Added service to deployment queue',
        })
      }
    },
  })

  const { execute: restartDatabase, isPending: isRestartingDatabase } =
    useAction(restartDatabaseAction, {
      onSuccess: ({ data }) => {
        if (data) {
          toast.info('Added to queue', {
            description: 'Added restarting database to queue',
          })
        }
      },
    })

  const { execute: stopDatabase, isPending: isStoppingDatabase } = useAction(
    stopDatabaseAction,
    {
      onSuccess: ({ data }) => {
        if (data) {
          toast.info('Added to queue', {
            description: 'Added stopping database to queue',
          })
        }
      },
    },
  )

  return (
    <div className='space-y-4 rounded bg-muted/30 p-4'>
      <h3 className='text-lg font-semibold'>Deploy Settings</h3>

      <div className='flex w-full gap-2'>
        <Button
          disabled={isPending}
          onClick={() => {
            execute({ serviceId: params.serviceId, projectId: params.id })
          }}>
          Deploy
        </Button>

        {service.type === 'database' ? (
          <>
            <Button
              disabled={isRestartingDatabase}
              variant='secondary'
              onClick={() => {
                restartDatabase({ id: service.id })
              }}>
              <RefreshCcw />
              Restart
            </Button>

            <Button
              disabled={isStoppingDatabase}
              onClick={() => {
                stopDatabase({ id: service.id })
              }}
              variant='destructive'>
              <Ban />
              Stop
            </Button>
          </>
        ) : null}
      </div>
    </div>
  )
}

export default DeploymentForm
