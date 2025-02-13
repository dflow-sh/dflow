'use client'

import { Button } from '../ui/button'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

import { createDeploymentAction } from '@/actions/deployment'

const DeploymentForm = () => {
  const params = useParams<{ id: string; serviceId: string }>()
  const { execute, isPending } = useAction(createDeploymentAction, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.success('Successfully triggered deployment')
      }
    },
  })

  return (
    <div className='space-y-4 rounded border p-4'>
      <h3 className='text-lg font-semibold'>Deploy Settings</h3>

      <div className='flex w-full'>
        <Button
          disabled={isPending}
          onClick={() => {
            execute({ serviceId: params.serviceId, projectId: params.id })
          }}>
          Deploy
        </Button>
      </div>
    </div>
  )
}

export default DeploymentForm
