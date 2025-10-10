import { ShieldAlert } from 'lucide-react'

import { Alert, AlertDescription } from './ui/alert'
import { Button } from './ui/button'

const AccessDeniedAlert = ({
  error,
  className,
  onRetry,
}: {
  error: string
  className?: string
  onRetry?: () => void
}) => {
  return (
    <Alert variant={'destructive'}>
      <div className='flex items-center gap-4'>
        <div className='bg-destructive/10 rounded-full p-3'>
          <ShieldAlert className='h-6 w-6' />
        </div>
        <div className='flex-1 space-y-3'>
          <AlertDescription className='text-base'>{error}</AlertDescription>
          {onRetry && (
            <Button onClick={onRetry} variant='outline' size='sm'>
              Try Again
            </Button>
          )}
        </div>
      </div>
    </Alert>
  )
}

export default AccessDeniedAlert
