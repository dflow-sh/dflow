'use server'

import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'

import { publicClient } from '@/lib/safe-action'

import { createServerSchema, deleteServiceSchema } from './validator'

const payload = await getPayload({ config: configPromise })

// No need to handle try/catch that abstraction is taken care by next-safe-actions
export const createServerAction = publicClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'createServerAction',
  })
  .schema(createServerSchema)
  .action(async ({ clientInput }) => {
    const { name, description, type, ip, port, username, sshKey } = clientInput

    const response = await payload.create({
      collection: 'servers',
      data: {
        name,
        description,
        type,
        ip,
        port,
        username,
        sshKey,
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
  .schema(deleteServiceSchema)
  .action(async ({ clientInput }) => {
    const { id } = clientInput

    const response = await payload.delete({
      collection: 'servers',
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
