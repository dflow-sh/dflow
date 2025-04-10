'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { z } from 'zod'

import { protectedClient } from '@/lib/safe-action'

import {
  createSecurityGroupSchema,
  updateSecurityGroupSchema,
} from './validator'

const payload = await getPayload({ config: configPromise })

export const createSecurityGroupAction = protectedClient
  .metadata({
    actionName: 'createSecurityGroupAction',
  })
  .schema(createSecurityGroupSchema)
  .action(async ({ clientInput }) => {
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
      },
    })

    return securityGroup
  })

export const updateSecurityGroupAction = protectedClient
  .metadata({
    actionName: 'updateSecurityGroupAction',
  })
  .schema(updateSecurityGroupSchema)
  .action(async ({ clientInput }) => {
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
      },
    })

    return updatedSecurityGroup
  })

export const deleteSecurityGroupAction = protectedClient
  .metadata({
    actionName: 'deleteSecurityGroupAction',
  })
  .schema(
    z.object({
      id: z.string().min(1, 'ID is required'),
    }),
  )
  .action(async ({ clientInput }) => {
    const { id } = clientInput

    const response = await payload.delete({
      collection: 'securityGroups',
      id,
    })

    if (response) {
      return { success: true }
    }
  })

export const getAllSecurityGroupsAction = protectedClient
  .metadata({
    actionName: 'getAllSecurityGroupsAction',
  })
  .action(async () => {
    const { docs } = await payload.find({
      collection: 'securityGroups',
      pagination: false,
    })

    return docs
  })
