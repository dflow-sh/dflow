'use server'

import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'

import { protectedClient } from '@/lib/safe-action'

import { createDomainSchema, deleteDomainSchema } from './validator'

const payload = await getPayload({ config: configPromise })

// No need to handle try/catch that abstraction is taken care by next-safe-actions
export const createDomainAction = protectedClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'createDomainAction',
  })
  .schema(createDomainSchema)
  .action(async ({ clientInput }) => {
    const { host, autoRegenerateSSL, certificateType, serviceId, projectId } =
      clientInput

    const response = await payload.create({
      collection: 'domains',
      data: {
        service: serviceId,
        hostName: host,
        autoRegenerateSSL: autoRegenerateSSL ?? false,
        certificateType: certificateType ?? 'none',
      },
    })

    if (response) {
      revalidatePath(
        `/dashboard/project/${projectId}/service/${serviceId}/domains`,
      )
    }

    return response
  })

export const deleteDomainAction = protectedClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'deleteDomainAction',
  })
  .schema(deleteDomainSchema)
  .action(async ({ clientInput }) => {
    const { serviceId, projectId, id } = clientInput

    const response = await payload.delete({
      collection: 'domains',
      id,
    })

    if (response) {
      revalidatePath(
        `/dashboard/project/${projectId}/service/${serviceId}/domains`,
      )
    }

    return response
  })
