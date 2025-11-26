'use server'

import { protectedClient } from "@core/lib/safe-action"

import { triggerDeployment } from "@core/actions/deployment/deploy"
import { createDeploymentSchema } from "@core/actions/deployment/validator"

// No need to handle try/catch that abstraction is taken care by next-safe-actions
export const createDeploymentAction = protectedClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'createDeploymentAction',
  })
  .inputSchema(createDeploymentSchema)
  .action(async ({ clientInput, ctx }) => {
    const { serviceId, projectId, cache = 'no-cache' } = clientInput
    const {
      userTenant: { tenant },
    } = ctx

    const deploymentQueueId = await triggerDeployment({
      serviceId,
      cache,
      tenantSlug: tenant.slug,
    })

    if (deploymentQueueId) {
      return {
        success: true,
        redirectURL: `/${tenant.slug}/dashboard/project/${projectId}/service/${serviceId}?tab=deployments`,
      }
    }
  })
