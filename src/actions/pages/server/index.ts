'use server'

import { protectedClient } from '@/lib/safe-action'
import { ServerType } from '@/payload-types-overrides'

import { getServerDetailsSchema } from './validator'

export const getServersDetails = protectedClient
  .metadata({
    actionName: 'getServersDetails',
  })
  .action(async ({ ctx }) => {
    const {
      payload,
      userTenant: { tenant },
    } = ctx

    const { docs: servers } = await payload.find({
      collection: 'servers',
      where: {
        'tenant.slug': {
          equals: tenant.slug,
        },
      },
      pagination: false,
      context: { populateServerDetails: true },
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
  .schema(getServerDetailsSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id } = clientInput
    const {
      payload,
      userTenant: { tenant },
    } = ctx

    const [{ docs: servers }, { docs: serverDetails }] = await Promise.all([
      payload.find({
        collection: 'servers',
        where: {
          'tenant.slug': {
            equals: tenant.slug,
          },
        },
        pagination: false,
      }),
      payload.find({
        collection: 'servers',
        where: {
          and: [
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
        context: { populateServerDetails: true },
      }),
    ])

    const server = serverDetails.at(0) as ServerType
    return { server, servers }
  })

export const getServerProjects = protectedClient
  .metadata({
    actionName: 'getServerProjects',
  })
  .schema(getServerDetailsSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id } = clientInput
    const {
      payload,
      userTenant: { tenant },
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
        ],
      },
    })

    return { projects }
  })

export const getServerGeneralTabDetails = protectedClient
  .metadata({
    actionName: 'getServerGeneralTabDetails',
  })
  .schema(getServerDetailsSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id } = clientInput
    const {
      payload,
      userTenant: { tenant },
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
            ],
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
