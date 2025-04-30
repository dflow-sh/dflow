'use server'

import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'

import { protectedClient } from '@/lib/safe-action'
import { addTemplateDeployQueue } from '@/queues/template/deploy'

import {
  DeleteTemplateSchema,
  createTemplateSchema,
  deployTemplateSchema,
  updateTemplateSchema,
} from './validator'

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


export const deployTemplateAction = protectedClient
  .metadata({
    actionName: 'deployTemplateAction',
  })
  .schema(deployTemplateSchema)
  .action(async ({ clientInput }) => {
    const { id, serverId } = clientInput
    const cookieStore = await cookies()
    const payloadToken = cookieStore.get('payload-token')

    const response = await addTemplateDeployQueue({
      templateId: id,
      serverId: serverId,
      payloadToken: `${payloadToken?.value}`,
    })

    if (response.id) {
      return { success: true }
    }
  })

export const updateTemplate = protectedClient
  .metadata({
    actionName: 'updateTemplate',
  })
  .schema(updateTemplateSchema)
  .action(async ({ clientInput }) => {
    const { id, name, services, description } = clientInput

    const response = await payload.update({
      collection: 'templates',
      where: {
        id: {
          equals: id,
        },
      },
      data: {
        name,
        description,
        services,
      },
    })
    return response
  })
