'use server'

import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'

import { protectedClient } from '@/lib/safe-action'
import { addDeploymentQueue } from '@/queues/deployApp'

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
    const cookieStore = await cookies()
    const payloadToken = cookieStore.get('payload-token')

    const serviceDetails = await payload.findByID({
      collection: 'services',
      id: serviceId,
      depth: 10,
    })

    console.dir({ serviceDetails }, { depth: Infinity })

    if (serviceDetails.type === 'database') {
      throw new Error('Database already deployed!')
    }

    const deploymentResponse = await payload.create({
      collection: 'deployments',
      data: {
        service: serviceId,
        status: 'building',
      },
    })

    // Checking for app-type
    if (
      serviceDetails.id &&
      (serviceDetails.type === 'app' || serviceDetails.type === 'docker') &&
      serviceDetails.providerType === 'github' &&
      serviceDetails.githubSettings
    ) {
      if (
        typeof serviceDetails?.project === 'object' &&
        typeof serviceDetails?.project?.server === 'object' &&
        typeof serviceDetails.project.server.sshKey === 'object'
      ) {
        const { githubSettings, provider, environmentVariables } =
          serviceDetails

        const sshDetails = {
          privateKey: serviceDetails?.project?.server?.sshKey?.privateKey,
          host: serviceDetails?.project?.server?.ip,
          username: serviceDetails?.project?.server?.username,
          port: serviceDetails?.project?.server?.port,
        }

        const queueResponse = await addDeploymentQueue({
          appName: serviceDetails.name,
          branch: githubSettings.branch,
          repoName: githubSettings.repository,
          userName: githubSettings.owner,
          serviceDetails: {
            deploymentId: deploymentResponse.id,
            environmentVariables:
              typeof environmentVariables === 'object' &&
              environmentVariables &&
              !Array.isArray(environmentVariables)
                ? environmentVariables
                : undefined,
            provider,
            serviceId: serviceDetails.id,
          },
          payloadToken: `${payloadToken?.value}`,
          sshDetails,
        })

        console.log({ queueResponse })
      }
    }

    if (deploymentResponse) {
      revalidatePath(`/dashboard/project/${projectId}/service/${serviceId}`)
    }

    return deploymentResponse
  })
