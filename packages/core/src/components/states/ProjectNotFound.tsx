'use client'

import { ArrowLeft, FolderX } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { Button } from '@dflow/core/components/ui/button'

interface ProjectNotFoundProps {
  message?: string
}

const ProjectNotFound = ({
  message = "The project you're looking for doesn't exist or may have been deleted.",
}: ProjectNotFoundProps = {}) => {
  const router = useRouter()
  const { organisation } = useParams<{ organisation: string }>()

  useEffect(() => {
    toast.error(message)
  }, [message])

  return (
    <div className='bg-muted/10 rounded-2xl border p-8 text-center shadow-xs'>
      <div className='grid min-h-[40vh] place-items-center'>
        <div className='max-w-md space-y-4 text-center'>
          <div className='bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
            <FolderX className='text-muted-foreground h-8 w-8' />
          </div>
          <h2 className='text-2xl font-semibold'>Project Not Found</h2>
          <p className='text-muted-foreground'>
            The project you&apos;re looking for doesn&apos;t exist or may have
            been deleted. Please check the URL or return to your projects list.
          </p>
          <Button
            onClick={() => router.push(`/${organisation}/dashboard`)}
            className='mt-4'>
            <ArrowLeft className='h-4 w-4' />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProjectNotFound
