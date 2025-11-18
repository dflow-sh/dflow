import { addDeleteMachineQueue } from '../tailscale/deleteMachine'
import configPromise from '@payload-config'
import { Job } from 'bullmq'
import { getPayload } from 'payload'

import { getQueue, getWorker } from '@dflow/lib/bullmq'
import { jobOptions, pub, queueConnection } from '@dflow/lib/redis'
import { sendActionEvent, sendEvent } from '@dflow/lib/sendEvent'
import { deleteMachine } from '@dflow/lib/tailscale/deleteMachine'

import { addDeleteProjectQueue } from './deleteProject'

interface QueueArgs {
  serverDetails: {
    id: string
  }
  tenant: {
    slug: string
  }
  projects: string[]
  services: { id: string; projectId: string }[]
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
      const {
        serverDetails,
        tenant,
        deleteProjectsFromServer,
        deleteBackups,
        projects,
        services,
      } = job.data

      try {
        const payload = await getPayload({ config: configPromise })

        if (projects.length === 0) {
          sendEvent({
            pub,
            message: '✅ No projects found on server',
            serverId: serverDetails.id,
          })
        } else {
          sendEvent({
            pub,
            message: `Found ${projects.length} project(s). Starting deletion process...`,
            serverId: serverDetails.id,
          })

          // Delete all projects with better error handling
          const deleteResults = await Promise.allSettled(
            projects.map(projectId => {
              const serviceIds = services
                .filter(service => service.projectId === projectId)
                .map(service => service.id)

              return addDeleteProjectQueue({
                serverDetails: {
                  id: serverDetails.id,
                },
                projectDetails: {
                  id: projectId,
                },
                tenant: {
                  slug: tenant.slug,
                },
                deleteBackups,
                deleteFromServer: deleteProjectsFromServer,
                waitUntilDeletion: true,
                deletedServiceIds: serviceIds,
              })
            }),
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
                `Failed to delete project ${projects[index]}:`,
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

          // waiting in queue for all project deletion to be completed to delete machine from tailscale
          if (deleteProjectsFromServer) {
            await addDeleteMachineQueue({
              serverDetails: {
                id: serverDetails.id,
                name: '',
              },
              projectsQueueIDs: succeeded.map(
                actionResult => actionResult.value.id!,
              ),
            })
          }
        }

        // if deleteProjects is checked directly removing machine from tailscale
        if (!deleteProjectsFromServer) {
          await deleteMachine({
            serverId: serverDetails.id,
            payload,
          })
        }

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
