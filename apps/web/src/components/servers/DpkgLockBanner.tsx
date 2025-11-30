import { Lock } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

const DpkgLockBanner = ({ serverName }: { serverName?: string }) => {
  return (
    <Alert
      variant='warning'
      className='relative overflow-hidden border-0 shadow-lg'>
      <div className='mb-3 flex items-center gap-4'>
        <span className='rounded-full bg-secondary p-3'>
          <Lock className='h-5 w-5 text-primary' />
        </span>
        <div>
          <AlertTitle className='text-lg font-bold'>dpkg is Locked</AlertTitle>
          <div className='text-sm text-muted-foreground'>
            {serverName ? `"${serverName}"` : 'Your server'} is currently
            running a package operation. Please wait for it to finish.
          </div>
        </div>
        <Badge variant='secondary' className='ml-auto'>
          Locked
        </Badge>
      </div>
      <AlertDescription>
        <ul className='mb-3 list-disc space-y-1 pl-6 text-xs'>
          <li>System package manager (dpkg) is currently locked.</li>
          <li>Wait for any ongoing installations or updates to complete.</li>
          <li>Refresh this page after a few minutes to check again.</li>
        </ul>
        <div className='border-t pt-2 text-xs text-muted-foreground'>
          Tip: If this message persists, check for running package operations on
          your server or contact your system administrator.
        </div>
      </AlertDescription>
    </Alert>
  )
}

export default DpkgLockBanner
