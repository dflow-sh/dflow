import * as queues from './queues'
import { redis } from './redis'
import * as workers from './workers'

export const bullmq = {
  queues,
  workers,
  redis,
}

export default bullmq
