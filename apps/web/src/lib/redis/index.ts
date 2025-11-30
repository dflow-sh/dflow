// lib/redis.js - Enhanced Redis Connection Setup
import type { DefaultJobOptions } from 'bullmq'
import { env } from 'env'
import Redis, { RedisOptions } from 'ioredis'

// Redis connection options with better defaults
const redisOptions: RedisOptions = {
  enableReadyCheck: false,
  retryStrategy(times) {
    // Exponential backoff with max 10 second delay
    const delay = Math.min(Math.pow(2, times) * 1000, 10000)
    return delay
  },
  // Connection timeout after 5 seconds
  connectTimeout: 5000,
  maxRetriesPerRequest: null,
}

export const jobOptions: DefaultJobOptions = {
  removeOnComplete: {
    age: 3600,
    count: 20,
  },
}

// Create a function to generate new connections
export const createRedisClient = () =>
  new Redis(env.REDIS_URI + '?family=0', redisOptions)

// Connection for BullMQ queue operations
export const queueConnection = createRedisClient()

// Dedicated connection for subscriptions
export const sub = createRedisClient()

// Dedicated connection for publishing
export const pub = createRedisClient()

// Graceful shutdown helper
export async function closeRedisConnections() {
  console.log('Closing Redis connections...')
  await Promise.all([queueConnection.quit(), sub.quit(), pub.quit()])
  console.log('Redis connections closed')
}
