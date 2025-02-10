'use server'

import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'

import { publicClient } from '@/lib/safe-action'

import { createSSHKeySchema, deleteSSHKeySchema } from './validator'

const payload = await getPayload({ config: configPromise })

// No need to handle try/catch that abstraction is taken care by next-safe-actions
export const createServerAction = publicClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'createServerAction',
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
      revalidatePath('/settings/servers')
    }

    return response
  })

export const deleteServerAction = publicClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'deleteServerAction',
  })
  .schema(deleteSSHKeySchema)
  .action(async ({ clientInput }) => {
    const { id } = clientInput

    const response = await payload.delete({
      collection: 'sshKeys',
      id,
    })

    if (response) {
      //   const projectId =
      //     typeof response. === 'object'
      //       ? response.project.id
      //       : response.project

      //   // Revalidate the parent project page and the service page
      //   revalidatePath(`/dashboard/project/${projectId}/service/${id}`)
      //   revalidatePath(`/dashboard/project/${projectId}`)
      return { deleted: true }
    }
  })
