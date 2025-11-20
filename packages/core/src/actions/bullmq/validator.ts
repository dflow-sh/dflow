import { z } from 'zod'

export const getServerQueuesStatsSchema = z.object({
  serverId: z.string(),
})

export const flushServerQueuesSchema = z.object({
  serverId: z.string(),
  force: z.boolean().optional(),
})

export const flushSingleQueueSchema = z.object({
  queueName: z.string(),
  force: z.boolean().optional(),
})
