'use server'

import { protectedClient } from '@/lib/safe-action'
import { ServerType } from '@/payload-types-overrides'
import { checkServersSSHConnectionQueue } from '@/queues/server/checkSSHConnection'

import { getServerDetailsSchema, getServersDetailsSchema } from './validator'

export const getServersDetailsAction = protectedClient
  .metadata({
    actionName: 'getServersDetailsAction',
  })
  .inputSchema(getServersDetailsSchema)
  .action(async ({ clientInput, ctx }) => {
    const { populateServerDetails = false, refreshServerDetails = false } =
      clientInput || {}

    const {
      user,
      payload,
      userTenant: { tenant, role },
    } = ctx

    const { docs: servers } = await payload.find({
      collection: 'servers',
      where: {
        and: [
          {
            'tenant.slug': {
              equals: tenant.slug,
            },
          },
          ...(role?.servers?.readLimit === 'createdByUser'
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
      pagination: false,
      context: {
        populateServerDetails,
        refreshServerDetails,
        checkDflowNextBillingDate: true,
      },
    })

    await checkServersSSHConnectionQueue({
      tenant: {
        slug: tenant.slug,
        id: tenant.id,
      },
      refreshServerDetails,
    })

    return { servers }
  })

export const getAddServerDetails = protectedClient
  .metadata({
    actionName: 'getAddServerDetails',
  })
  .action(async ({ ctx }) => {
    const {
      payload,
      userTenant: { tenant },
    } = ctx

    const [{ docs: sshKeys }, { docs: securityGroups }] = await Promise.all([
      payload.find({
        collection: 'sshKeys',
        where: {
          'tenant.slug': {
            equals: tenant.slug,
          },
        },
        pagination: false,
      }),
      payload.find({
        collection: 'securityGroups',
        where: {
          'tenant.slug': {
            equals: tenant.slug,
          },
        },
        pagination: false,
      }),
    ])

    return { sshKeys, securityGroups }
  })

export const getServerBreadcrumbs = protectedClient
  .metadata({
    actionName: 'getServerBreadcrumbs',
  })
  .inputSchema(getServerDetailsSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id, populateServerDetails, refreshServerDetails } = clientInput

    const {
      user,
      payload,
      userTenant: { tenant, role },
    } = ctx

    const [{ docs: servers }, { docs: serverDetails }] = await Promise.all([
      payload.find({
        collection: 'servers',
        where: {
          and: [
            {
              'tenant.slug': {
                equals: tenant.slug,
              },
            },
            ...(role?.servers?.readLimit === 'createdByUser'
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
        pagination: false,
      }),
      payload.find({
        collection: 'servers',
        where: {
          and: [
            ...(role?.servers?.readLimit === 'createdByUser'
              ? [
                  {
                    createdBy: {
                      equals: user?.id,
                    },
                  },
                ]
              : []),
            {
              'tenant.slug': {
                equals: tenant.slug,
              },
              id: {
                equals: id,
              },
            },
          ],
        },
        context: {
          populateServerDetails,
          refreshServerDetails,
        },
      }),
    ])

    const server = serverDetails.at(0) as ServerType
    return { server, servers }
  })

export const getServerProjects = protectedClient
  .metadata({
    actionName: 'getServerProjects',
  })
  .inputSchema(getServerDetailsSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id } = clientInput
    const {
      user,
      payload,
      userTenant: { tenant, role },
    } = ctx

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
            server: { equals: id },
          },
          {
            deletedAt: {
              exists: false,
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
                    equals: user?.id,
                  },
                },
              ]
            : []),
        ],
      },
    })

    return { projects }
  })

export const getServerGeneralTabDetails = protectedClient
  .metadata({
    actionName: 'getServerGeneralTabDetails',
  })
  .inputSchema(getServerDetailsSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id } = clientInput
    const {
      user,
      payload,
      userTenant: { tenant, role },
    } = ctx

    const [{ docs: sshKeys }, { docs: projects }, { docs: securityGroups }] =
      await Promise.all([
        payload.find({
          collection: 'sshKeys',
          where: {
            'tenant.slug': {
              equals: tenant.slug,
            },
          },
          pagination: false,
        }),
        payload.find({
          collection: 'projects',
          pagination: false,
          depth: 1,
          where: {
            and: [
              {
                'tenant.slug': {
                  equals: tenant.slug,
                },
              },
              {
                server: { equals: id },
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
                        equals: user?.id,
                      },
                    },
                  ]
                : []),
            ],
          },
          sort: '-createdAt',
          joins: {
            services: {
              limit: 1000,
            },
          },
        }),
        payload.find({
          collection: 'securityGroups',
          pagination: false,
          where: {
            and: [
              {
                'tenant.slug': {
                  equals: tenant.slug,
                },
              },
              {
                or: [
                  { cloudProvider: { equals: id } },
                  { cloudProvider: { exists: false } },
                ],
              },
              {
                or: [
                  {
                    cloudProviderAccount: {
                      equals: id,
                    },
                  },
                  { cloudProviderAccount: { exists: false } },
                ],
              },
            ],
          },
        }),
      ])

    return { sshKeys, projects, securityGroups }
  })
