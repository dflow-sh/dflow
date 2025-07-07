import { Cloud } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

const BannerBase = ({
  icon,
  title,
  subtitle,
  tasks,
  footer,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  tasks: string[]
  footer: React.ReactNode
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
  ...props
}: {
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
        `${serverName ? `"${serverName}"` : 'Your dFlow server'} is being provisioned. This may take a few minutes.`
      }
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
      {...props}
    />
  )
}

export default ProvisioningBanner
