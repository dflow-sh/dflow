import { z } from 'zod'

import { supportedPluginsSchema } from '@/actions/plugin/validator'

export type PluginListType = {
  value: z.infer<typeof supportedPluginsSchema>
  githubURL: string
  category: 'database' | 'domain' | 'messageQueue'
  hasConfig?: boolean
}

export const pluginList: PluginListType[] = [
  {
    category: 'database',
    value: 'mongo',
    githubURL: 'https://github.com/dokku/dokku-mongo.git',
  },
  {
    category: 'database',
    value: 'postgres',
    githubURL: 'https://github.com/dokku/dokku-postgres.git',
  },
  {
    category: 'database',
    value: 'mariadb',
    githubURL: 'https://github.com/dokku/dokku-mariadb.git',
  },
  {
    category: 'database',
    value: 'redis',
    githubURL: 'https://github.com/dokku/dokku-redis.git',
  },
  {
    category: 'database',
    value: 'mysql',
    githubURL: 'https://github.com/dokku/dokku-mysql.git',
  },
  {
    category: 'domain',
    value: 'letsencrypt',
    githubURL: 'https://github.com/dokku/dokku-letsencrypt.git',
    hasConfig: true,
  },
  {
    category: 'messageQueue',
    value: 'rabbitmq',
    githubURL: 'https://github.com/dokku/dokku-rabbitmq.git',
  },
]
