'use client'

import { Plus, Server } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

import { Button } from '@dflow/components/ui/button'

const ServersEmptyState = () => {
  const router = useRouter()
  const { organisation } = useParams<{ organisation: string }>()

  return (
    <div className='bg-muted/10 rounded-2xl border p-8 text-center shadow-xs'>
      <div className='grid min-h-[40vh] place-items-center'>
        <div>
          <div className='bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
            <Server className='text-muted-foreground h-8 w-8 animate-pulse' />
          </div>

          <div className='my-4'>
            <h3 className='text-foreground text-xl font-semibold'>
              No Servers Added
            </h3>
            <p className='text-muted-foreground text-base'>
              Get started by adding your first server.
            </p>
          </div>

          <Button
            className='mt-2'
            onClick={() =>
              router.push(`/${organisation}/servers/add-new-server`)
            }>
            <Plus className='h-4 w-4' />
            Add Your First Server
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ServersEmptyState
