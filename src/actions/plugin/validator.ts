import { z } from 'zod'

export const supportedPluginsSchema = z.enum([
  'postgres',
  'mysql',
  'mongo',
  'mariadb',
  'redis',
  'letsencrypt',
  'rabbitMQ',
])

export const installPluginSchema = z.object({
  serverId: z.string(),
  plugin: supportedPluginsSchema,
})

export const syncPluginSchema = z.object({
  serverId: z.string(),
})

export const togglePluginStatusSchema = installPluginSchema.extend({
  enabled: z.boolean(),
})
