'use server'

import bullmq from "@core/lib/bullmq/index"
import { userClient } from "@core/lib/safe-action"

import {
  flushServerQueuesSchema,
  flushSingleQueueSchema,
  getServerQueuesStatsSchema,
} from "@core/actions/bullmq/validator"

/**
 * Get queues and their stats for a server.
 * This combines listing queues and getting their statistics in one action.
 */
export const getServerQueuesAction = userClient
  .metadata({ actionName: 'getServerQueues' })
  .inputSchema(getServerQueuesStatsSchema)
  .action(async ({ clientInput }) => {
    const { serverId } = clientInput

    try {
      const queues = await bullmq.queues.listServer(serverId)
      const stats = await bullmq.queues.getStats(queues)

      return { success: true, queues, stats }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

/**
 * Flush all queues for the server.
 * Normal flush (force=false): Only removes completed and failed jobs
 * Force flush (force=true): Removes all jobs including waiting, active, and delayed
 */
export const flushServerQueuesAction = userClient
  .inputSchema(flushServerQueuesSchema)
  .metadata({ actionName: 'flushServerQueues' })
  .action(async ({ clientInput }) => {
    const { serverId, force = false } = clientInput

    try {
      const queueNames = await bullmq.queues.listServer(serverId)
      await bullmq.queues.flush(queueNames, { force })

      return {
        success: true,
        message: force
          ? 'All jobs have been forcefully removed from all queues'
          : 'Completed and failed jobs have been removed from all queues',
      }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

/**
 * Flush a single queue.
 * Normal flush (force=false): Only removes completed and failed jobs
 * Force flush (force=true): Removes all jobs including waiting, active, and delayed
 */
export const flushSingleQueueAction = userClient
  .inputSchema(flushSingleQueueSchema)
  .metadata({ actionName: 'flushSingleQueue' })
  .action(async ({ clientInput }) => {
    const { queueName, force = false } = clientInput

    try {
      await bullmq.queues.flushSingle(queueName, { force })

      return {
        success: true,
        message: force
          ? `All jobs have been forcefully removed from queue "${queueName}"`
          : `Completed and failed jobs have been removed from queue "${queueName}"`,
      }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })
