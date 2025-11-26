'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { protectedClient } from '@/lib/safe-action'

import {
  createSecurityGroupSchema,
  getSecurityGroupsSchema,
  updateSecurityGroupSchema,
} from "@core/actions/securityGroups/validator"

export const createSecurityGroupAction = protectedClient
  .metadata({
    actionName: 'createSecurityGroupAction',
  })
  .inputSchema(createSecurityGroupSchema)
  .action(async ({ clientInput, ctx }) => {
    const {
      userTenant: { tenant },
      payload,
    } = ctx

    const {
      name,
      description,
      cloudProvider,
      cloudProviderAccount,
      inboundRules,
      outboundRules,
      tags,
    } = clientInput

    const securityGroup = await payload.create({
      collection: 'securityGroups',
      data: {
        name,
        description,
        cloudProvider,
        cloudProviderAccount,
        inboundRules,
        outboundRules,
        tags,
        syncStatus: 'pending',
        tenant,
      },
    })

    if (securityGroup) {
      revalidatePath(`${tenant.slug}/security`)
    }

    return securityGroup
  })

export const updateSecurityGroupAction = protectedClient
  .metadata({
    actionName: 'updateSecurityGroupAction',
  })
  .inputSchema(updateSecurityGroupSchema)
  .action(async ({ clientInput, ctx }) => {
    const {
      userTenant: { tenant },
      payload,
    } = ctx

    const {
      id,
      name,
      description,
      cloudProvider,
      cloudProviderAccount,
      inboundRules,
      outboundRules,
      tags,
    } = clientInput

    const updatedSecurityGroup = await payload.update({
      collection: 'securityGroups',
      id,
      data: {
        name,
        description,
        cloudProvider,
        cloudProviderAccount,
        inboundRules,
        outboundRules,
        tags,
        syncStatus: 'pending',
      },
    })

    if (updatedSecurityGroup) {
      revalidatePath(`/${tenant.slug}/security`)
    }

    return updatedSecurityGroup
  })

export const deleteSecurityGroupAction = protectedClient
  .metadata({
    actionName: 'deleteSecurityGroupAction',
  })
  .inputSchema(
    z.object({
      id: z.string().min(1, 'ID is required'),
    }),
  )
  .action(async ({ clientInput, ctx }) => {
    const { id } = clientInput
    const {
      userTenant: { tenant },
      payload,
    } = ctx

    const deleteSecurityGroup = await payload.update({
      collection: 'securityGroups',
      id,
      data: {
        deletedAt: new Date().toISOString(),
      },
    })

    if (deleteSecurityGroup) {
      revalidatePath(`/${tenant.slug}/security`)
      return { deleted: true }
    }

    return deleteSecurityGroup
  })

export const syncSecurityGroupAction = protectedClient
  .metadata({
    actionName: 'syncSecurityGroupAction',
  })
  .inputSchema(
    z.object({
      id: z.string().min(1, 'ID is required'),
    }),
  )
  .action(async ({ clientInput, ctx }) => {
    const { id } = clientInput
    const {
      userTenant: { tenant },
      payload,
    } = ctx

    const updatedSecurityGroup = await payload.update({
      collection: 'securityGroups',
      id,
      data: {
        syncStatus: 'start-sync',
        lastSyncedAt: new Date().toISOString(),
      },
    })

    if (updatedSecurityGroup) {
      revalidatePath(`/${tenant.slug}/security`)
      return { synced: true }
    }

    return updatedSecurityGroup
  })

export const getSecurityGroupsAction = protectedClient
  .metadata({
    actionName: 'getSecurityGroupsAction',
  })
  .inputSchema(getSecurityGroupsSchema)
  .action(async ({ clientInput, ctx }) => {
    const { cloudProviderAccountId } = clientInput
    const { payload } = ctx

    const { docs: securityGroups } = await payload.find({
      collection: 'securityGroups',
      pagination: false,
      where: {
        and: [
          {
            cloudProvider: {
              equals: 'aws',
            },
          },
          {
            cloudProviderAccount: {
              equals: cloudProviderAccountId,
            },
          },
        ],
      },
    })

    return securityGroups
  })
