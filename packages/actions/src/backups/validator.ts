import { z } from 'zod'

export const dokkuBackupSchema = z.object({
  serverId: z.string().min(1),
})
