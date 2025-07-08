import { Processor, Queue, Worker } from 'bullmq'
import Redis from 'ioredis'

import { log } from '@/lib/logger'

import { getUserContext } from './userContext'

const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV

// Async logging wrapper to avoid blocking queue operations
const logAsync = (logFn: () => void) => {
  if (isDev) {
    logFn()
  } else {
    process.nextTick(logFn)
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
    log.info(`Queue ${name} created`, { queue: name })
  })

  newQueue.on('waiting', (job: any) => {
    // Get user context to include in logs
    const userContext = getUserContext()

    logAsync(() => {
      log.info(
        `Job ${job.id} added to queue ${name} by ${userContext.userName}`,
        {
          jobId: job.id,
          queue: name,
          ...userContext, // Include user context (userId, userEmail, userName)
        },
      )
    })
  })

  newQueue.on('error', (err: Error) => {
    // Get user context to include in logs
    const userContext = getUserContext()

    logAsync(() => {
      log.error(`Queue ${name} error: ${err.message}`, {
        queue: name,
        error: err.message,
        stack: err.stack,
        ...userContext, // Include user context
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
    return worker
  }

  const newWorker = new Worker<T>(name, processor, {
    connection,
  })

  logAsync(() => {
    log.info(`Worker ${name} created`, { worker: name })
  })

  newWorker.on('ready', () => {
    // Get user context to include in logs
    const userContext = getUserContext()

    logAsync(() => {
      log.info(`Worker ${name} ready`, {
        worker: name,
        ...userContext, // Include user context
      })
    })
  })

  newWorker.on('active', (job: any) => {
    // Get user context to include in logs
    const userContext = getUserContext()

    logAsync(() => {
      log.info(`Job ${job.id} started processing on ${name}`, {
        jobId: job.id,
        worker: name,
        ...userContext, // Include user context
      })
    })
  })

  newWorker.on('completed', (job: any, result: any) => {
    // Get user context to include in logs
    const userContext = getUserContext()

    logAsync(() => {
      log.info(`Job ${job.id} completed on ${name}`, {
        jobId: job.id,
        worker: name,
        result: typeof result === 'object' ? JSON.stringify(result) : result,
        ...userContext, // Include user context
      })
    })
  })

  newWorker.on('failed', (job: any, err: Error) => {
    // Get user context to include in logs
    const userContext = getUserContext()

    logAsync(() => {
      log.error(`Job ${job?.id} failed on ${name}: ${err.message}`, {
        jobId: job?.id,
        worker: name,
        error: err.message,
        stack: err.stack,
        ...userContext, // Include user context
      })
    })
  })

  newWorker.on('stalled', (job: any) => {
    // Get user context to include in logs
    const userContext = getUserContext()

    logAsync(() => {
      log.warn(`Job ${job.id} stalled on ${name}`, {
        jobId: job.id,
        worker: name,
        ...userContext, // Include user context
      })
    })
  })

  newWorker.on('error', (err: Error) => {
    // Get user context to include in logs
    const userContext = getUserContext()

    logAsync(() => {
      log.error(`Worker ${name} error: ${err.message}`, {
        worker: name,
        error: err.message,
        stack: err.stack,
        ...userContext, // Include user context
      })
    })
  })

  newWorker.on('closed', () => {
    // Get user context to include in logs
    const userContext = getUserContext()

    logAsync(() => {
      log.info(`Worker ${name} closed`, {
        worker: name,
        ...userContext, // Include user context
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
  logAsync(() =>
    log.info(`\n${signal} received. Starting graceful shutdown...`),
  )

  try {
    // Close all BullMQ resources
    logAsync(() =>
      log.info('Closing all BullMQ workers, queues and schedulers...'),
    )
    for (const queueName of queues.keys()) {
      await closeQueue(queueName) // this calls both closeWorker and closeQueue
    }

    logAsync(() => log.info('Graceful shutdown completed.'))
    process.exit(0)
  } catch (error) {
    logAsync(() => log.error('Error during graceful shutdown:', error))
    process.exit(1)
  }
}

// on server termination closing the bullmq resources!
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
