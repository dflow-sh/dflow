import type { TaskConfig } from 'payload'

export interface ActivityCleanupConfig {
  cronTime?: string
  queueName?: string
  olderThan?: number // milliseconds
}

const DEFAULT_OLDER_THAN = 7776000000 // 90 days in milliseconds
const DEFAULT_CRON = '0 3 * * *' // At 03:00 AM daily
export const DEFAULT_QUEUE_NAME = 'activity-cleanup'

export const createActivityCleanupTask = (
  config: ActivityCleanupConfig = {},
): TaskConfig<'activity-cleanup'> => {
  const cronTime = config.cronTime ?? DEFAULT_CRON
  const queueName = config.queueName ?? DEFAULT_QUEUE_NAME
  const olderThan = config.olderThan ?? DEFAULT_OLDER_THAN

  return {
    slug: 'activity-cleanup',
    label: 'dFlow Activity Cleanup',
    schedule: [
      {
        cron: cronTime,
        queue: queueName,
      },
    ],
    handler: async ({ req }) => {
      const millisecondsAgo = new Date(Date.now() - olderThan)

      try {
        await req.payload.delete({
          collection: 'activity',
          where: {
            createdAt: {
              less_than: millisecondsAgo.toISOString(),
            },
          },
        })

        req.payload.logger.info(
          `Activity cleanup completed. Deleted records older than ${new Date(millisecondsAgo).toISOString()}`,
        )

        return {
          output: {
            success: true,
            cutoffDate: millisecondsAgo.toISOString(),
            retentionDays: Math.round(olderThan / (1000 * 60 * 60 * 24)),
          },
        }
      } catch (error) {
        req.payload.logger.error(
          `Error during activity cleanup task: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )

        return {
          output: {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        }
      }
    },
  }
}
