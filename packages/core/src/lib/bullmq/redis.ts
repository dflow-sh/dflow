import { keys as env } from '@core/keys';
import Redis, { type Redis as IORedisType } from 'ioredis'

let redisSingleton: IORedisType | null = null

export function redis(): IORedisType {
  if (!redisSingleton) {
    redisSingleton = new Redis(env.REDIS_URI)
  }
  return redisSingleton
}
