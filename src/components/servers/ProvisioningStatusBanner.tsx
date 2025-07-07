import { Cloud } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const BannerBase = ({
  icon,
  title,
  subtitle,
  progress,
  tasks,
  footer,
  progressValue,
  progressLabel,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  progress: boolean
  tasks: string[]
  footer: React.ReactNode
  progressValue?: number
  progressLabel?: string
}) => (
  <Alert
    variant={'info'}
    className='relative overflow-hidden border-0 shadow-lg'>
    <div className='mb-3 flex items-center gap-4'>
      <span className='rounded-full bg-secondary p-3'>{icon}</span>
      <div>
        <AlertTitle className='text-lg font-bold'>{title}</AlertTitle>
        <div className='text-sm text-muted-foreground'>{subtitle}</div>
      </div>
      <Badge variant='secondary' className='ml-auto'>
        In Progress
      </Badge>
    </div>
    <AlertDescription>
      {progress && (
        <div className='mb-3'>
          <Progress value={progressValue} />
          {progressLabel && (
            <div className='mt-1 text-right text-xs text-muted-foreground'>
              {progressLabel}
            </div>
          )}
        </div>
      )}
      <ul className='mb-3 list-disc space-y-1 pl-6 text-xs'>
        {tasks.map((task, i) => (
          <li key={i}>{task}</li>
        ))}
      </ul>
      <div className='border-t pt-2 text-xs text-muted-foreground'>
        {footer}
      </div>
    </AlertDescription>
  </Alert>
)

const ProvisioningStatusBanner = ({
  attempts,
  maxAttempts = 30,
  message,
  serverName,
}: {
  attempts: number
  maxAttempts?: number
  message?: string
  serverName?: string
}) => {
  const percent = Math.round(((attempts + 1) / maxAttempts) * 100)
  return (
    <BannerBase
      icon={<Cloud className='h-5 w-5 text-primary' />}
      title='Provisioning Server'
      subtitle={
        message ||
        `${serverName ? `"${serverName}"` : 'Your dFlow server'} is being provisioned. This may take a few minutes.`
      }
      progress={true}
      tasks={[
        'Waiting for server to become ready',
        'Polling for public IP and hostname',
        'Preparing for initial connection',
      ]}
      footer={
        <>
          <span className='font-medium'>
            Attempt {attempts + 1} of {maxAttempts}
          </span>
          <span className='ml-2'>
            Tip: You can safely refresh this page or click the refresh button to
            check for updates. Actions will be available once provisioning is
            complete.
          </span>
        </>
      }
      progressValue={percent}
      progressLabel={`${percent}%`}
    />
  )
}

export default ProvisioningStatusBanner
