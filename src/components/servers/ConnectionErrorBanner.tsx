import { TriangleAlert } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

const ConnectionErrorBanner = ({ serverName }: { serverName?: string }) => {
  return (
    <Alert
      variant={'destructive'}
      className='relative overflow-hidden border-0 shadow-lg'>
      <div className='mb-3 flex items-center gap-4'>
        <span className='rounded-full bg-destructive/20 p-3'>
          <TriangleAlert className='h-5 w-5 text-destructive' />
        </span>
        <div>
          <AlertTitle className='text-lg font-bold'>
            Connection Issue Detected
          </AlertTitle>
          <div className='text-sm text-muted-foreground'>
            {serverName ? `"${serverName}"` : 'Your server'} could not be
            connected after multiple attempts.
          </div>
        </div>
        <Badge variant='destructive' className='ml-auto'>
          Action Required
        </Badge>
      </div>
      <AlertDescription>
        <div className='mb-3 space-y-2 text-sm'>
          <p>
            We were unable to establish a connection to your server after 30
            attempts. This could be due to:
          </p>
          <ul className='list-disc space-y-1 pl-6 text-xs'>
            <li>Network connectivity issues</li>
            <li>Server configuration problems</li>
            <li>SSH key or authentication issues</li>
            <li>Temporary infrastructure problems</li>
          </ul>
        </div>
        <div className='border-t pt-2 text-xs text-muted-foreground'>
          <span>
            Please{' '}
            <a
              href='mailto:support@dflow.sh'
              className='text-primary underline hover:text-primary/80'>
              contact our support team
            </a>{' '}
            for assistance. We'll help you diagnose and resolve the issue.
          </span>
        </div>
      </AlertDescription>
    </Alert>
  )
}

export default ConnectionErrorBanner
