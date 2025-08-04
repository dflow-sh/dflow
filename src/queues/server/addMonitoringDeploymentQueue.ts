import { addTemplateDeployQueue } from '../template/deploy'
import { Job } from 'bullmq'

import { getQueue, getWorker } from '@/lib/bullmq'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendActionEvent, sendEvent } from '@/lib/sendEvent'
import { Project, Service } from '@/payload-types'

interface DeploymentQueueArgs {
  services: Omit<Service, 'project'>[]
  serverDetails: {
    id: string
  }
  project: Project
  tenantDetails: {
    slug: string
  }
  serverId: string // For event notifications
}

/**
 * Simplified queue that only handles the deployment of monitoring services
 * All setup operations (project creation, Beszel integration, service creation)
 * are now handled in the action before queueing deployment
 *
 * @param data - Deployment queue arguments
 * @returns Promise resolving to the queued job
 */
export const addMonitoringDeploymentQueue = async (
  data: DeploymentQueueArgs,
) => {
  // Create a unique queue name for this server's monitoring deployment
  const QUEUE_NAME = `server-${data.serverDetails.id}-deploy-monitoring`

  // Initialize the monitoring deployment queue
  const deploymentQueue = getQueue({
    name: QUEUE_NAME,
    connection: queueConnection,
  })

  // Create worker to process monitoring deployment jobs
  const worker = getWorker<DeploymentQueueArgs>({
    name: QUEUE_NAME,
    processor: async job => {
      const { services, serverDetails, project, tenantDetails, serverId } =
        job.data

      try {
        // Trigger deployment of monitoring services
        const deployResponse = await addTemplateDeployQueue({
          services,
          serverDetails,
          project,
          tenantDetails,
        })

        // Verify deployment was successfully queued
        if (deployResponse.id) {
          sendEvent({
            pub,
            message: `✅ Monitoring services deployment completed successfully`,
            serverId,
          })

          // Trigger final UI refresh
          sendActionEvent({
            pub,
            action: 'refresh',
            tenantSlug: tenantDetails.slug,
          })
        } else {
          throw new Error('Failed to trigger template deployment')
        }
      } catch (error) {
        // Handle deployment failures - setup was successful, but deployment failed
        const message = error instanceof Error ? error.message : 'Unknown error'

        sendEvent({
          pub,
          message: `⚠️ Monitoring setup completed, but deployment failed: ${message}`,
          serverId,
        })

        // Note: We don't throw here because the monitoring setup itself was successful
        // Only the deployment step failed, which can be retried later
        console.error(
          `Monitoring deployment failed for server ${serverId}:`,
          error,
        )
      }
    },

    connection: queueConnection,
  })

  // Handle job failures and notify users
  worker.on(
    'failed',
    async (job: Job<DeploymentQueueArgs> | undefined, err) => {
      if (job?.data) {
        sendEvent({
          pub,
          message: `⚠️ Monitoring deployment failed: ${err.message}`,
          serverId: job.data.serverId,
        })
      }
    },
  )

  // Create unique job ID and add to queue
  const id = `deploy-monitoring:${new Date().getTime()}`

  return await deploymentQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
