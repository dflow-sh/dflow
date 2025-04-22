import configPromise from '@payload-config'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'

import { addDockerImageDeploymentQueue } from '@/queues/app/dockerImage-deployment'
import { addDockerFileDeploymentQueue } from '@/queues/app/dockerfile-deployment'
import { addRailpackDeployQueue } from '@/queues/app/railpack-deployment'
import { addCreateDatabaseQueue } from '@/queues/database/create'

const payload = await getPayload({ config: configPromise })

export const triggerDeployment = async ({
  serviceId,
}: {
  serviceId: string
}) => {
  const cookieStore = await cookies()
  const payloadToken = cookieStore.get('payload-token')

  const {
    project,
    type,
    providerType,
    githubSettings,
    provider,
    environmentVariables,
    populatedVariables,
    variables,
    ...serviceDetails
  } = await payload.findByID({
    collection: 'services',
    depth: 10,
    id: serviceId,
  })

  let queueResponseId: string | undefined = ''

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

    if (type === 'app') {
      if (providerType === 'github' && githubSettings) {
        const builder = serviceDetails.builder ?? 'railpack'

        if (builder === 'railpack') {
          const { id } = await addRailpackDeployQueue({
            appName: serviceDetails.name,
            userName: githubSettings.owner,
            repoName: githubSettings.repository,
            branch: githubSettings.branch,
            sshDetails: sshDetails,
            serviceDetails: {
              deploymentId: deploymentResponse.id,
              serviceId: serviceDetails.id,
              provider,
              serverId: project.server.id,
              port: githubSettings.port
                ? githubSettings.port.toString()
                : '3000',
              populatedVariables: populatedVariables ?? '{}',
              variables: variables ?? [],
            },
            payloadToken: `${payloadToken?.value}`,
          })

          queueResponseId = id
        } else if (builder === 'dockerfile') {
          const { id } = await addDockerFileDeploymentQueue({
            appName: serviceDetails.name,
            userName: githubSettings.owner,
            repoName: githubSettings.repository,
            branch: githubSettings.branch,
            sshDetails: sshDetails,
            serviceDetails: {
              deploymentId: deploymentResponse.id,
              serviceId: serviceDetails.id,
              provider,
              serverId: project.server.id,
              port: githubSettings.port
                ? githubSettings.port.toString()
                : '3000',
              populatedVariables: populatedVariables ?? '{}',
              variables: variables ?? [],
            },
            payloadToken: `${payloadToken?.value}`,
          })

          queueResponseId = id
        }
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

      queueResponseId = databaseQueueResponse.id
    }

    if (
      type === 'docker' &&
      serviceDetails.dockerDetails &&
      serviceDetails.dockerDetails.url
    ) {
      const { account, url, ports } = serviceDetails.dockerDetails

      const dockerImageQueueResponse = await addDockerImageDeploymentQueue({
        sshDetails,
        payloadToken: `${payloadToken?.value}`,
        appName: serviceDetails.name,
        serviceDetails: {
          deploymentId: deploymentResponse.id,
          account: typeof account === 'object' ? account : null,
          populatedVariables: populatedVariables ?? '{}',
          variables: variables ?? [],
          imageName: url,
          ports,
          serverId: project.server.id,
          serviceId: serviceDetails.id,
        },
      })

      queueResponseId = dockerImageQueueResponse.id
    }
  }

  return queueResponseId
}
