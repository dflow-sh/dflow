import { LucideIcon } from 'lucide-react'
import { JSX, SVGProps } from 'react'
import { z } from 'zod'

import { supportedPluginsSchema } from '@/actions/plugin/validator'

import {
  Letsencrypt,
  MariaDB,
  MongoDB,
  MySQL,
  PostgreSQL,
  RabbitMQ,
  Redis,
} from './icons'

export type PluginType = {
  label: string
  value: z.infer<typeof supportedPluginsSchema>
  icon: LucideIcon | ((props: SVGProps<SVGSVGElement>) => JSX.Element)
}

export const plugins: {
  [key in 'database' | 'domain' | 'messageQueue']: PluginType[]
} = {
  database: [
    {
      label: 'Postgres',
      value: 'postgres',
      icon: PostgreSQL,
    },
    {
      label: 'MySQL',
      value: 'mysql',
      icon: MySQL,
    },
    {
      label: 'MongoDB',
      value: 'mongo',
      icon: MongoDB,
    },
    {
      label: 'MariaDB',

      value: 'mariadb',
      icon: MariaDB,
    },
    {
      label: 'Redis',

      value: 'redis',
      icon: Redis,
    },
  ],
  domain: [
    {
      label: 'Letsencrypt',
      value: 'letsencrypt',
      icon: Letsencrypt,
    },
  ],
  messageQueue: [
    {
      label: 'RabbitMQ',
      value: 'rabbitMQ',
      icon: RabbitMQ,
    },
  ],
} as const
