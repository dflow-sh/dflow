'use server'

import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'

import { protectedClient } from '@/lib/safe-action'

import { createDeploymentSchema } from './validator'

const payload = await getPayload({ config: configPromise })

// No need to handle try/catch that abstraction is taken care by next-safe-actions
export const createDeploymentAction = protectedClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'createDeploymentAction',
  })
  .schema(createDeploymentSchema)
  .action(async ({ clientInput }) => {
    const { serviceId, projectId } = clientInput

    const response = await payload.create({
      collection: 'deployments',
      data: {
        service: serviceId,
        status: 'queued',
      },
    })

    if (response) {
      revalidatePath(`/dashboard/project/${projectId}/service/${serviceId}`)
    }

    return response
  })
