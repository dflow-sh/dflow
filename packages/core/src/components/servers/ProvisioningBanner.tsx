import { Cloud } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from "@core/components/ui/alert"
import { Badge } from "@core/components/ui/badge"
import { Progress } from "@core/components/ui/progress"

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
  progress?: boolean
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
                <div className='animate-progress absolute inset-0 w-1/2 bg-linear-to-r from-transparent via-primary to-transparent' />
              </div>
              <div className='mt-1 animate-pulse text-right text-xs text-muted-foreground'>
                Provisioning...
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

const ProvisioningBanner = ({
  serverName,
  title = 'Server Provisioning',
  subtitle,
  tasks = [
    'Creating virtual machine instance',
    'Allocating resources and storage',
    'Configuring network settings',
    'Polling for public IP and hostname',
    'Preparing for initial connection',
  ],
  footer,
  progress = true,
  progressValue,
  progressLabel,
  ...props
}: {
  serverName?: string
  title?: string
  subtitle?: string
  tasks?: string[]
  footer?: React.ReactNode
  progress?: boolean
  progressValue?: number
  progressLabel?: string
  [key: string]: any
}) => {
  return (
    <BannerBase
      icon={<Cloud className='h-5 w-5 text-primary' />}
      title={title}
      subtitle={
        subtitle ||
        `${serverName ? `"${serverName}"` : 'Your dFlow server'} is being provisioned. This may take a few minutes.`
      }
      progress={progress}
      tasks={tasks}
      footer={
        footer || (
          <span>
            Tip: You can safely refresh this page or click the refresh button to
            check for updates. Actions will be available once provisioning is
            complete.
          </span>
        )
      }
      progressValue={progressValue}
      progressLabel={progressLabel}
      {...props}
    />
  )
}

export default ProvisioningBanner
