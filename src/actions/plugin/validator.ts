import { z } from 'zod'

export const supportedPluginsSchema = z.enum([
  'postgres',
  'mysql',
  'mongo',
  'mariadb',
  'redis',
  'letsencrypt',
  'rabbitmq',
])

export const installPluginSchema = z.object({
  serverId: z.string(),
  pluginName: supportedPluginsSchema,
  pluginURL: z.string(),
})

export const syncPluginSchema = z.object({
  serverId: z.string(),
})

export const togglePluginStatusSchema = z.object({
  serverId: z.string(),
  pluginName: supportedPluginsSchema,
  pluginURL: z.string(),
  enabled: z.boolean(),
})

export const configureLetsencryptPluginSchema = z.object({
  email: z
    .string()
    .email({
      message: 'Email is invalid',
    })
    .optional(),
  autoGenerateSSL: z.boolean().default(false),
  serverId: z.string(),
})
