import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import configPromise from '@payload-config'
import { Job, Queue, Worker } from 'bullmq'
import { NodeSSH } from 'node-ssh'
import { getPayload } from 'payload'

import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendEvent } from '@/lib/sendEvent'
import { DockerRegistry, Service } from '@/payload-types'

type PortsType = NonNullable<Service['dockerDetails']>['ports']

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
    imageName: string
  }
}

const QUEUE_NAME = 'deploy-app-dockerImage'

export const dockerdImageQueue = new Queue<QueueArgs>(QUEUE_NAME, {
  connection: queueConnection,
  defaultJobOptions: {
    removeOnComplete: {
      count: 20,
      age: 60 * 60,
    },
  },
})

const worker = new Worker<QueueArgs>(
  QUEUE_NAME,
  async job => {
    const payload = await getPayload({ config: configPromise })
    let ssh: NodeSSH | null = null
    const { appName, sshDetails, serviceDetails } = job.data
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
      await pub.publish('refresh-channel', JSON.stringify({ refresh: true }))

      ssh = await dynamicSSH(sshDetails)

      // Step 1: Setting dokku ports
      if (ports && ports.length) {
        const formattedPorts = `${ports.map(port => port.containerPort).join(', ')}`

        sendEvent({
          message: `Stated exposing ports ${formattedPorts}`,
          pub,
          serverId,
          serviceId,
          channelId: deploymentId,
        })

        const portResponse = await dokku.ports.set({
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
          ports: ports.map(port => ({
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

      // todo: for now taking to first domain name
      const domainsResponse = await dokku.domains.report(ssh, appName)

      if (domainsResponse.length) {
        await payload.update({
          collection: 'services',
          id: serviceId,
          data: {
            domains: domainsResponse?.map(domain => ({
              domain,
            })),
          },
        })

        sendEvent({
          message: `✅ Updated domain details`,
          pub,
          serverId,
          serviceId,
        })
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

      await pub.publish('refresh-channel', JSON.stringify({ refresh: true }))

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

      await pub.publish('refresh-channel', JSON.stringify({ refresh: true }))
      throw new Error(`❌ Failed to deploy app: ${message}`)
    } finally {
      if (ssh) {
        ssh.dispose()
      }
    }
  },
  { connection: queueConnection },
)

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  console.log('Failed to deploy app', err)
})

export const addDockerImageDeploymentQueue = async (data: QueueArgs) => {
  // Create a unique job ID that prevents duplicates but allows identification
  const id = `dockerImage-deploy:${data.appName}:${Date.now()}`

  return await dockerdImageQueue.add(id, data, {
    ...jobOptions,
    jobId: id,
  })
}
