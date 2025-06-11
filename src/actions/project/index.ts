'use server'

import { revalidatePath } from 'next/cache'

import { protectedClient } from '@/lib/safe-action'
import { ServerType } from '@/payload-types-overrides'
import { addDeleteProjectQueue } from '@/queues/project/deleteProject'

import {
  createProjectSchema,
  deleteProjectSchema,
  getProjectDatabasesSchema,
  updateProjectSchema,
} from './validator'

// No need to handle try/catch that abstraction is taken care by next-safe-actions
export const createProjectAction = protectedClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'createProjectAction',
  })
  .schema(createProjectSchema)
  .action(async ({ clientInput, ctx }) => {
    const { name, description, serverId } = clientInput

    // Fetching the server details before creating the project
    const {
      userTenant: { tenant },
      payload,
    } = ctx

    const { version } = (await payload.findByID({
      collection: 'servers',
      id: serverId,
      context: {
        populateServerDetails: true,
      },
    })) as ServerType

    if (!version) {
      throw new Error('Dokku is not installed!')
    }

    const response = await payload.create({
      collection: 'projects',
      data: {
        name,
        description,
        server: serverId,
        tenant,
      },
      user: ctx.user,
    })

    if (response) {
      revalidatePath(`/${tenant.slug}/dashboard`)
    }

    return response
  })

export const updateProjectAction = protectedClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'updateProjectAction',
  })
  .schema(updateProjectSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id, ...data } = clientInput
    const {
      userTenant: { tenant },
      payload,
    } = ctx

    const response = await payload.update({
      collection: 'projects',
      data,
      id,
    })

    if (response) {
      revalidatePath(`/${tenant.slug}/dashboard`)
    }

    return response
  })

export const deleteProjectAction = protectedClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'deleteProjectAction',
  })
  .schema(deleteProjectSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id, serverId, deleteBackups, deleteFromServer } = clientInput
    const {
      userTenant: { tenant },
    } = ctx

    const queueResponse = await addDeleteProjectQueue({
      serverDetails: {
        id: serverId,
      },
      projectDetails: {
        id,
      },
      tenant: {
        slug: tenant.slug,
      },
      deleteBackups,
      deleteFromServer,
    })

    if (queueResponse.id) {
      revalidatePath(`/${tenant.slug}/dashboard`)

      return {
        queued: true,
        queueId: queueResponse.id,
        deleteFromServer,
      }
    }

    throw new Error('Failed to queue project deletion')
  })

export const getProjectDatabasesAction = protectedClient
  .metadata({
    actionName: 'getProjectDatabasesAction',
  })
  .schema(getProjectDatabasesSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id } = clientInput
    const { payload } = ctx

    const { docs } = await payload.find({
      collection: 'services',
      where: {
        project: {
          equals: id,
        },
        type: {
          equals: 'database',
        },
      },
      pagination: false,
    })

    return docs
  })
