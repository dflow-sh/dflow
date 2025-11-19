import { type Job, type Queue } from 'bullmq'

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
      // Fetch job by ID
      const job = await queue.getJob(jobId)

      if (!job) {
        throw new Error(`Job with id ${jobId} not found`)
      }

      // Get current job state
      const state = await job.getState()

      // Success case
      if (successStates.includes(state)) {
        return { success: true }
      }

      // Failure case
      if (failureStates.includes(state)) {
        throw new Error(`Job ${jobId} failed with state: ${state}`)
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, pollingInterval))
      attempts++
    } catch (error) {
      throw new Error(
        `Error polling job ${jobId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
    }
  }

  // Timeout
  throw new Error(`Job ${jobId} execution timed out`)
}
