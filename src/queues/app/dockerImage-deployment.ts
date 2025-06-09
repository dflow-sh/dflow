import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import configPromise from '@payload-config'
import { NodeSSH } from 'node-ssh'
import { getPayload } from 'payload'

import { getQueue, getWorker } from '@/lib/bullmq'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendActionEvent, sendEvent } from '@/lib/sendEvent'
import { server } from '@/lib/server'
import { DockerRegistry, Service } from '@/payload-types'

type PortsType = NonNullable<NonNullable<Service['dockerDetails']>['ports']>

interface QueueArgs {
  appName: string
  sshDetails: {
    host: string
    port: number
    username: string
    privateKey: string
  }
  serviceDetails: {
    deploymentId: string
    serviceId: string
    ports: PortsType
    account: DockerRegistry | null
    variables: NonNullable<Service['variables']>
    populatedVariables: string
    serverId: string
    name: string
    imageName: string
  }
  tenantSlug: string
}

export const addDockerImageDeploymentQueue = async (data: QueueArgs) => {
  const QUEUE_NAME = `server-${data?.serviceDetails?.serverId}-deploy-app-dockerImage`

  const dockerdImageQueue = getQueue({
    name: QUEUE_NAME,
    connection: queueConnection,
  })

  getWorker<QueueArgs>({
    name: QUEUE_NAME,
    processor: async job => {
      const payload = await getPayload({ config: configPromise })
      let ssh: NodeSSH | null = null
      const { appName, sshDetails, serviceDetails, tenantSlug } = job.data
      const { serverId, serviceId, ports, account, imageName, deploymentId } =
        serviceDetails

      try {
        console.log('inside queue: ' + QUEUE_NAME)
        console.log('from queue', job.id)

        // updating the deployment status to building
        await payload.update({
          collection: 'deployments',
          id: serviceDetails.deploymentId,
          data: {
            status: 'building',
          },
        })

        sendActionEvent({
          action: 'refresh',
          pub,
          tenantSlug,
        })

        sendActionEvent({
          action: 'refresh',
          pub,
          tenantSlug,
        })

        ssh = await dynamicSSH(sshDetails)

        // deleting docker-image every-time to pull latest image
        await server.docker.deleteImages({
          ssh,
          images: [imageName],
        })

        // Step 1: Setting dokku ports
        if (ports && ports.length) {
          const formattedPorts = `${ports.map(port => port.containerPort).join(', ')}`

          // validate weather port is set or not
          const exposedPorts = (await dokku.ports.report(ssh, appName)) ?? []
          const alreadyExposedPorts: PortsType = []
          const unExposedPorts: PortsType = []

          ports.forEach(
            ({ scheme, hostPort, containerPort, ...portDetails }) => {
              const portExposed = exposedPorts.includes(
                `${scheme}:${hostPort}:${containerPort}`,
              )

              if (portExposed) {
                alreadyExposedPorts.push({
                  scheme,
                  hostPort,
                  containerPort,
                  ...portDetails,
                })
              } else {
                unExposedPorts.push({
                  scheme,
                  hostPort,
                  containerPort,
                  ...portDetails,
                })
              }
            },
          )

          if (alreadyExposedPorts.length) {
            sendEvent({
              message: `${alreadyExposedPorts.map(({ scheme, hostPort, containerPort }) => `${scheme}:${hostPort}:${containerPort}`)} already exposed skipping exposure!`,
              pub,
              serverId,
              serviceId,
              channelId: deploymentId,
            })
          }

          if (unExposedPorts.length) {
            sendEvent({
              message: `Stated exposing ports ${unExposedPorts.map(({ scheme, hostPort, containerPort }) => `${scheme}:${hostPort}:${containerPort}`)}`,
              pub,
              serverId,
              serviceId,
              channelId: deploymentId,
            })

            const portResponse = await dokku.ports.add({
              ssh,
              appName,
              options: {
                onStdout: async chunk => {
                  sendEvent({
                    message: chunk.toString(),
                    pub,
                    serverId,
                    serviceId,
                    channelId: deploymentId,
                  })
                },
                onStderr: async chunk => {
                  sendEvent({
                    message: chunk.toString(),
                    pub,
                    serverId,
                    serviceId,
                    channelId: deploymentId,
                  })
                },
              },
              ports: unExposedPorts.map(port => ({
                container: `${port.containerPort}`,
                host: `${port.hostPort}`,
                scheme: port.scheme,
              })),
            })

            if (portResponse) {
              sendEvent({
                message: `✅ Successfully exposed port ${formattedPorts}`,
                pub,
                serverId,
                serviceId,
                channelId: deploymentId,
              })
            } else {
              sendEvent({
                message: `❌ Failed to exposed port ${formattedPorts}`,
                pub,
                serverId,
                serviceId,
                channelId: deploymentId,
              })
            }
          }
        }

        // Step 2: Add permissions if account has added
        if (account) {
          const { username, type, password } = account

          const accountResponse = await dokku.docker.registry.login({
            ssh,
            type,
            password,
            username,
            options: {
              onStdout: async chunk => {
                sendEvent({
                  message: chunk.toString(),
                  pub,
                  serverId,
                  serviceId,
                  channelId: deploymentId,
                })
              },
              onStderr: async chunk => {
                sendEvent({
                  message: chunk.toString(),
                  pub,
                  serverId,
                  serviceId,
                  channelId: deploymentId,
                })
              },
            },
          })

          if (accountResponse.code === 0) {
            sendEvent({
              message: `✅ Successfully logged into registry`,
              pub,
              serverId,
              serviceId,
              channelId: deploymentId,
            })
          } else {
            // Throwing an error incase of wrong credentials
            throw new Error('registry credentials invalid')
          }
        }

        // Step 3: Docker image deployment
        sendEvent({
          message: `Stated pulling image`,
          pub,
          serverId,
          serviceId,
          channelId: deploymentId,
        })

        const imageResponse = await dokku.git.deployImage({
          appName,
          imageName,
          ssh,
          options: {
            onStdout: async chunk => {
              sendEvent({
                message: chunk.toString(),
                pub,
                serverId,
                serviceId,
                channelId: deploymentId,
              })
            },
            onStderr: async chunk => {
              sendEvent({
                message: chunk.toString(),
                pub,
                serverId,
                serviceId,
                channelId: deploymentId,
              })
            },
          },
        })

        if (imageResponse.code === 0) {
          sendEvent({
            message: `✅ Successfully deployed app`,
            pub,
            serverId,
            serviceId,
            channelId: deploymentId,
          })
        } else {
          throw new Error('image-pull failed')
        }

        // Checking if http is enabled or not
        const httpEnabled = ports && ports.find(port => port.hostPort === 80)

        if (httpEnabled) {
          // Step 4: Check for Let's Encrypt status & generate SSL
          const letsencryptStatus = await dokku.letsencrypt.status({
            appName,
            ssh,
          })

          if (
            letsencryptStatus.code === 0 &&
            letsencryptStatus.stdout === 'true'
          ) {
            sendEvent({
              message: `✅ SSL enabled, skipping SSL generation`,
              pub,
              serverId,
              serviceId,
              channelId: deploymentId,
            })
          } else {
            sendEvent({
              message: `Started generating SSL`,
              pub,
              serverId,
              serviceId,
              channelId: deploymentId,
            })

            const letsencryptResponse = await dokku.letsencrypt.enable(
              ssh,
              appName,
              {
                onStdout: async chunk => {
                  sendEvent({
                    message: chunk.toString(),
                    pub,
                    serverId,
                    serviceId,
                    channelId: deploymentId,
                  })
                },
                onStderr: async chunk => {
                  sendEvent({
                    message: chunk.toString(),
                    pub,
                    serverId,
                    serviceId,
                    channelId: deploymentId,
                  })
                },
              },
            )

            if (letsencryptResponse.code === 0) {
              sendEvent({
                message: `✅ Successfully generated SSL certificates`,
                pub,
                serverId,
                serviceId,
                channelId: deploymentId,
              })
            } else {
              sendEvent({
                message: `❌ Failed to generated SSL certificates`,
                pub,
                serverId,
                serviceId,
                channelId: deploymentId,
              })
            }
          }
        } else {
          sendEvent({
            message: 'No HTTP port found, skipping SSL generation',
            pub,
            serverId,
            serviceId,
            channelId: deploymentId,
          })
        }

        sendEvent({
          message: `Updating domain details...`,
          pub,
          serverId,
          serviceId,
        })

        const domainsResponse = await dokku.domains.report(ssh, appName)

        if (domainsResponse.length) {
          try {
            const { domains = [] } = await payload.findByID({
              id: serviceId,
              collection: 'services',
            })

            await payload.update({
              collection: 'services',
              id: serviceId,
              data: {
                domains: domainsResponse?.map(domain => {
                  const domainExists = domains?.find(
                    domainDetails => domainDetails.domain === domain,
                  )

                  if (domainExists) {
                    return {
                      ...domainExists,
                      synced: true,
                    }
                  }

                  return {
                    domain,
                    synced: true,
                  }
                }),
              },
            })

            sendEvent({
              message: `✅ Updated domain details`,
              pub,
              serverId,
              serviceId,
            })
          } catch (error) {
            const message = error instanceof Error ? error.message : ''
            sendEvent({
              message: `❌ Failed to update domain details: ${message}`,
              pub,
              serverId,
              serviceId,
            })
          }
        }

        const logs = (await pub.lrange(deploymentId, 0, -1)).reverse()

        await payload.update({
          collection: 'deployments',
          data: {
            status: 'success',
            logs,
          },
          id: deploymentId,
        })

        sendActionEvent({
          action: 'refresh',
          pub,
          tenantSlug,
        })

        // todo: add webhook to update deployment status
      } catch (error) {
        let message = ''

        if (error instanceof Error) {
          message = error.message
        }

        sendEvent({
          message,
          pub,
          serverId,
          serviceId,
          channelId: deploymentId,
        })

        const logs = (await pub.lrange(deploymentId, 0, -1)).reverse()

        await payload.update({
          collection: 'deployments',
          data: {
            status: 'failed',
            logs,
          },
          id: deploymentId,
        })

        sendActionEvent({
          action: 'refresh',
          pub,
          tenantSlug,
        })

        throw new Error(`❌ Failed to deploy app: ${message}`)
      } finally {
        if (ssh) {
          ssh.dispose()
        }
      }
    },
    connection: queueConnection,
  })

  // Create a unique job ID that prevents duplicates but allows identification
  const id = `dockerImage-deploy:${data.appName}:${Date.now()}`

  return await dockerdImageQueue.add(id, data, {
    ...jobOptions,
    jobId: id,
  })
}
