'use server'

import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'

import { protectedClient } from '@/lib/safe-action'
import { addCreateDatabaseQueue } from '@/queues/database/create'
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

    const {
      project,
      type,
      providerType,
      githubSettings,
      provider,
      environmentVariables,
      ...serviceDetails
    } = await payload.findByID({
      collection: 'services',
      depth: 10,
      id: serviceId,
    })

    console.dir({ serviceDetails }, { depth: Infinity })

    const deploymentResponse = await payload.create({
      collection: 'deployments',
      data: {
        service: serviceId,
        status: 'building',
      },
    })

    if (
      typeof project === 'object' &&
      typeof project?.server === 'object' &&
      typeof project?.server?.sshKey === 'object'
    ) {
      const sshDetails = {
        privateKey: project?.server?.sshKey?.privateKey,
        host: project?.server?.ip,
        username: project?.server?.username,
        port: project?.server?.port,
      }

      if (type === 'app' || type === 'docker') {
        if (providerType === 'github' && githubSettings) {
          const queueResponse = await addDeploymentQueue({
            appName: serviceDetails.name,
            userName: githubSettings.owner,
            repoName: githubSettings.repository,
            branch: githubSettings.branch,
            sshDetails: sshDetails,
            serviceDetails: {
              deploymentId: deploymentResponse.id,
              serviceId: serviceDetails.id,
              provider,
              environmentVariables:
                typeof environmentVariables === 'object' &&
                environmentVariables &&
                !Array.isArray(environmentVariables)
                  ? environmentVariables
                  : undefined,
              serverId: project.server.id,
            },
            payloadToken: `${payloadToken?.value}`,
          })

          console.dir({ queueResponse })
        }
      }

      if (type === 'database' && serviceDetails.databaseDetails?.type) {
        const databaseQueueResponse = await addCreateDatabaseQueue({
          databaseName: serviceDetails.name,
          databaseType: serviceDetails.databaseDetails?.type,
          sshDetails,
          serviceDetails: {
            id: serviceDetails.id,
            deploymentId: deploymentResponse.id,
            serverId: project.server.id,
          },
          payloadToken: payloadToken?.value,
        })

        console.dir({ databaseQueueResponse })
      }
    }

    if (deploymentResponse) {
      revalidatePath(`/dashboard/project/${projectId}/service/${serviceId}`)
    }

    return deploymentResponse
  })
