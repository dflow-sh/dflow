import { env } from 'env'
import Redis from 'ioredis'

// Connection for BullMQ queue operations
export const queueConnection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})

// Dedicated connection for subscriptions
export const sub = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})

// Dedicated connection for publishing
export const pub = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})
