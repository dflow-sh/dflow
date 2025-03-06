import { cookies } from 'next/headers'
import { CollectionAfterChangeHook } from 'payload'

import { Deployment } from '@/payload-types'
import { createDatabaseQueue } from '@/queues/database/create'
import { addDeploymentQueue } from '@/queues/deployApp'

export const triggerDokkuDeployment: CollectionAfterChangeHook<
  Deployment
> = async ({ doc, req: { payload, headers }, operation }) => {
  const cookieStore = await cookies()
  const payloadToken = cookieStore.get('payload-token')

  console.dir(payloadToken?.value, { depth: Infinity })

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
    id: typeof doc.service === 'object' ? doc.service.id : doc.service,
  })

  // A if check for getting all ssh keys & server details
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

    // For create operation trigging dokku deployment
    if (operation === 'create') {
      if (type === 'app' || type === 'docker') {
        if (providerType === 'github' && githubSettings) {
          //  Adding to queue
          const queueResponse = await addDeploymentQueue({
            appName: serviceDetails.name,
            userName: githubSettings.owner,
            repoName: githubSettings.repository,
            branch: githubSettings.branch,
            sshDetails: sshDetails,
            serviceDetails: {
              deploymentId: doc.id,
              serviceId: serviceDetails.id,
              projectId: project.id,
              provider,
              name: serviceDetails.name,
              environmentVariables:
                typeof environmentVariables === 'object' &&
                environmentVariables &&
                !Array.isArray(environmentVariables)
                  ? environmentVariables
                  : undefined,
            },
          })

          console.log({ queueResponse })
        }
      }

      // Handling databases deployments
      if (type === 'database' && serviceDetails.databaseDetails?.type) {
        const databaseQueueResponse = await createDatabaseQueue.add(
          'create-database',
          {
            databaseName: serviceDetails.name,
            databaseType: serviceDetails.databaseDetails?.type,
            sshDetails,
            payloadToken: payloadToken?.value,
            serviceDetails: {
              id: serviceDetails.id,
            },
          },
        )

        console.log({ databaseQueueResponse })
      }

      //  Updating deployment status to building
      await payload.update({
        collection: 'deployments',
        id: doc.id,
        data: {
          status: 'building',
        },
      })
    }
  }

  return doc
}
