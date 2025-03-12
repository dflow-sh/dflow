'use server'

import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'

import { publicClient } from '@/lib/safe-action'
import { ServerType } from '@/payload-types-overrides'
import { addDestroyApplicationQueue } from '@/queues/app/destroy'
import { addDestroyDatabaseQueue } from '@/queues/database/destroy'

import {
  createProjectSchema,
  deleteProjectSchema,
  updateProjectSchema,
} from './validator'

const payload = await getPayload({ config: configPromise })

// No need to handle try/catch that abstraction is taken care by next-safe-actions
export const createProjectAction = publicClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'createProjectAction',
  })
  .schema(createProjectSchema)
  .action(async ({ clientInput }) => {
    const { name, description, serverId } = clientInput

    // Fetching the server details before creating the project
    const { version } = (await payload.findByID({
      collection: 'servers',
      id: serverId,
      context: {
        populateServerDetails: true,
      },
    })) as ServerType

    if (!version || version === 'not-installed') {
      throw new Error('Dokku is not installed!')
    }

    const response = await payload.create({
      collection: 'projects',
      data: {
        name,
        description,
        server: serverId,
      },
    })

    if (response) {
      revalidatePath('/dashboard')
    }

    return response
  })

export const updateProjectAction = publicClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'updateProjectAction',
  })
  .schema(updateProjectSchema)
  .action(async ({ clientInput }) => {
    const { id, ...data } = clientInput

    const response = await payload.update({
      collection: 'projects',
      data,
      id,
    })

    if (response) {
      revalidatePath('/dashboard')
    }

    return response
  })

export const deleteProjectAction = publicClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'deleteProjectAction',
  })
  .schema(deleteProjectSchema)
  .action(async ({ clientInput }) => {
    const { id } = clientInput

    console.log("I'm inside a project deletion")

    // Fetching all services of project
    const { server, services } = await payload.findByID({
      collection: 'projects',
      id: id,
      depth: 10,
      joins: {
        services: {
          limit: 1000,
        },
      },
    })

    const servicesList = services?.docs?.filter(
      service => typeof service === 'object',
    )

    console.dir({ services, server }, { depth: Infinity })

    if (
      servicesList &&
      typeof server === 'object' &&
      typeof server.sshKey === 'object'
    ) {
      const sshDetails = {
        privateKey: server.sshKey?.privateKey,
        host: server?.ip,
        username: server?.username,
        port: server?.port,
      }

      // iterating in loop and adding deleting of services to queue
      for await (const service of servicesList) {
        let queueId: string | undefined = ''

        // adding deleting of app to queue
        if (service.type === 'app' || service.type === 'docker') {
          const appQueueResponse = await addDestroyApplicationQueue({
            sshDetails,
            serviceDetails: {
              name: service.name,
            },
          })

          queueId = appQueueResponse.id
        }

        // adding deleting of database to queue
        if (service.type === 'database' && service.databaseDetails?.type) {
          const databaseQueueResponse = await addDestroyDatabaseQueue({
            databaseName: service.name,
            databaseType: service.databaseDetails?.type,
            sshDetails,
          })

          queueId = databaseQueueResponse.id
        }

        console.log('service with queue-id', { service, queueId })

        // If deleting of service is added to queue, deleting the payload entry
        if (queueId) {
          await payload.delete({
            collection: 'services',
            id: service.id,
          })
        }
      }
    }

    const deleteProjectResponse = await payload.delete({
      collection: 'projects',
      id,
      depth: 10,
    })

    if (deleteProjectResponse.id) {
      revalidatePath('/dashboard')
      return { deleted: true }
    }
  })
