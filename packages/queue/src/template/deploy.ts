import { addDeployQueue } from '../app/deploy'
import { addDockerImageDeploymentQueue } from '../app/dockerImage-deployment'
import { addCreateDatabaseWithPluginsQueue } from '../database/createWithPlugins'
import { addExposeDatabasePortQueue } from '../database/expose'
import { addUpdateEnvironmentVariablesQueue } from '../environment/update'
import { updateVolumesQueue } from '../volume/updateVolumesQueue'
import configPromise from '@payload-config'
import { NodeSSH } from 'node-ssh'
import { getPayload } from 'payload'

import { getQueue, getWorker } from '@dflow/lib/bullmq'
import { dokku } from '@dflow/lib/dokku'
import { jobOptions, pub, queueConnection } from '@dflow/lib/redis'
import { sendActionEvent } from '@dflow/lib/sendEvent'
import { dynamicSSH, extractSSHDetails } from '@dflow/lib/ssh'
import { waitForJobCompletion } from '@dflow/lib/utils/waitForJobCompletion'
import { Project, Service } from '@/payload-types'

interface QueueArgs {
  services: Omit<Service, 'project'>[]
  serverDetails: {
    id: string
  }
  project: Project
  tenantDetails: {
    slug: string
  }
  showEnvironmentVariableLogs?: boolean
}

export const addTemplateDeployQueue = async (data: QueueArgs) => {
  const QUEUE_NAME = `server-${data.serverDetails.id}-deploy-template`

  const deployTemplateQueue = getQueue({
    name: QUEUE_NAME,
    connection: queueConnection,
  })

  // todo: need to add deployment strategy which will sort the services or based on dependency
  // todo: change the waitForJobCompletion method from for-loop to performant way
  getWorker<QueueArgs>({
    name: QUEUE_NAME,
    connection: queueConnection,
    processor: async job => {
      const {
        services,
        tenantDetails,
        project,
        showEnvironmentVariableLogs = true,
      } = job.data
      const payload = await getPayload({ config: configPromise })

      // Sorting database to be first
      const sortedServices = services.sort((a, b) => {
        const order = { database: 0, app: 1, docker: 1 }
        return order[a.type] - order[b.type]
      })

      try {
        // Step 2: map through deployment sequence
        // 2.1 create a deployment entry in database
        // 2.2 if it's docker or app create app first, then add environment variables
        // 2.3 trigger the respective queue
        // 2.4 use waitUntilFinished and go-to next step anything
        for await (const createdService of sortedServices) {
          const {
            type,
            providerType,
            githubSettings,
            provider,
            populatedVariables,
            azureSettings,
            giteaSettings,
            variables,
            volumes,
            bitbucketSettings,
            gitlabSettings,
            ...serviceDetails
          } = createdService

          const deploymentResponse = await payload.create({
            collection: 'deployments',
            data: {
              service: serviceDetails.id,
              status: 'queued',
            },
          })

          // sending refresh event after deployment entry got created
          sendActionEvent({
            pub,
            action: 'refresh',
            tenantSlug: tenantDetails.slug,
          })

          if (
            typeof project === 'object' &&
            typeof project?.server === 'object'
          ) {
            const sshDetails = extractSSHDetails({ project })

            if (type === 'app') {
              let ssh: NodeSSH | null = null
              const builder = serviceDetails.builder ?? 'buildPacks'

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

                if (volumes?.length) {
                  await updateVolumesQueue({
                    restart: false,
                    service: createdService,
                    project: project,
                    serverDetails: {
                      id: project.server.id,
                    },
                    tenantDetails,
                  })
                }

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
                      tenantDetails,
                      exposeDatabase: true,
                      showEnvironmentVariableLogs,
                    })

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
                const deployAppQueue = await addDeployQueue({
                  appName: serviceDetails.name,
                  sshDetails: sshDetails,
                  serviceDetails: {
                    deploymentId: deploymentResponse.id,
                    serviceId: serviceDetails.id,
                    provider,
                    serverId: project.server.id,
                    providerType,
                    azureSettings,
                    githubSettings,
                    giteaSettings,
                    bitbucketSettings,
                    gitlabSettings,
                    populatedVariables: updatedPopulatedVariables ?? '{}',
                    variables: updatedVariables ?? [],
                    builder,
                  },
                  tenantSlug: tenantDetails.slug,
                })

                await waitForJobCompletion(deployAppQueue)
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

            if (
              type === 'docker' &&
              serviceDetails.dockerDetails &&
              serviceDetails.dockerDetails.url
            ) {
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

                if (volumes?.length) {
                  await updateVolumesQueue({
                    restart: false,
                    service: createdService,
                    project: project,
                    serverDetails: {
                      id: project.server.id,
                    },
                    tenantDetails,
                  })
                }

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
                      tenantDetails,
                      exposeDatabase: true,
                      showEnvironmentVariableLogs,
                    })

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

                const dockerImageQueueResponse =
                  await addDockerImageDeploymentQueue({
                    sshDetails,
                    appName: serviceDetails.name,
                    serviceDetails: {
                      deploymentId: deploymentResponse.id,
                      account: typeof account === 'object' ? account : null,
                      populatedVariables: updatedPopulatedVariables ?? '{}',
                      variables: updatedVariables ?? [],
                      imageName: url,
                      ports: ports ?? [],
                      serverId: project.server.id,
                      serviceId: serviceDetails.id,
                      name: serviceDetails.name,
                    },
                    tenantSlug: tenantDetails.slug,
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

            if (type === 'database' && serviceDetails.databaseDetails?.type) {
              const { exposedPorts = [] } = serviceDetails?.databaseDetails
              // add ports exposing process
              const databaseQueueResponse =
                await addCreateDatabaseWithPluginsQueue({
                  databaseName: serviceDetails.name,
                  databaseType: serviceDetails.databaseDetails?.type,
                  sshDetails,
                  serviceDetails: {
                    id: serviceDetails.id,
                    deploymentId: deploymentResponse.id,
                    serverId: project.server.id,
                  },
                  tenant: {
                    slug: tenantDetails.slug,
                  },
                })

              await waitForJobCompletion(databaseQueueResponse)

              if (exposedPorts?.length) {
                const portsExposureResponse = await addExposeDatabasePortQueue({
                  databaseName: serviceDetails.name,
                  databaseType: serviceDetails.databaseDetails?.type,
                  sshDetails,
                  serverDetails: {
                    id: project.server.id,
                  },
                  serviceDetails: {
                    action: 'expose',
                    id: serviceDetails.id,
                  },
                  tenant: {
                    slug: tenantDetails.slug,
                  },
                })

                await waitForJobCompletion(portsExposureResponse)
              }
            }
          }
        }
      } catch (error) {
        let message = error instanceof Error ? error.message : ''
        throw new Error(message)
      }
    },
  })

  const id = `deploy-template:${new Date().getTime()}`
  return await deployTemplateQueue.add(id, data, { ...jobOptions, jobId: id })
}
