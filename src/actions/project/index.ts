'use server'

import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'

import { publicClient } from '@/lib/safe-action'

import { createProjectSchema, deleteProjectSchema } from './validator'

const payload = await getPayload({ config: configPromise })

// No need to handle try/catch that abstraction is taken care by next-safe-actions
export const createProjectAction = publicClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'exampleAction',
  })
  .schema(createProjectSchema)
  .action(async ({ clientInput }) => {
    const { name, description } = clientInput

    const response = await payload.create({
      collection: 'projects',
      data: {
        name,
        description,
      },
    })

    if (response) {
      revalidatePath('/dashboard')
    }

    return response
  })

export const deleteProjectAction = publicClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'exampleAction',
  })
  .schema(deleteProjectSchema)
  .action(async ({ clientInput }) => {
    const { id } = clientInput

    const response = await payload.delete({
      collection: 'projects',
      id,
    })

    if (response) {
      revalidatePath('/dashboard')
      return { deleted: true }
    }
  })
