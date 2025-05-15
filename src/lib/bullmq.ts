import { Processor, Queue, Worker } from 'bullmq'
import Redis from 'ioredis'

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

  workers.set(name, newWorker)
  return newWorker
}

const closeWorker = async (queueName: string) => {
  const worker = workers.get(queueName)

  if (worker) {
    try {
      await worker.close()
      workers.delete(queueName)
      console.log(`Worker for queue ${queueName} closed successfully`)
    } catch (error) {
      console.error(`Error closing worker for queue ${queueName}:`, error)
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
    } catch (error) {
      console.error(`Error closing queue ${queueName}:`, error)
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
