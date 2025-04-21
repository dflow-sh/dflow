'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { protectedClient } from '@/lib/safe-action'

import { createTemplateSchema } from './validator'

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
