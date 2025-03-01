'use client'

import { Button } from '../ui/button'
import { Ban, RefreshCcw } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

import { createDeploymentAction } from '@/actions/deployment'
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

  return (
    <div className='space-y-4 rounded border p-4'>
      <h3 className='text-lg font-semibold'>Deploy Settings</h3>

      <div className='flex w-full gap-2'>
        <Button
          disabled={isPending}
          onClick={() => {
            execute({ serviceId: params.serviceId, projectId: params.id })
          }}>
          Deploy
        </Button>

        <Button disabled={isPending} variant='secondary'>
          <RefreshCcw />
          Restart
        </Button>

        <Button disabled={isPending} variant='destructive'>
          <Ban />
          Stop
        </Button>
      </div>
    </div>
  )
}

export default DeploymentForm
