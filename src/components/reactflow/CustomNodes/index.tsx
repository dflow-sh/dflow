import { ServiceNode } from '../types'
import { Handle, Position } from '@xyflow/react'
import { formatDistanceToNow } from 'date-fns'
import { Clock, Database, Github } from 'lucide-react'
import { JSX } from 'react'

import {
  Docker,
  MariaDB,
  MongoDB,
  MySQL,
  PostgreSQL,
  Redis,
} from '@/components/icons'
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Service } from '@/payload-types'

const CustomNode = ({
  data,
}: {
  data: ServiceNode & { onClick?: () => void }
}) => {
  const icon: { [key in ServiceNode['type']]: JSX.Element } = {
    app: <Github className='size-6' />,
    database: <Database className='size-6 text-destructive' />,
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

  return (
    <Card onClick={data?.onClick} className='h-full min-h-36 backdrop-blur-md'>
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
      <CardHeader className='w-64 flex-row justify-between'>
        <div className='flex items-center gap-x-3'>
          {data.type === 'database' && data.databaseDetails?.type
            ? databaseIcons[data?.databaseDetails?.type]
            : icon[data.type]}

          <div className='flex-1 items-start'>
            <CardTitle>{data.name}</CardTitle>
          </div>
        </div>
      </CardHeader>

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
