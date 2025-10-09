'use server'

import { protectedClient } from '@/lib/safe-action'

import { getProjectDetailsSchema } from './validator'

export const getProjectDetails = protectedClient
  .metadata({
    actionName: 'getProjectDetails',
  })
  .inputSchema(getProjectDetailsSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id: ProjectId } = clientInput
    const {
      user,
      payload,
      userTenant: { tenant, role },
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
        depth: 1,
      }),
      payload.find({
        collection: 'projects',
        where: {
          and: [
            {
              id: {
                equals: ProjectId,
              },
            },
            {
              hidden: {
                not_equals: true,
              },
            },
            {
              'tenant.slug': {
                equals: tenant.slug,
              },
            },
            ...(role?.projects?.readLimit === 'createdByUser'
              ? [
                  {
                    createdBy: {
                      equals: user?.id,
                    },
                  },
                ]
              : []),
          ],
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
  .inputSchema(getProjectDetailsSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id } = clientInput
    const {
      user,
      payload,
      userTenant: { tenant, role },
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
              hidden: {
                not_equals: true,
              },
            },
            {
              'tenant.slug': {
                equals: tenant.slug,
              },
            },
            ...(role?.projects?.readLimit === 'createdByUser'
              ? [
                  {
                    createdBy: {
                      equals: user.id,
                    },
                  },
                ]
              : []),
          ],
        },
        depth: 1,
        select: {
          server: true,
          name: true,
        },
      }),
      payload.find({
        collection: 'projects',
        pagination: false,
        where: {
          and: [
            {
              'tenant.slug': {
                equals: tenant.slug,
              },
            },
            {
              hidden: {
                not_equals: true,
              },
            },
            ...(role?.projects?.readLimit === 'createdByUser'
              ? [
                  {
                    createdBy: {
                      equals: user.id,
                    },
                  },
                ]
              : []),
          ],
        },
        select: {
          name: true,
        },
      }),
    ])

    return { project, projects }
  })
