import { cookies } from 'next/headers'
import { CollectionAfterChangeHook } from 'payload'

import { dokku } from '@/lib/dokku'
import { pub } from '@/lib/redis'
import { dynamicSSH } from '@/lib/ssh'
import { Deployment } from '@/payload-types'
import { createDatabaseQueue } from '@/queues/createDatabase'
import { deployAppQueue } from '@/queues/deployApp'

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
      if (type === 'app') {
        if (providerType === 'github' && githubSettings) {
          // Connecting to ssh
          const ssh = await dynamicSSH(sshDetails)

          // Creating a app
          const appResponse = await dokku.apps.create(
            ssh,
            serviceDetails.name,
            {
              onStdout: async chunk => {
                await pub.publish('my-channel', chunk.toString())
                // console.info(chunk.toString());
              },
              onStderr: chunk => {
                console.info({
                  createAppsLogs: {
                    message: chunk.toString(),
                    type: 'stdout',
                  },
                })
              },
            },
          )

          //  Setting dokku port
          const portResponse = await dokku.ports.set(
            ssh,
            serviceDetails.name,
            'http',
            '80',
            githubSettings.port ? `${githubSettings.port}` : '3000',
            {
              onStdout: async chunk => {
                await pub.publish('my-channel', chunk.toString())
                // console.info(chunk.toString());
              },
              onStderr: chunk => {
                console.info({
                  setPortLogs: {
                    message: chunk.toString(),
                    type: 'stdout',
                  },
                })
              },
            },
          )

          //  Adding to queue
          const queueResponse = await deployAppQueue.add('deploy-app', {
            appId: '1',
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
            },
          })

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
    }
  }

  return doc
}
