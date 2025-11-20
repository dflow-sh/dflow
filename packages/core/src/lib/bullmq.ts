import { Processor, Queue, Worker } from 'bullmq'
import Redis from 'ioredis'

import { log } from '@/lib/logger'

const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV

// Async logging wrapper to avoid blocking queue operations
const logAsync = (logFn: () => void) => {
  if (isDev) {
    // Sync in development for better debugging
    logFn()
  } else {
    // Truly non-blocking in production for performance
    process.nextTick(() => {
      try {
        logFn()
      } catch (error) {
        // Silent fail to avoid disrupting queue operations
      }
    })
  }
}

// caching queues & workers in memory
export const workers = new Map<string, Worker>()
export const queues = new Map<string, Queue>()
export const getQueue = ({
  name,
  connection,
}: {
  name: string
  connection: Redis
}) => {
  const queue = queues.get(name)

  if (queue) {
    return queue
  }

  const newQueue = new Queue(name, {
    connection,
    defaultJobOptions: {
      removeOnComplete: {
        count: 20,
        age: 60 * 60,
      },
    },
  })

  logAsync(() => {
    log.info('BullMQ queue created', {
      component: 'bullmq',
      queue: name,
      event: 'queue-created',
    })
  })

  newQueue.on('waiting', (job: any) => {
    logAsync(() => {
      log.info('Job added to queue', {
        component: 'bullmq',
        queue: name,
        jobId: job.id,
        jobName: job.name,
        event: 'job-added',
      })
    })
  })

  newQueue.on('error', (err: Error) => {
    logAsync(() => {
      log.error('Queue error', {
        component: 'bullmq',
        queue: name,
        event: 'queue-error',
        error: err.message,
        timestamp: new Date().toISOString(),
      })
    })
  })

  queues.set(name, newQueue)
  return newQueue
}

export const getWorker = <T = any>({
  name,
  processor,
  connection,
}: {
  name: string
  processor: Processor<T>
  connection: Redis
}) => {
  const worker = workers.get(name)

  if (worker) {
    return worker as Worker<T>
  }

  const newWorker = new Worker<T>(name, processor, {
    connection,
  })

  logAsync(() => {
    log.info('BullMQ worker created', {
      component: 'bullmq',
      queue: name,
      event: 'worker-created',
    })
  })

  newWorker.on('ready', () => {
    logAsync(() => {
      log.info('Worker ready', {
        component: 'bullmq',
        queue: name,
        event: 'worker-ready',
        timestamp: new Date().toISOString(),
      })
    })
  })

  newWorker.on('active', (job: any) => {
    logAsync(() => {
      log.debug('Job started processing', {
        component: 'bullmq',
        queue: name,
        jobId: job.id,
        jobName: job.name,
        event: 'job-active',
        timestamp: new Date().toISOString(),
      })
    })
  })

  newWorker.on('completed', (job: any, result: any) => {
    logAsync(() => {
      const endTime = Date.now()
      const duration = job.processedOn ? endTime - job.processedOn : undefined

      log.info('Job completed successfully', {
        component: 'bullmq',
        queue: name,
        jobId: job.id,
        jobName: job.name,
        event: 'job-completed',
        duration,
        timestamp: new Date().toISOString(),
      })
    })
  })

  newWorker.on('failed', (job: any, err: Error) => {
    logAsync(() => {
      const endTime = Date.now()
      const duration = job?.processedOn ? endTime - job.processedOn : undefined

      log.error('Job failed', {
        component: 'bullmq',
        queue: name,
        jobId: job?.id,
        jobName: job?.name,
        event: 'job-failed',
        error: err.message,
        stack: err.stack,
        duration,
        timestamp: new Date().toISOString(),
      })
    })
  })

  newWorker.on('stalled', (job: any) => {
    logAsync(() => {
      log.warn('Job stalled (stuck processing)', {
        component: 'bullmq',
        queue: name,
        jobId: job.id,
        jobName: job.name,
        event: 'job-stalled',
        timestamp: new Date().toISOString(),
      })
    })
  })

  newWorker.on('error', (err: Error) => {
    logAsync(() => {
      log.error('Worker error', {
        component: 'bullmq',
        queue: name,
        event: 'worker-error',
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
      })
    })
  })

  newWorker.on('closed', () => {
    logAsync(() => {
      log.info('Worker closed', {
        component: 'bullmq',
        queue: name,
        event: 'worker-closed',
        timestamp: new Date().toISOString(),
      })
    })
  })

  workers.set(name, newWorker)
  return newWorker
}

const closeWorker = async (queueName: string) => {
  const worker = workers.get(queueName)

  if (worker) {
    try {
      await worker.close()
      workers.delete(queueName)

      logAsync(() => {
        log.info('Worker closed successfully', {
          component: 'bullmq',
          queue: queueName,
          event: 'worker-cleanup',
        })
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'

      logAsync(() => {
        log.error('Error closing worker', {
          component: 'bullmq',
          queue: queueName,
          event: 'worker-cleanup-error',
          error: errorMessage,
        })
      })
    }
  }
}

export const closeQueue = async (queueName: string) => {
  // Close worker first
  await closeWorker(queueName)

  // Close queue
  const queue = queues.get(queueName)
  if (queue) {
    try {
      await queue.close()
      queues.delete(queueName)

      logAsync(() => {
        log.info('Queue closed successfully', {
          component: 'bullmq',
          queue: queueName,
          event: 'queue-cleanup',
        })
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'

      logAsync(() => {
        log.error('Error closing queue', {
          component: 'bullmq',
          queue: queueName,
          event: 'queue-cleanup-error',
          error: errorMessage,
        })
      })
    }
  }
}

const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`)

  try {
    // Close all BullMQ resources
    console.log('Closing all BullMQ workers, queues and schedulers...')
    for (const queueName of queues.keys()) {
      await closeQueue(queueName) // this calls both closeWorker and closeQueue
    }

    console.log('Graceful shutdown completed.')
    process.exit(0)
  } catch (error) {
    console.error('Error during graceful shutdown:', error)
    process.exit(1)
  }
}

// on server termination closing the bullmq resources!
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
