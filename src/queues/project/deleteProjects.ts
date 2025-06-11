import configPromise from '@payload-config'
import { Job } from 'bullmq'
import { getPayload } from 'payload'

import { deleteProjectAction } from '@/actions/project'
import { getQueue, getWorker } from '@/lib/bullmq'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendActionEvent, sendEvent } from '@/lib/sendEvent'

interface QueueArgs {
  serverDetails: {
    id: string
  }
  tenant: {
    slug: string
  }
  deleteProjectsFromServer: boolean
  deleteBackups: boolean
}

export const addDeleteProjectsQueue = async (data: QueueArgs) => {
  const QUEUE_NAME = `server-${data.serverDetails.id}-delete-projects`

  const deleteProjectsQueue = getQueue({
    name: QUEUE_NAME,
    connection: queueConnection,
  })

  const worker = getWorker<QueueArgs>({
    name: QUEUE_NAME,
    processor: async job => {
      const { serverDetails, tenant, deleteProjectsFromServer, deleteBackups } =
        job.data

      try {
        const payload = await getPayload({ config: configPromise })

        sendEvent({
          pub,
          message: 'Fetching projects for server...',
          serverId: serverDetails.id,
        })

        // Get all projects for this server
        const { docs: projects } = await payload.find({
          collection: 'projects',
          where: {
            and: [
              {
                'tenant.slug': {
                  equals: tenant.slug,
                },
              },
              {
                server: { equals: serverDetails.id },
              },
            ],
          },
        })

        if (projects.length === 0) {
          sendEvent({
            pub,
            message: '✅ No projects found on server',
            serverId: serverDetails.id,
          })
          return
        }

        sendEvent({
          pub,
          message: `Found ${projects.length} project(s). Starting deletion process...`,
          serverId: serverDetails.id,
        })

        // Delete all projects with better error handling
        const deleteResults = await Promise.allSettled(
          projects.map(project =>
            deleteProjectAction({
              id: project.id,
              serverId: serverDetails.id,
              deleteFromServer: deleteProjectsFromServer,
              deleteBackups,
            }),
          ),
        )

        const failed = deleteResults.filter(
          result => result.status === 'rejected',
        )
        const succeeded = deleteResults.filter(
          result => result.status === 'fulfilled',
        )

        if (failed.length > 0) {
          sendEvent({
            pub,
            message: `⚠️ ${failed.length} project(s) failed to delete, ${succeeded.length} succeeded`,
            serverId: serverDetails.id,
          })

          // Log failed deletions for debugging
          failed.forEach((result, index) => {
            console.error(
              `Failed to delete project ${projects[index]?.id}:`,
              result.reason,
            )
          })
        } else {
          sendEvent({
            pub,
            message: `✅ Successfully processed ${projects.length} project(s) for deletion`,
            serverId: serverDetails.id,
          })
        }

        sendEvent({
          pub,
          message: 'Syncing changes...',
          serverId: serverDetails.id,
        })

        sendActionEvent({
          pub,
          action: 'refresh',
          tenantSlug: tenant.slug,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : ''
        throw new Error(`❌ Failed to delete projects: ${message}`)
      }
    },

    connection: queueConnection,
  })

  worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
    if (job?.data) {
      sendEvent({
        pub,
        message: err.message,
        serverId: job.data.serverDetails.id,
      })
    }
  })

  const id = `delete-projects:${new Date().getTime()}`

  return await deleteProjectsQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
