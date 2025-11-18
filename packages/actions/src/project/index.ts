'use server'

import { revalidatePath } from 'next/cache'

import { adminClient, protectedClient } from '@dflow/lib/safe-action'
import { generateRandomString } from '@dflow/lib/utils'
import { ServerType } from '@/payload-types-overrides'
import { addDeleteProjectQueue } from '@/queues/project/deleteProject'

import {
  createProjectAdminSchema,
  createProjectSchema,
  deleteProjectSchema,
  getProjectDatabasesSchema,
  updateProjectSchema,
} from './validator'

export const createProjectAdminAction = adminClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'createProjectAdminAction',
  })
  .inputSchema(createProjectAdminSchema)
  .action(async ({ clientInput, ctx }) => {
    const {
      name = '',
      description = '',
      serverId,
      hidden = false,
      tenantId,
    } = clientInput
    const { payload } = ctx

    const slicedName = name?.slice(0, 10)

    let uniqueName = slicedName

    const { docs: duplicateProjects } = await payload.find({
      collection: 'projects',
      where: {
        and: [
          {
            name: {
              equals: slicedName,
            },
          },

          {
            tenant: {
              equals: tenantId,
            },
          },
        ],
      },
    })

    if (duplicateProjects.length > 0) {
      // add a 4-random character generation
      const uniqueSuffix = generateRandomString({ length: 4 })
      uniqueName = `${slicedName}-${uniqueSuffix}`
    }

    const response = await payload.create({
      collection: 'projects',
      data: {
        name: uniqueName,
        description,
        server: serverId,
        tenant: tenantId,
        hidden,
      },
      depth: 2,
    })

    return response
  })

export const createProjectAction = protectedClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'createProjectAction',
  })
  .inputSchema(createProjectSchema)
  .action(async ({ clientInput, ctx }) => {
    const {
      name = '',
      description = '',
      serverId,
      revalidate = true,
      hidden = false,
    } = clientInput

    // Fetching the server details before creating the project
    const {
      user,
      userTenant: { tenant, role },
      payload,
    } = ctx

    if (Number(role?.projects?.createLimit) > 0) {
      const { totalDocs } = await payload.count({
        collection: 'projects',
        where: {
          and: [
            {
              tenant: {
                equals: tenant.id,
              },
            },
            {
              hidden: {
                not_equals: true,
              },
            },
            {
              createdBy: {
                equals: user?.id,
              },
            },
          ],
        },
      })

      if (totalDocs >= Number(role?.projects?.createLimit)) {
        throw new Error(
          `You have reached your project creation limit. Please contact your administrator.`,
        )
      }
    }

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

    const slicedName = name?.slice(0, 10)

    let uniqueName = slicedName

    const { docs: duplicateProjects } = await payload.find({
      collection: 'projects',
      where: {
        and: [
          {
            name: {
              equals: slicedName,
            },
          },

          {
            tenant: {
              equals: tenant.id,
            },
          },
        ],
      },
    })

    if (duplicateProjects.length > 0) {
      // add a 4-random character generation
      const uniqueSuffix = generateRandomString({ length: 4 })
      uniqueName = `${slicedName}-${uniqueSuffix}`
    }

    const response = await payload.create({
      collection: 'projects',
      data: {
        name: uniqueName,
        description,
        server: serverId,
        createdBy: user?.id,
        tenant,
        hidden,
      },
      user: ctx.user,
      depth: 2,
    })

    if (response && revalidate) {
      revalidatePath(`/${tenant.slug}/dashboard`)
    }

    return response
  })

export const updateProjectAction = protectedClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'updateProjectAction',
  })
  .inputSchema(updateProjectSchema)
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
  .inputSchema(deleteProjectSchema)
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
  })

export const getProjectDatabasesAction = protectedClient
  .metadata({
    actionName: 'getProjectDatabasesAction',
  })
  .inputSchema(getProjectDatabasesSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id } = clientInput
    const { payload } = ctx

    const { docs } = await payload.find({
      collection: 'services',
      where: {
        project: {
          equals: id,
        },
        'project.hidden': {
          not_equals: true,
        },
        type: {
          equals: 'database',
        },
      },
      pagination: false,
    })

    return docs
  })
