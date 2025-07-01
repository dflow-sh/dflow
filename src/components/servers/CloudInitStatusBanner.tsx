import { Cloud, Loader2 } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const CloudInitStatusBanner = ({
  cloudInitStatus,
}: {
  cloudInitStatus?: string
}) => {
  if (cloudInitStatus !== 'running') return null

  return (
    <Alert>
      <div className='mb-2 flex items-center gap-3'>
        <Cloud className='h-5 w-5 text-primary' />
        <AlertTitle>Server Initialization Running</AlertTitle>
        <Badge variant='secondary' className='ml-auto'>
          In Progress
        </Badge>
      </div>
      <AlertDescription>
        <div className='flex flex-col space-y-4'>
          <div className='flex items-center gap-3'>
            <Loader2 className='h-5 w-5 animate-spin text-primary' />
            <span className='text-base font-medium text-foreground'>
              Cloud-init is configuring your server...
            </span>
          </div>

          <Progress value={40} className='h-2' />

          <div className='text-sm text-muted-foreground'>
            <p className='mb-2 font-medium text-foreground'>Current tasks:</p>
            <ul className='list-disc space-y-1 pl-4 text-xs'>
              <li>Installing system packages and dependencies</li>
              <li>Configuring network and security settings</li>
              <li>Setting up SSH keys and user accounts</li>
              <li>Applying Tailscale configuration</li>
            </ul>
          </div>

          <div className='border-t pt-2'>
            <p className='text-sm font-medium'>Estimated time: 2-5 minutes</p>
            <p className='mt-1 text-xs text-muted-foreground'>
              <span className='font-semibold'>Tip:</span> You can safely refresh
              this page or click the refresh button to check for updates.
              Actions will be available once initialization is complete.
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}

export default CloudInitStatusBanner
