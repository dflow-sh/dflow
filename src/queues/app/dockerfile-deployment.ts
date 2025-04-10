import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import { createAppAuth } from '@octokit/auth-app'
import configPromise from '@payload-config'
import { Job, Queue, Worker } from 'bullmq'
import { NodeSSH } from 'node-ssh'
import { Octokit } from 'octokit'
import { getPayload } from 'payload'

import { payloadWebhook } from '@/lib/payloadWebhook'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendEvent } from '@/lib/sendEvent'
import { GitProvider } from '@/payload-types'

interface QueueArgs {
  appName: string
  userName: string
  repoName: string
  branch: string
  sshDetails: {
    host: string
    port: number
    username: string
    privateKey: string
  }
  serviceDetails: {
    deploymentId: string
    serviceId: string
    provider: string | GitProvider | null | undefined
    port?: string
    environmentVariables: Record<string, unknown> | undefined
    serverId: string
  }
  payloadToken: string
}

const QUEUE_NAME = 'deploy-app'

export const dockerdFileAppQueue = new Queue<QueueArgs>(QUEUE_NAME, {
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
    const {
      appName,
      userName: repoOwner,
      repoName,
      branch,
      sshDetails,
      serviceDetails,
      payloadToken,
    } = job.data
    const { serverId, serviceId } = serviceDetails

    try {
      console.log('inside queue: ' + QUEUE_NAME)
      console.log('from queue', job.id)
      ssh = await dynamicSSH(sshDetails)

      // Step 1: Setting dokku port
      const port = serviceDetails.port ?? '3000'
      sendEvent({
        message: `Stated exposing port ${port}`,
        pub,
        serverId,
        serviceId,
        channelId: serviceDetails.deploymentId,
      })

      const portResponse = await dokku.ports.set(
        ssh,
        appName,
        'http',
        '80',
        port,
        {
          onStdout: async chunk => {
            sendEvent({
              message: chunk.toString(),
              pub,
              serverId,
              serviceId,
              channelId: serviceDetails.deploymentId,
            })
          },
          onStderr: async chunk => {
            sendEvent({
              message: chunk.toString(),
              pub,
              serverId,
              serviceId,
              channelId: serviceDetails.deploymentId,
            })
          },
        },
      )

      if (portResponse) {
        sendEvent({
          message: `✅ Successfully exposed port ${port}`,
          pub,
          serverId,
          serviceId,
          channelId: serviceDetails.deploymentId,
        })
      } else {
        sendEvent({
          message: `❌ Failed to exposed port ${port}`,
          pub,
          serverId,
          serviceId,
          channelId: serviceDetails.deploymentId,
        })
      }

      // Step 2: Setting environment variables & add build-args
      if (serviceDetails.environmentVariables) {
        sendEvent({
          message: `Stated setting environment variables`,
          pub,
          serverId,
          serviceId,
          channelId: serviceDetails.deploymentId,
        })

        const envResponse = await dokku.config.set({
          ssh,
          name: appName,
          values: Object.entries(serviceDetails.environmentVariables).map(
            ([key, value]) => {
              // handling the case where value is an object for reference environment variables
              const formattedValue =
                value && typeof value === 'object' && 'value' in value
                  ? value.value
                  : value

              return {
                key,
                value: `${formattedValue}`,
              }
            },
          ),
          noRestart: true,
          options: {
            onStdout: async chunk => {
              sendEvent({
                message: chunk.toString(),
                pub,
                serverId,
                serviceId,
                channelId: serviceDetails.deploymentId,
              })
            },
            onStderr: async chunk => {
              sendEvent({
                message: chunk.toString(),
                pub,
                serverId,
                serviceId,
                channelId: serviceDetails.deploymentId,
              })
            },
          },
        })

        if (envResponse) {
          sendEvent({
            message: `✅ Successfully set environment variables`,
            pub,
            serverId,
            serviceId,
            channelId: serviceDetails.deploymentId,
          })
        } else {
          sendEvent({
            message: `❌ Failed to set environment variables`,
            pub,
            serverId,
            serviceId,
            channelId: serviceDetails.deploymentId,
          })
        }

        const option = Object.entries(serviceDetails.environmentVariables)
          .map(([key, value]) => {
            // handling the case where value is an object for reference environment variables
            const formattedValue =
              value && typeof value === 'object' && 'value' in value
                ? value.value
                : value

            return `--build-arg ${key}="${formattedValue}"`
          })
          .join(' ')

        console.log('updated build-params', { option })

        sendEvent({
          message: `Stated adding environment variables as build arguments`,
          pub,
          serverId,
          serviceId,
          channelId: serviceDetails.deploymentId,
        })

        const buildArgsResponse = await dokku.docker.options({
          action: 'add',
          appName,
          option,
          phase: 'build',
          ssh,
          options: {
            onStdout: async chunk => {
              sendEvent({
                message: chunk.toString(),
                pub,
                serverId,
                serviceId,
                channelId: serviceDetails.deploymentId,
              })
            },
            onStderr: async chunk => {
              sendEvent({
                message: chunk.toString(),
                pub,
                serverId,
                serviceId,
                channelId: serviceDetails.deploymentId,
              })
            },
          },
        })

        console.log({ buildArgsResponse })

        if (buildArgsResponse.code === 0) {
          sendEvent({
            message: `✅ Successfully added environment variables as build arguments`,
            pub,
            serverId,
            serviceId,
            channelId: serviceDetails.deploymentId,
          })
        } else {
          sendEvent({
            message: `❌ Failed to add environment variables as build arguments`,
            pub,
            serverId,
            serviceId,
            channelId: serviceDetails.deploymentId,
          })
        }
      }

      // Step 4: Cloning the repo
      // Generating github-app details for deployment
      sendEvent({
        message: `Stated cloning repository`,
        pub,
        serverId,
        serviceId,
        channelId: serviceDetails.deploymentId,
      })

      let token = ''

      // todo: currently logic is purely related to github-app deployment need to make generic for bitbucket & gitlab
      const branchName = branch

      // Generating a git clone token
      if (
        typeof serviceDetails.provider === 'object' &&
        serviceDetails.provider?.github
      ) {
        const { appId, privateKey, installationId } =
          serviceDetails.provider.github

        const octokit = new Octokit({
          authStrategy: createAppAuth,
          auth: {
            appId,
            privateKey,
            installationId,
          },
        })

        const response = (await octokit.auth({
          type: 'installation',
        })) as {
          token: string
        }

        token = response.token
      }

      const cloningResponse = await dokku.git.sync({
        ssh,
        appName: appName,
        gitRepoUrl: `https://oauth2:${token}@github.com/${repoOwner}/${repoName}.git`,
        branchName,
        options: {
          onStdout: async chunk => {
            sendEvent({
              message: chunk.toString(),
              pub,
              serverId,
              serviceId,
              channelId: serviceDetails.deploymentId,
            })
          },
          onStderr: async chunk => {
            sendEvent({
              message: chunk.toString(),
              pub,
              serverId,
              serviceId,
              channelId: serviceDetails.deploymentId,
            })
          },
        },
      })

      if (cloningResponse.code === 0) {
        sendEvent({
          message: `✅ Successfully cloned & build repository`,
          pub,
          serverId,
          serviceId,
          channelId: serviceDetails.deploymentId,
        })
      } else {
        sendEvent({
          message: `❌ Failed to clone & build repository`,
          pub,
          serverId,
          serviceId,
          channelId: serviceDetails.deploymentId,
        })

        // exiting from the flow
        throw new Error('cloning and building failed')
      }

      // Step 5: SSL certificate generation
      sendEvent({
        message: `Started generating SSL`,
        pub,
        serverId,
        serviceId,
        channelId: serviceDetails.deploymentId,
      })

      const letsencryptResponse = await dokku.letsencrypt.enable(ssh, appName, {
        onStdout: async chunk => {
          sendEvent({
            message: chunk.toString(),
            pub,
            serverId,
            serviceId,
            channelId: serviceDetails.deploymentId,
          })
        },
        onStderr: async chunk => {
          sendEvent({
            message: chunk.toString(),
            pub,
            serverId,
            serviceId,
            channelId: serviceDetails.deploymentId,
          })
        },
      })

      if (letsencryptResponse.code === 0) {
        sendEvent({
          message: `✅ Successfully generated SSL certificates`,
          pub,
          serverId,
          serviceId,
          channelId: serviceDetails.deploymentId,
        })
      } else {
        sendEvent({
          message: `❌ Failed to generated SSL certificates`,
          pub,
          serverId,
          serviceId,
          channelId: serviceDetails.deploymentId,
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
      const defaultDomain = domainsResponse

      if (defaultDomain.length) {
        await payloadWebhook({
          payloadToken,
          data: {
            type: 'domain.update',
            data: {
              serviceId: serviceDetails.serviceId,
              domain: {
                domain: defaultDomain,
                operation: 'add',
                autoRegenerateSSL: false,
                certificateType: 'letsencrypt',
              },
            },
          },
        })

        sendEvent({
          message: `✅ Updated domain details`,
          pub,
          serverId,
          serviceId,
        })
      }

      const logs = (
        await pub.lrange(serviceDetails.deploymentId, 0, -1)
      ).reverse()

      await payload.update({
        collection: 'deployments',
        data: {
          status: 'success',
          logs,
        },
        id: serviceDetails.deploymentId,
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
        channelId: serviceDetails.deploymentId,
      })

      const logs = (
        await pub.lrange(serviceDetails.deploymentId, 0, -1)
      ).reverse()

      await payload.update({
        collection: 'deployments',
        data: {
          status: 'failed',
          logs,
        },
        id: serviceDetails.deploymentId,
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

export const addDockerFileDeploymentQueue = async (data: QueueArgs) => {
  // Create a unique job ID that prevents duplicates but allows identification
  const id = `dockerfile-deploy:${data.appName}:${Date.now()}`
  return await dockerdFileAppQueue.add(id, data, {
    ...jobOptions,
    jobId: id,
  })
}
