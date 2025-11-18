'use client'

import { Plus, Server } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

import { Button } from '@dflow/components/ui/button'

const DashboardServersEmptyState = () => {
  const router = useRouter()
  const { organisation } = useParams<{ organisation: string }>()

  return (
    <div className='bg-muted/10 rounded-2xl border p-8 text-center shadow-xs'>
      <div className='grid min-h-[40vh] place-items-center'>
        <div className='max-w-md space-y-4 text-center'>
          <div className='bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
            <Server className='text-muted-foreground h-8 w-8 animate-pulse' />
          </div>
          <h2 className='text-2xl font-semibold'>No Servers Available</h2>
          <p className='text-muted-foreground text-balance'>
            You need at least one server to get started. Add a server to deploy
            your projects.
          </p>
          <Button
            variant='default'
            onClick={() =>
              router.push(`/${organisation}/servers/add-new-server`)
            }>
            <Plus />
            Create Server
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DashboardServersEmptyState
