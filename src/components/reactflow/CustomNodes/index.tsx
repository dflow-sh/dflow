import { ServiceNode } from '../types'
import { Handle, Position } from '@xyflow/react'
import { formatDistanceToNow } from 'date-fns'
import {
  AlertCircle,
  CircleCheckBig,
  CircleDashed,
  CircleX,
  Clock,
  Database,
  Hammer,
  Package2,
} from 'lucide-react'
import { JSX } from 'react'

import {
  Bitbucket,
  Docker,
  Git,
  GitLab,
  Gitea,
  Github,
  MariaDB,
  MicrosoftAzure,
  MongoDB,
  MySQL,
  PostgreSQL,
  Redis,
} from '@/components/icons'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Service } from '@/payload-types'
import { useArchitectureContext } from '@/providers/ArchitectureProvider'

const icon: { [key in ServiceNode['type']]: JSX.Element } = {
  app: <Git className='size-6' />,
  database: <Database className='size-6' />,
  docker: <Docker className='size-6' />,
}

type StatusType = NonNullable<NonNullable<Service['databaseDetails']>['type']>

const databaseIcons: {
  [key in StatusType]: JSX.Element
} = {
  postgres: <PostgreSQL className='size-6' />,
  mariadb: <MariaDB className='size-6' />,
  mongo: <MongoDB className='size-6' />,
  mysql: <MySQL className='size-6' />,
  redis: <Redis className='size-6' />,
}

const ProviderTypeIcons: {
  [key in NonNullable<Service['providerType']>]: JSX.Element
} = {
  github: <Github className='size-6' />,
  gitlab: <GitLab className='size-6' />,
  bitbucket: <Bitbucket className='size-6' />,
  azureDevOps: <MicrosoftAzure className='size-6' />,
  gitea: <Gitea className='size-6' />,
}

const statusMapping = {
  building: { status: 'info', icon: <Hammer /> },
  queued: { status: 'warning', icon: <Clock /> },
  success: { status: 'success', icon: <CircleCheckBig /> },
  failed: { status: 'destructive', icon: <CircleX /> },
} as const

const CustomNode = ({
  data,
  menuOptions,
}: {
  data: ServiceNode & { onClick?: () => void; disableNode?: boolean }
  menuOptions?: (node: any) => React.ReactNode
}) => {
  const deployment = data?.deployments?.[0]
  const createdAt = data?.createdAt
  const isDisabled = !!data.disableNode

  const architectureContext = function useSafeArchitectureContext() {
    try {
      return useArchitectureContext()
    } catch (e) {
      return null
    }
  }

  const DeploymentBadge = () => {
    if (deployment) {
      return (
        <Badge
          variant={statusMapping[deployment.status].status}
          className='gap-1 capitalize [&_svg]:size-4'>
          {statusMapping[deployment.status].icon}
          {deployment.status}
        </Badge>
      )
    }

    if (createdAt && !deployment) {
      return (
        <Badge variant='secondary' className='gap-1 capitalize [&_svg]:size-4'>
          <CircleDashed />
          No deployment
        </Badge>
      )
    }

    return null
  }

  return (
    <div className='w-64 cursor-pointer'>
      <Handle
        type='source'
        style={{
          opacity: 0,
          width: 10,
          height: 10,
          pointerEvents: 'none',
        }}
        position={Position.Left}
      />

      <Card
        onClick={() => {
          if (architectureContext()?.isDeploying || isDisabled) {
            return
          }

          data?.onClick?.()
        }}
        className={`relative z-10 h-full min-h-36 backdrop-blur-md ${
          isDisabled
            ? 'cursor-not-allowed'
            : 'cursor-pointer hover:border-primary/50 hover:bg-primary/5 hover:shadow-md'
        }`}>
        {menuOptions && menuOptions(data)}
        <CardHeader className='w-64 flex-row justify-between pb-2'>
          <div className='flex items-center gap-x-3'>
            {data.type === 'database' && data.databaseDetails?.type
              ? databaseIcons[data?.databaseDetails?.type]
              : data.type === 'app' && data?.providerType
                ? ProviderTypeIcons[data?.providerType]
                : icon[data.type]}

            <div className='flex-1 items-start'>
              <CardTitle className='line-clamp-1' title={data.name}>
                {data.displayName ? data.displayName : data.name}
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className='pb-3'>
          {isDisabled && (
            <div className='mb-1 flex items-center gap-2 rounded-md bg-muted px-2 py-1 text-sm text-muted-foreground'>
              <AlertCircle size={16} />
              <span>Node disabled</span>
            </div>
          )}
          <DeploymentBadge />
        </CardContent>

        <CardFooter>
          {data?.createdAt && (
            <time className='flex items-center gap-1.5 text-sm text-muted-foreground'>
              <Clock size={14} />
              {`Created ${formatDistanceToNow(new Date(data?.createdAt), {
                addSuffix: true,
              })}`}
            </time>
          )}
        </CardFooter>
      </Card>
      {data.volumes && data.volumes.length > 0 && (
        <div className='z-0 -mt-6 w-full items-start gap-x-2 rounded-md border bg-muted/30 px-2 pb-2 pt-8 text-sm text-muted-foreground backdrop-blur-sm'>
          <div className='flex items-center justify-between gap-x-2'>
            <div className='inline-flex items-center gap-x-2 overflow-hidden'>
              <span className='flex-shrink-0'>
                <Package2 size={16} />
              </span>

              <span className='truncate break-all'>
                {data.volumes[0].containerPath}
              </span>
            </div>

            {data.volumes.length > 1 && (
              <span className='justify-end whitespace-nowrap text-primary-foreground'>
                +{data.volumes.length - 1}
              </span>
            )}
          </div>
        </div>
      )}

      <Handle
        type='target'
        style={{
          opacity: 0,
          width: 10,
          height: 10,
          pointerEvents: 'none',
        }}
        position={Position.Right}
      />
    </div>
  )
}

export default CustomNode
