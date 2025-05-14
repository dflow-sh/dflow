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
  Github,
  Hammer,
} from 'lucide-react'
import { JSX } from 'react'

import {
  Docker,
  MariaDB,
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
  app: <Github className='size-6' />,
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

const statusMapping = {
  building: { status: 'info', icon: <Hammer /> },
  queued: { status: 'warning', icon: <Clock /> },
  success: { status: 'success', icon: <CircleCheckBig /> },
  failed: { status: 'destructive', icon: <CircleX /> },
} as const

const CustomNode = ({
  data,
}: {
  data: ServiceNode & { onClick?: () => void; disableNode?: boolean }
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
    <Card
      onClick={() => {
        if (architectureContext()?.isDeploying || isDisabled) {
          return
        }

        data?.onClick?.()
      }}
      className={`h-full min-h-36 cursor-pointer backdrop-blur-md ${
        isDisabled
          ? 'cursor-not-allowed'
          : 'cursor-pointer hover:border-primary/50 hover:bg-primary/5 hover:shadow-md'
      }`}>
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

      <CardHeader className='w-64 flex-row justify-between pb-2'>
        <div className='flex items-center gap-x-3'>
          {data.type === 'database' && data.databaseDetails?.type
            ? databaseIcons[data?.databaseDetails?.type]
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

      {data?.createdAt && (
        <CardFooter>
          <time className='flex items-center gap-1.5 text-sm text-muted-foreground'>
            <Clock size={14} />
            {`Created ${formatDistanceToNow(new Date(data?.createdAt), {
              addSuffix: true,
            })}`}
          </time>
        </CardFooter>
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
    </Card>
  )
}

export default CustomNode
