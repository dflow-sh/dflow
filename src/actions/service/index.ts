'use server'

import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'

import { publicClient } from '@/lib/safe-action'

import { createServiceSchema, deleteServiceSchema } from './validator'

const payload = await getPayload({ config: configPromise })

// No need to handle try/catch that abstraction is taken care by next-safe-actions
export const createServiceAction = publicClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'createServiceAction',
  })
  .schema(createServiceSchema)
  .action(async ({ clientInput }) => {
    const { name, description, projectId, type } = clientInput

    const response = await payload.create({
      collection: 'services',
      data: {
        project: projectId,
        name,
        description,
        type,
      },
    })

    if (response) {
      revalidatePath(`/dashboard/project/${projectId}`)
    }

    return response
  })

export const deleteServiceAction = publicClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'deleteServiceAction',
  })
  .schema(deleteServiceSchema)
  .action(async ({ clientInput }) => {
    const { id } = clientInput

    const response = await payload.delete({
      collection: 'services',
      id,
    })

    if (response) {
      const projectId =
        typeof response.project === 'object'
          ? response.project.id
          : response.project

      // Revalidate the parent project page and the service page
      revalidatePath(`/dashboard/project/${projectId}/service/${id}`)
      revalidatePath(`/dashboard/project/${projectId}`)
      return { deleted: true }
    }
  })
