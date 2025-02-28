import { z } from 'zod'

// connectionUrl?: string
// username?: string
// password?: string
// host?: string
// port?: string
// status?: string
// version?: string

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
      status: z.enum(['running', 'missing']).optional(),
      version: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal('database.delete'),
  }),
])

export type DatabaseUpdateSchemaType = z.infer<typeof databaseUpdateSchema>

// export type DatabaseUpdateType = Extract<
//   DatabaseEvent,
//   { type: 'database.update' }
// >
