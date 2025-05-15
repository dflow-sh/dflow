'use server'

import { protectedClient } from '@/lib/safe-action'

import { getServiceDetailsSchema } from './validator'

export const getServiceDetails = protectedClient
  .metadata({
    actionName: 'getServiceDetails',
  })
  .schema(getServiceDetailsSchema)
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
            'tenant.slug': {
              equals: tenant.slug,
            },
          },
        ],
      },
    })

    return services.at(0)
  })

export const getServiceDeploymentsBackups = protectedClient
  .metadata({
    actionName: 'getServiceDeploymentsBackups',
  })
  .schema(getServiceDetailsSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id } = clientInput
    const {
      payload,
      userTenant: { tenant },
    } = ctx

    const [{ docs: services }, { docs: deployments }, { docs: backupsDocs }] =
      await Promise.all([
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
                'tenant.slug': {
                  equals: tenant.slug,
                },
              },
            ],
          },
        }),
        payload.find({
          collection: 'deployments',
          where: {
            service: {
              equals: id,
            },
          },
        }),
        payload.find({
          collection: 'backups',
          where: {
            service: {
              equals: id,
            },
          },
        }),
      ])
    const service = services.at(0)

    return { service, deployments, backupsDocs }
  })
