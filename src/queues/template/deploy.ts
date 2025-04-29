import { addDockerImageDeploymentQueue } from '../app/dockerImage-deployment'
import { addDockerFileDeploymentQueue } from '../app/dockerfile-deployment'
import { addRailpackDeployQueue } from '../app/railpack-deployment'
import { addCreateDatabaseQueue } from '../database/create'
import { addUpdateEnvironmentVariablesQueue } from '../environment/update'
import configPromise from '@payload-config'
import { Job, Queue, Worker } from 'bullmq'
import { NodeSSH } from 'node-ssh'
import { getPayload } from 'payload'
import {
  Config,
  NumberDictionary,
  adjectives,
  animals,
  uniqueNamesGenerator,
} from 'unique-names-generator'

import { dokku } from '@/lib/dokku'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendEvent } from '@/lib/sendEvent'
import { dynamicSSH } from '@/lib/ssh'
import { Service } from '@/payload-types'

interface QueueArgs {
  templateId: string
  serverId: string
  payloadToken: string
}

const queueName = 'deploy-template'

export const deployTemplateQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

async function waitForJobCompletion(
  job: Job,
  options: {
    maxAttempts?: number
    pollingInterval?: number
    successStates?: string[]
    failureStates?: string[]
  } = {},
) {
  console.log('inside the loop')
  const {
    maxAttempts = 180, // 30 minutes with 10s interval
    pollingInterval = 10000, // 10 seconds
    successStates = ['completed'],
    failureStates = ['failed', 'unknown'],
  } = options

  let attempts = 0

  while (attempts < maxAttempts) {
    try {
      // Get the current state of the job
      const state = await job.getState()

      console.log({ state })

      // Check if job completed successfully
      if (successStates.includes(state)) {
        return { success: true }
      }

      // Check if job failed
      if (failureStates.includes(state)) {
        throw new Error('job execution failed')
      }

      // Wait for the polling interval before checking again
      await new Promise(resolve => setTimeout(resolve, pollingInterval))
      attempts++
    } catch (error) {
      throw new Error(
        `Error polling job ${job.id}: ${error instanceof Error ? error.message : ''}`,
      )
    }
  }

  // If we've reached the maximum number of attempts, consider it a timeout
  throw new Error(`Error execution timeout`)
}

const handleGenerateName = (): string => {
  const numberDictionary = NumberDictionary.generate({ min: 100, max: 999 })

  const nameConfig: Config = {
    dictionaries: [adjectives, animals, numberDictionary],
    separator: '-',
    length: 3,
    style: 'lowerCase',
  }

  return uniqueNamesGenerator(nameConfig)
}

// todo: need to add deployment strategy which will sort the services or based on dependency
// todo: change the waitForJobCompletion method from for-loop to performant way
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

      sendEvent({
        message: 'Started deploying template',
        pub,
        serverId,
      })

      // 1.1 create a project
      const projectDetails = await payload.create({
        collection: 'projects',
        data: {
          name: `${templateDetails.name}`,
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
              name: `${name}`,
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
              name: `${name}`,
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
                name: `${name}`,
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

      sendEvent({
        message: 'Created database entries',
        pub,
        serverId,
      })

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

        console.log({
          project,
          type,
          providerType,
          githubSettings,
          provider,
          environmentVariables,
          populatedVariables,
          variables,
          ...serviceDetails,
        })

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
              let ssh: NodeSSH | null = null
              const builder = serviceDetails.builder ?? 'railpack'

              try {
                ssh = await dynamicSSH(sshDetails)
                const appCreationResponse = await dokku.apps.create(
                  ssh,
                  serviceDetails?.name,
                )

                // app creation failed need to thronging an error
                if (!appCreationResponse) {
                  throw new Error(`❌ Failed to create ${serviceDetails?.name}`)
                }

                let updatedServiceDetails: Service | null = null

                // if variables are added updating the variables
                if (variables?.length) {
                  const environmentVariablesQueue =
                    await addUpdateEnvironmentVariablesQueue({
                      sshDetails,
                      serverDetails: {
                        id: project?.server?.id,
                      },
                      serviceDetails: {
                        id: serviceDetails.id,
                        name: serviceDetails.name,
                        noRestart: true,
                        previousVariables: [],
                        variables: variables ?? [],
                      },
                    })

                  environmentVariablesQueue.getState()

                  await waitForJobCompletion(environmentVariablesQueue)

                  // fetching the latest details of the service
                  updatedServiceDetails = await payload.findByID({
                    collection: 'services',
                    id: serviceDetails.id,
                  })
                }

                const updatedPopulatedVariables =
                  updatedServiceDetails?.populatedVariables ||
                  populatedVariables

                const updatedVariables =
                  updatedServiceDetails?.variables || variables

                // triggering queue with latest values
                if (builder === 'railpack') {
                  const railpackDeployQueue = await addRailpackDeployQueue({
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
                      populatedVariables: updatedPopulatedVariables ?? '{}',
                      variables: updatedVariables ?? [],
                    },
                    payloadToken,
                  })

                  await waitForJobCompletion(railpackDeployQueue)
                } else if (builder === 'dockerfile') {
                  const dockerFileDeploymentQueue =
                    await addDockerFileDeploymentQueue({
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

                  await waitForJobCompletion(dockerFileDeploymentQueue)
                }
              } catch (error) {
                let message = error instanceof Error ? error.message : ''
                throw new Error(message)
              } finally {
                // disposing ssh even on error cases
                if (ssh) {
                  ssh.dispose()
                }
              }
            }
          }

          if (
            type === 'docker' &&
            serviceDetails.dockerDetails &&
            serviceDetails.dockerDetails.url
          ) {
            console.log('inside docker')
            let ssh: NodeSSH | null = null
            const { account, url, ports } = serviceDetails.dockerDetails

            try {
              ssh = await dynamicSSH(sshDetails)

              const appCreationResponse = await dokku.apps.create(
                ssh,
                serviceDetails?.name,
              )

              // app creation failed need to thronging an error
              if (!appCreationResponse) {
                throw new Error(
                  `❌ Failed to create-app ${serviceDetails?.name}`,
                )
              }

              let updatedServiceDetails: Service | null = null

              if (variables?.length) {
                const environmentVariablesQueue =
                  await addUpdateEnvironmentVariablesQueue({
                    sshDetails,
                    serverDetails: {
                      id: project?.server?.id,
                    },
                    serviceDetails: {
                      id: serviceDetails.id,
                      name: serviceDetails.name,
                      noRestart: true,
                      previousVariables: [],
                      variables: variables ?? [],
                    },
                  })

                await waitForJobCompletion(environmentVariablesQueue)

                // fetching the latest details of the service
                updatedServiceDetails = await payload.findByID({
                  collection: 'services',
                  id: serviceDetails.id,
                })
              }

              const updatedPopulatedVariables =
                updatedServiceDetails?.populatedVariables || populatedVariables

              const updatedVariables =
                updatedServiceDetails?.variables || variables

              const dockerImageQueueResponse =
                await addDockerImageDeploymentQueue({
                  sshDetails,
                  payloadToken,
                  appName: serviceDetails.name,
                  serviceDetails: {
                    deploymentId: deploymentResponse.id,
                    account: typeof account === 'object' ? account : null,
                    populatedVariables: updatedPopulatedVariables ?? '{}',
                    variables: updatedVariables ?? [],
                    imageName: url,
                    ports,
                    serverId: project.server.id,
                    serviceId: serviceDetails.id,
                  },
                })

              await waitForJobCompletion(dockerImageQueueResponse)
            } catch (error) {
              let message = error instanceof Error ? error.message : ''
              throw new Error(message)
            } finally {
              // disposing ssh even on error cases
              if (ssh) {
                ssh.dispose()
              }
            }
          }

          console.log('outside database', serviceDetails.databaseDetails)
          if (type === 'database' && serviceDetails.databaseDetails?.type) {
            console.log('database hitted')
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

            console.log({ databaseQueueResponse })

            await waitForJobCompletion(databaseQueueResponse)
          }
        }
      }

      sendEvent({
        message: '✅ Successfully deployed template',
        pub,
        serverId,
      })
    } catch (error) {
      let message = error instanceof Error ? error.message : ''
      throw new Error(message)
    }
  },
  {
    connection: queueConnection,
    concurrency: 1,
  },
)

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  console.log('Failed to deploy template', err)
})

export const addTemplateDeployQueue = async (data: QueueArgs) => {
  const id = `deploy-template:${new Date().getTime()}`
  return await deployTemplateQueue.add(id, data, { ...jobOptions, jobId: id })
}
