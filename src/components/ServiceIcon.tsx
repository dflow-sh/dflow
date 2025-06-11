import { Github } from 'lucide-react'
import { JSX, SVGProps } from 'react'

import { cn } from '@/lib/utils'
import { Service } from '@/payload-types'

import { Docker, MariaDB, MongoDB, MySQL, PostgreSQL, Redis } from './icons'

export type StatusType =
  | NonNullable<NonNullable<Service['databaseDetails']>['type']>
  | 'app'
  | 'docker'

const iconMapping: {
  [key in StatusType]: (props: SVGProps<SVGSVGElement>) => JSX.Element
} = {
  postgres: PostgreSQL,
  mariadb: MariaDB,
  mongo: MongoDB,
  mysql: MySQL,
  redis: Redis,
  app: props => <Github {...props} />,
  docker: Docker,
}

const ServiceIcon = ({
  type,
  className = '',
}: {
  type: StatusType
  className?: string
}) => {
  const Icon = iconMapping[type]

  return <Icon className={cn('size-4', className)} />
}

export default ServiceIcon
