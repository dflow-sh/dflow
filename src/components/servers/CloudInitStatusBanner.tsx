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
          {progressValue !== undefined ? (
            <>
              <Progress value={progressValue} />
              {progressLabel && (
                <div className='mt-1 text-right text-xs text-muted-foreground'>
                  {progressLabel}
                </div>
              )}
            </>
          ) : (
            <>
              <div className='relative h-2 w-full overflow-hidden rounded-full bg-primary/20'>
                <div className='animate-progress absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent' />
              </div>
              <div className='mt-1 animate-pulse text-right text-xs text-muted-foreground'>
                Initializing...
              </div>
            </>
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

const CloudInitStatusBanner = ({
  cloudInitStatus,
  serverName,
  title = 'Server Initialization Running',
  subtitle,
  tasks = [
    'Installing system packages and dependencies',
    'Configuring network and security settings',
    'Setting up SSH keys and user accounts',
    'Applying Tailscale configuration',
  ],
  footer,
  ...props
}: {
  cloudInitStatus: string
  serverName?: string
  title?: string
  subtitle?: string
  tasks?: string[]
  footer?: React.ReactNode
  [key: string]: any
}) => {
  return (
    <BannerBase
      icon={<Cloud className='h-5 w-5 text-primary' />}
      title={title}
      subtitle={
        subtitle ||
        `${serverName ? `"${serverName}"` : 'Your server'} is being initialized. This may take a few minutes.`
      }
      progress={true}
      tasks={tasks}
      footer={
        footer || (
          <span>
            Tip: You can safely refresh this page or click the refresh button to
            check for updates. Actions will be available once initialization is
            complete.
          </span>
        )
      }
      progressValue={undefined}
      progressLabel={undefined}
      {...props}
    />
  )
}

export default CloudInitStatusBanner
