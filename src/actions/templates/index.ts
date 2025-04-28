'use server'

import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'

import { protectedClient } from '@/lib/safe-action'

import { DeleteTemplateSchema, createTemplateSchema } from './validator'

const payload = await getPayload({ config: configPromise })

export const createTemplate = protectedClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'createTemplate',
  })
  .schema(createTemplateSchema)
  .action(async ({ clientInput }) => {
    const { name, description, services } = clientInput
    console.log('in server', services)

    const response = await payload.create({
      collection: 'templates',
      data: {
        name,
        description,
        services,
      },
    })
    return response
  })

export const deleteTemplate = protectedClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'deleteTemplate',
  })
  .schema(DeleteTemplateSchema)
  .action(async ({ clientInput }) => {
    const { id } = clientInput

    const response = await payload.delete({
      collection: 'templates',
      id,
    })

    if (response) {
      revalidatePath('/templates')
      return { deleted: true }
    }
  })

export const getTemplateById = protectedClient
  .metadata({ actionName: 'getTemplateById' })
  .schema(DeleteTemplateSchema)
  .action(async ({ clientInput }) => {
    const { id } = clientInput
    const response = await payload.findByID({
      collection: 'templates',
      id,
    })
    return response
  })
