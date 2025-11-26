'use server'

import { protectedClient } from '@/lib/safe-action'

import { getServiceDetailsSchema } from "@core/actions/pages/service/validator"

export const getServiceDetails = protectedClient
  .metadata({
    actionName: 'getServiceDetails',
  })
  .inputSchema(getServiceDetailsSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id } = clientInput
    const {
      userTenant: { tenant },
      payload,
    } = ctx

    const { docs: services } = await payload.find({
      collection: 'services',
      where: {
        and: [
          {
            id: {
              equals: id,
            },
          },
          {
            'project.hidden': {
              not_equals: true,
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
          count: true,
        },
      },
      depth: 3,
    })

    return services.at(0)
  })

export const getServiceDeploymentsBackups = protectedClient
  .metadata({
    actionName: 'getServiceDeploymentsBackups',
  })
  .inputSchema(getServiceDetailsSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id } = clientInput
    const {
      payload,
      userTenant: { tenant },
    } = ctx

    const [{ docs: services }, { docs: deployments }] = await Promise.all([
      payload.find({
        collection: 'services',
        where: {
          and: [
            {
              id: {
                equals: id,
              },
            },
            {
              'project.hidden': {
                not_equals: true,
              },
            },
            {
              'tenant.slug': {
                equals: tenant.slug,
              },
            },
          ],
        },
      }),
      payload.find({
        collection: 'deployments',
        pagination: false,
        where: {
          service: {
            equals: id,
          },
        },
      }),
    ])

    const service = services.at(0)

    return { service, deployments }
  })

export const getDeploymentsAction = protectedClient
  .metadata({
    actionName: 'getDeploymentsAction',
  })
  .inputSchema(getServiceDetailsSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id } = clientInput

    const { payload } = ctx

    const { docs: deployments } = await payload.find({
      collection: 'deployments',
      pagination: false,
      where: {
        service: {
          equals: id,
        },
      },
      depth: 0,
    })

    return deployments
  })

export const getServiceBackups = protectedClient
  .metadata({
    actionName: 'getServiceBackups',
  })
  .inputSchema(getServiceDetailsSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id } = clientInput
    const { payload } = ctx

    const { docs: backups } = await payload.find({
      collection: 'backups',
      where: {
        service: {
          equals: id,
        },
      },
    })

    return backups
  })
