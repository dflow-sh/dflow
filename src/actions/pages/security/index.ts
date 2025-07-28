'use server'

import { protectedClient } from '@/lib/safe-action'

export const getSecurityDetailsAction = protectedClient
  .metadata({
    actionName: 'getSecurityDetailsAction',
  })
  .action(async ({ ctx }) => {
    const {
      payload,
      userTenant: { tenant },
    } = ctx

    const [
      { docs: securityGroups, totalDocs: securityGroupsCount },
      { docs: cloudProviderAccounts },
      { docs: servers },
    ] = await Promise.all([
      payload.find({
        collection: 'securityGroups',
        where: {
          'tenant.slug': {
            equals: tenant.slug,
          },
        },
        pagination: false,
      }),
      payload.find({
        collection: 'cloudProviderAccounts',
        where: {
          'tenant.slug': {
            equals: tenant.slug,
          },
        },
        pagination: false,
      }),
      payload.find({
        collection: 'servers',
        pagination: false,
        where: {
          'tenant.slug': {
            equals: tenant.slug,
          },
        },
        select: {
          name: true,
          sshKey: true,
          awsEc2Details: {
            securityGroups: true,
          },
        },
      }),
    ])

    return {
      securityGroups,
      securityGroupsCount,
      cloudProviderAccounts,
      servers,
    }
  })

export const getSshKeysAction = protectedClient
  .metadata({ actionName: 'getSshKeysAction' })
  .action(async ({ ctx }) => {
    const {
      payload,
      userTenant: { tenant },
    } = ctx

    const [{ docs: keys, totalDocs: sshKeysCount }, { docs: servers }] =
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
          collection: 'servers',
          pagination: false,
          where: {
            'tenant.slug': {
              equals: tenant.slug,
            },
          },
          select: {
            name: true,
            sshKey: true,
            awsEc2Details: {
              securityGroups: true,
            },
          },
        }),
      ])

    return {
      keys,
      sshKeysCount,
      servers,
    }
  })
