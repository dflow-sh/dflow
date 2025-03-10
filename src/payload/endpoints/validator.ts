import { z } from 'zod'

export const databaseUpdateSchema = z.union([
  z.object({
    type: z.literal('database.update'),
    data: z.object({
      serviceId: z.string(),
      connectionUrl: z.string().optional(),
      username: z.string().optional(),
      password: z.string().optional(),
      host: z.string().optional(),
      port: z.string().optional(),
      status: z.enum(['running', 'missing', 'exited']).optional(),
      version: z.string().optional(),
      exposePorts: z.array(z.string()).optional(),
    }),
  }),
  z.object({
    type: z.literal('database.delete'),
  }),
  z.object({
    type: z.literal('plugin.update'),
    data: z.object({
      serverId: z.string(),
      plugins: z.array(
        z.object({
          name: z.string(),
          status: z.enum(['enabled', 'disabled']),
          version: z.string(),
        }),
      ),
    }),
  }),
  z.object({
    type: z.literal('domain.update'),
    data: z.object({
      serviceId: z.string(),
      domain: z.object({
        domain: z.string(),
        operation: z.enum(['add', 'remove', 'set']),
        autoRegenerateSSL: z.boolean(),
        certificateType: z.enum(['letsencrypt', 'none']),
      }),
    }),
  }),
])

export type DatabaseUpdateSchemaType = z.infer<typeof databaseUpdateSchema>
