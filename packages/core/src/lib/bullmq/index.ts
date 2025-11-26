import * as queues from "@core/lib/bullmq/queues"
import { redis } from "@core/lib/bullmq/redis"
import * as workers from "@core/lib/bullmq/workers"

export const bullmq = {
  queues,
  workers,
  redis,
}

export default bullmq
