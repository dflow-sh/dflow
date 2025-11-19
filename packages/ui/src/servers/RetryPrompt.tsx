'use client'

import { TriangleAlert } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

const RetryPrompt: React.FC = () => {
  const router = useRouter()

  const handleRetry = () => {
    router.refresh()
  }

  return (
    <Alert variant='destructive'>
      <TriangleAlert className='h-4 w-4' />
      <AlertTitle>Connection Error</AlertTitle>
      <AlertDescription className='flex w-full flex-col justify-between gap-2 md:flex-row'>
        <p>
          Failed to connect via SSH. Please check your server details and try
          again.
        </p>
        <Button onClick={handleRetry} className='mt-2'>
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  )
}

export default RetryPrompt
