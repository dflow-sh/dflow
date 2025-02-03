import { z } from 'zod'

export const createDatabaseInputSchema = z.object({
  dbName: z
    .string()
    .min(3, 'Database name must be at least 3 characters long')
    .max(63, 'Database name cannot exceed 63 characters')
    .regex(
      /^[a-z0-9-_]+$/,
      'Database name can only contain lowercase letters, numbers, hyphens, and underscores'
    )
    .transform(val => val.toLowerCase()),
})

export type CreateDatabaseInput = z.infer<typeof createDatabaseInputSchema>
