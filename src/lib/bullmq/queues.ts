import { Queue } from 'bullmq'

import { redis } from './redis'

export type QueueStats = {
  name: string
  counts: Record<string, number>
}

const BULL_PREFIX = 'bull'

export async function listAll(): Promise<string[]> {
  const r = redis()
  const stream = r.scanStream({ match: `${BULL_PREFIX}:*:id`, count: 1000 })
  const names = new Set<string>()
  return await new Promise<string[]>((resolve, reject) => {
    stream.on('data', (keys: string[]) => {
      for (const k of keys) {
        const [, qname] = k.split(':')
        if (qname) names.add(qname)
      }
    })
    stream.on('end', () => resolve([...names]))
    stream.on('error', reject)
  })
}

export async function listServer(serverId: string): Promise<string[]> {
  const prefix = `server-${serverId}`
  const r = redis()
  const stream = r.scanStream({
    match: `${BULL_PREFIX}:${prefix}*:id`,
    count: 1000,
  })
  const names = new Set<string>()
  return await new Promise<string[]>((resolve, reject) => {
    stream.on('data', (keys: string[]) => {
      for (const k of keys) {
        const [, qname] = k.split(':')
        if (qname && qname.startsWith(prefix)) names.add(qname)
      }
    })
    stream.on('end', () => resolve([...names]))
    stream.on('error', reject)
  })
}

export async function getStats(names: string[]): Promise<QueueStats[]> {
  const r = redis()
  return Promise.all(
    names.map(async name => {
      const q = new Queue(name, { connection: r })
      const counts = await q.getJobCounts(
        'waiting',
        'active',
        'delayed',
        'completed',
        'failed',
        'paused',
        'waiting-children',
        'prioritized',
      )
      await q.close()
      return { name, counts }
    }),
  )
}

export async function flush(
  names: string[],
  opts: { force?: boolean } = {},
): Promise<string[]> {
  const r = redis()
  for (const name of names) {
    const q = new Queue(name, { connection: r })
    await q.obliterate({ force: opts.force ?? false })
    await q.close()
  }
  return names
}

export async function flushSingle(
  queueName: string,
  opts: { force?: boolean } = {},
): Promise<void> {
  const r = redis()
  const q = new Queue(queueName, { connection: r })
  await q.obliterate({ force: opts.force ?? true })
  await q.close()
}
