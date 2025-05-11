'use server'

import { protectedClient } from '@/lib/safe-action'

export const getSecurityDetails = protectedClient
  .metadata({
    actionName: 'getProjectDetails',
  })
  .action(async ({ ctx }) => {
    const {
      payload,
      userTenant: { tenant },
    } = ctx

    const [
      { docs: keys, totalDocs: sshKeysCount },
      { docs: securityGroups, totalDocs: securityGroupsCount },
      { docs: cloudProviderAccounts },
      { docs: servers },
    ] = await Promise.all([
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
      keys,
      sshKeysCount,
      securityGroups,
      securityGroupsCount,
      cloudProviderAccounts,
      servers,
    }
  })
