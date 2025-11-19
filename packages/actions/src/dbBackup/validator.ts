import { z } from 'zod'

export const internalDBBackupSchema = z.object({
  serviceId: z.string(),
})

export const internalRestoreSchema = z.object({
  serviceId: z.string(),
  backupId: z.string(),
})

export const internalDbDeleteScheme = z.object({
  serviceId: z.string(),
  backupId: z.string(),
  databaseType: z.string().optional(),
  databaseName: z.string().optional(),
})
