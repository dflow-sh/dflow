'use server'

import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'

import { protectedClient } from '@/lib/safe-action'

import {
  createSSHKeySchema,
  deleteSSHKeySchema,
  updateSSHKeySchema,
} from './validator'

const payload = await getPayload({ config: configPromise })

// No need to handle try/catch that abstraction is taken care by next-safe-actions
export const createSSHKeyAction = protectedClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'createSSHKeyAction',
  })
  .schema(createSSHKeySchema)
  .action(async ({ clientInput }) => {
    const { name, description, privateKey, publicKey } = clientInput

    const response = await payload.create({
      collection: 'sshKeys',
      data: {
        name,
        description,
        privateKey,
        publicKey,
      },
    })

    if (response) {
      revalidatePath('/settings/ssh-keys')
    }

    return response
  })

export const updateSSHKeyAction = protectedClient
  .metadata({ actionName: 'updateSSHKeyAction' })
  .schema(updateSSHKeySchema)
  .action(async ({ clientInput }) => {
    const { id, ...data } = clientInput

    const response = await payload.update({
      id,
      data,
      collection: 'sshKeys',
    })

    if (response) {
      revalidatePath('/settings/ssh-keys')
    }

    return response
  })

export const deleteSSHKeyAction = protectedClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'deleteSSHKeyAction',
  })
  .schema(deleteSSHKeySchema)
  .action(async ({ clientInput }) => {
    const { id } = clientInput

    const response = await payload.delete({
      collection: 'sshKeys',
      id,
    })

    if (response) {
      revalidatePath('/settings/ssh-keys')
      return { deleted: true }
    }
  })
