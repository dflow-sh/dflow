import { type Processor, Worker } from 'bullmq'

import { redis } from "@core/lib/bullmq/redis"

const workers = new Map<string, Worker>()

export function getWorker<T = any>(name: string, processor: Processor<T>) {
  if (workers.has(name)) return workers.get(name) as Worker<T>
  const w = new Worker<T>(name, processor, { connection: redis() })
  workers.set(name, w)
  return w
}

export async function closeWorker(name: string) {
  const w = workers.get(name)
  if (w) {
    await w.close()
    workers.delete(name)
  }
}
