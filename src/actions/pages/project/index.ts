'use server'

import { protectedClient } from '@/lib/safe-action'

import { getProjectDetailsSchema } from './validator'

export const getProjectDetails = protectedClient
  .metadata({
    actionName: 'getProjectDetails',
  })
  .schema(getProjectDetailsSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id: ProjectId } = clientInput
    const {
      payload,
      userTenant: { tenant },
    } = ctx

    const [{ docs: services }, { docs: Projects }] = await Promise.all([
      payload.find({
        collection: 'services',
        pagination: false,
        where: {
          and: [
            {
              project: {
                equals: ProjectId,
              },
            },
            {
              'tenant.slug': {
                equals: tenant.slug,
              },
            },
          ],
        },
        joins: {
          deployments: {
            limit: 1,
          },
        },
        depth: 10,
      }),
      payload.find({
        collection: 'projects',
        where: {
          'tenant.slug': {
            equals: tenant.slug,
          },
          id: {
            equals: ProjectId,
          },
        },
        select: {
          name: true,
          description: true,
          server: true,
        },
      }),
    ])

    return {
      services,
      Projects,
    }
  })

export const getProjectBreadcrumbs = protectedClient
  .metadata({
    actionName: 'getProjectBreadcrumbs',
  })
  .schema(getProjectDetailsSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id } = clientInput
    const {
      payload,
      userTenant: { tenant },
    } = ctx
    const [project, projects] = await Promise.all([
      payload.find({
        collection: 'projects',
        where: {
          and: [
            {
              id: {
                equals: id,
              },
            },
            {
              'tenant.slug': {
                equals: tenant.slug,
              },
            },
          ],
        },
        depth: 10,

        select: {
          server: true,
          name: true,
        },
      }),
      payload.find({
        collection: 'projects',
        pagination: false,
        where: {
          'tenant.slug': {
            equals: tenant.slug,
          },
        },
        select: {
          name: true,
        },
      }),
    ])

    return { project, projects }
  })
