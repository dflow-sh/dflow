'use server'

import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'

import { publicClient } from '@/lib/safe-action'

import { createSSHKeySchema, deleteSSHKeySchema } from './validator'

const payload = await getPayload({ config: configPromise })

// No need to handle try/catch that abstraction is taken care by next-safe-actions
export const createSSHKeyAction = publicClient
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

export const deleteSSHKeyAction = publicClient
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
