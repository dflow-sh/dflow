import { type Job, type Queue, QueueEvents } from 'bullmq'

export async function waitForJobCompletion(
  job: Job,
  options: {
    maxAttempts?: number
    pollingInterval?: number
    successStates?: string[]
    failureStates?: string[]
  } = {},
) {
  const {
    maxAttempts = 180, // 30 minutes with 10s interval
    pollingInterval = 10000, // 10 seconds
    successStates = ['completed'],
    failureStates = ['failed', 'unknown'],
  } = options

  let attempts = 0

  while (attempts < maxAttempts) {
    try {
      // Get the current state of the job
      const state = await job.getState()

      // Check if job completed successfully
      if (successStates.includes(state)) {
        return { success: true }
      }

      // Check if job failed
      if (failureStates.includes(state)) {
        throw new Error('job execution failed')
      }

      // Wait for the polling interval before checking again
      await new Promise(resolve => setTimeout(resolve, pollingInterval))
      attempts++
    } catch (error) {
      throw new Error(
        `Error polling job ${job.id}: ${error instanceof Error ? error.message : ''}`,
      )
    }
  }

  // If we've reached the maximum number of attempts, consider it a timeout
  throw new Error(`Error execution timeout`)
}

export async function waitForJobIdCompletion(
  queue: Queue,
  jobId: string,
  options: {
    successStates?: string[]
    failureStates?: string[]
    timeout?: number
  } = {},
) {
  const {
    successStates = ['completed'],
    failureStates = ['failed'],
    timeout = 30 * 60 * 1000, // default: 30 minutes
  } = options

  const queueEvents = new QueueEvents(queue.name, {
    connection: queue.opts.connection,
  })
  await queueEvents.waitUntilReady()

  return new Promise<{ success: boolean }>((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup()
      reject(new Error(`Job ${jobId} timed out after ${timeout / 1000}s`))
    }, timeout)

    const handleCompleted = ({ jobId: finishedId }: { jobId: string }) => {
      if (finishedId === jobId && successStates.includes('completed')) {
        cleanup()
        resolve({ success: true })
      }
    }

    const handleFailed = ({
      jobId: finishedId,
      failedReason,
    }: {
      jobId: string
      failedReason: string
    }) => {
      if (finishedId === jobId && failureStates.includes('failed')) {
        cleanup()
        reject(new Error(`Job ${jobId} failed: ${failedReason}`))
      }
    }

    function cleanup() {
      clearTimeout(timer)
      queueEvents.off('completed', handleCompleted)
      queueEvents.off('failed', handleFailed)
      queueEvents.close()
    }

    queueEvents.on('completed', handleCompleted)
    queueEvents.on('failed', handleFailed)
  })
}
