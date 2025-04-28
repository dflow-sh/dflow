import { addDockerImageDeploymentQueue } from '../app/dockerImage-deployment'
import { addDockerFileDeploymentQueue } from '../app/dockerfile-deployment'
import { addRailpackDeployQueue } from '../app/railpack-deployment'
import { addCreateDatabaseQueue } from '../database/create'
import configPromise from '@payload-config'
import { Queue, QueueEvents, Worker } from 'bullmq'
import { getPayload } from 'payload'

import { queueConnection } from '@/lib/redis'
import { Service } from '@/payload-types'

interface QueueArgs {
  templateId: string
  serverId: string
  payloadToken: string
}

const queueName = 'deploy-template'

export const createPluginQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

// {
//   "id": "680f63994fc04025f089c375",
//   "name": "hasura-template",
//   "description": "this template has all services required to deploy hasura",
//   "services": [
//     {
//       "type": "database",
//       "githubSettings": {
//         "buildPath": "/",
//         "port": 3000
//       },
//       "builder": "railpack",

//       "databaseDetails": {
//         "type": "postgres"
//       },

//       "dockerDetails": {
//         "ports": []
//       },
//       "name": "hasura-postgres",
//       "variables": [],
//       "id": "clear-amethyst"
//     },
//     {
//       "type": "docker",
//       "githubSettings": {
//         "buildPath": "/",
//         "port": 3000
//       },
//       "builder": "railpack",
//       "databaseDetails": {},
//       "dockerDetails": {
//         "url": "hasura/graphql-engine:latest",
//         "ports": [
//           {
//             "hostPort": 80,
//             "containerPort": 8080,
//             "scheme": "http",
//             "id": "680f6399749680000118a75c"
//           }
//         ]
//       },
//       "name": "hasura-docker",
//       "variables": [
//         {
//           "key": "HASURA_GRAPHQL_DATABASE_URL",
//           "value": "${{postgres:hasura-postgres.DATABASE_URI}}",
//           "id": "680f6399749680000118a75d"
//         },

//         {
//           "key": "HASURA_GRAPHQL_ENABLE_CONSOLE",
//           "value": "true",
//           "id": "680f6399749680000118a75e"
//         }
//       ],
//       "id": "objective-magenta"
//     }
//   ],
//   "createdAt": "2025-04-28T11:16:41.561Z",
//   "updatedAt": "2025-04-28T11:16:41.561Z"
// }

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const { templateId, serverId, payloadToken } = job.data
    try {
      const payload = await getPayload({ config: configPromise })
      const templateDetails = await payload.findByID({
        collection: 'templates',
        id: templateId,
      })

      // 1 store services data in database
      // 2 follow the sequence create a deployment entry in database
      // 3 trigger the respective queue to details
      // 4 use waitUntilFinished boolean and go to next-step
      // 5 if anything failed add retry mechanism

      // Step 1: create entries in database
      const services = templateDetails?.services ?? []

      if (!services.length) {
        throw new Error('Please attach services to deploy the template')
      }

      // 1.1 create a project
      const projectDetails = await payload.create({
        collection: 'projects',
        data: {
          name: templateDetails?.name,
          server: serverId,
        },
      })

      let createdServices: Service[] = []

      // 1.2 map through services and create services in database
      for await (const service of services) {
        const { type, name } = service

        if (type === 'database' && service?.databaseDetails) {
          const serviceResponse = await payload.create({
            collection: 'services',
            data: {
              name: name ?? '',
              type,
              databaseDetails: {
                type: service.databaseDetails?.type,
                // todo: add exposed ports
                exposedPorts: [],
              },
              project: projectDetails?.id,
            },
            depth: 10,
          })

          createdServices.push(serviceResponse)
        } else if (type === 'docker' && service?.dockerDetails) {
          const serviceResponse = await payload.create({
            collection: 'services',
            data: {
              name: name ?? '',
              type,
              dockerDetails: service?.dockerDetails,
              project: projectDetails?.id,
              variables: service?.variables,
            },
            depth: 10,
          })

          createdServices.push(serviceResponse)
        } else if (type === 'app') {
          // todo: handle all git-providers cases
          if (service?.providerType === 'github' && service?.githubSettings) {
            const serviceResponse = await payload.create({
              collection: 'services',
              data: {
                name: name ?? '',
                type,
                project: projectDetails?.id,
                variables: service?.variables,
                githubSettings: service?.githubSettings,
                providerType: service?.providerType,
                provider: service?.provider,
                builder: service?.builder,
              },
              depth: 10,
            })

            createdServices.push(serviceResponse)
          }
        }
      }

      // Step 2: map through deployment sequence
      // 2.1 create a deployment entry in database
      // 2.2 if it's docker or app create app first, then add environment variables
      // 2.3 trigger the respective queue
      // 2.4 use waitUntilFinished and go-to next step anything
      for await (const createdService of createdServices) {
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
        } = createdService

        let queueResponseId: string | undefined = ''

        const deploymentResponse = await payload.create({
          collection: 'deployments',
          data: {
            service: serviceDetails.id,
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
                  payloadToken,
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
                  payloadToken,
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
              payloadToken,
            })

            const queueEvents = new QueueEvents(queueName, {
              connection: queueConnection,
            })
            const response =
              await databaseQueueResponse.waitUntilFinished(queueEvents)
            queueResponseId = databaseQueueResponse.id
          }

          if (
            type === 'docker' &&
            serviceDetails.dockerDetails &&
            serviceDetails.dockerDetails.url
          ) {
            const { account, url, ports } = serviceDetails.dockerDetails

            const dockerImageQueueResponse =
              await addDockerImageDeploymentQueue({
                sshDetails,
                payloadToken,
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
      }
    } catch (error) {}
  },
  {
    connection: queueConnection,
    // Add concurrency limit
    concurrency: 1,
  },
)
