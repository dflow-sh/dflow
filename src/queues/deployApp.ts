import { dokku } from '../lib/dokku'
import { dynamicSSH } from '../lib/ssh'
import { createAppAuth } from '@octokit/auth-app'
import { Job, Queue, Worker } from 'bullmq'
import { NodeSSH } from 'node-ssh'
import { Octokit } from 'octokit'

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

export const deployAppQueue = new Queue<QueueArgs>(QUEUE_NAME, {
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
    let ssh: NodeSSH | null = null

    try {
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

      console.log('inside queue: ' + QUEUE_NAME)
      console.log('from queue', job.id)
      ssh = await dynamicSSH(sshDetails)

      // Step 1: Setting dokku port
      const port = serviceDetails.port ?? '3000'
      await sendEvent({
        message: `Stated exposing port ${port}`,
        pub,
        serverId,
        serviceId,
      })

      const portResponse = await dokku.ports.set(
        ssh,
        appName,
        'http',
        '80',
        port,
        {
          onStdout: async chunk => {
            await sendEvent({
              message: chunk.toString(),
              pub,
              serverId,
              serviceId,
            })
          },
          onStderr: async chunk => {
            await sendEvent({
              message: chunk.toString(),
              pub,
              serverId,
              serviceId,
            })
          },
        },
      )

      if (portResponse) {
        await sendEvent({
          message: `✅ Successfully exposed port ${port}`,
          pub,
          serverId,
          serviceId,
        })
      } else {
        await sendEvent({
          message: `❌ Failed to exposed port ${port}`,
          pub,
          serverId,
          serviceId,
        })
      }

      // Step 2: Setting environment variables & add build-args
      if (serviceDetails.environmentVariables) {
        await sendEvent({
          message: `Stated setting environment variables`,
          pub,
          serverId,
          serviceId,
        })

        const envResponse = await dokku.config.set({
          ssh,
          name: appName,
          values: Object.entries(serviceDetails.environmentVariables).map(
            ([key, value]) => ({
              key,
              value: value as string,
            }),
          ),
          noRestart: false,
          options: {
            onStdout: async chunk => {
              await sendEvent({
                message: chunk.toString(),
                pub,
                serverId,
                serviceId,
              })
            },
            onStderr: async chunk => {
              await sendEvent({
                message: chunk.toString(),
                pub,
                serverId,
                serviceId,
              })
            },
          },
        })

        if (envResponse) {
          await sendEvent({
            message: `✅ Successfully set environment variables`,
            pub,
            serverId,
            serviceId,
          })
        } else {
          await sendEvent({
            message: `❌ Failed to set environment variables`,
            pub,
            serverId,
            serviceId,
          })
        }

        const option = Object.entries(serviceDetails.environmentVariables)
          .map(([key, value]) => `--build-arg ${key}=${value}`)
          .join(' ')

        await sendEvent({
          message: `Stated adding environment variables as build arguments`,
          pub,
          serverId,
          serviceId,
        })

        const buildArgsResponse = await dokku.docker.options({
          action: 'add',
          appName,
          option,
          phase: 'build',
          ssh,
          options: {
            onStdout: async chunk => {
              await sendEvent({
                message: chunk.toString(),
                pub,
                serverId,
                serviceId,
              })
            },
            onStderr: async chunk => {
              await sendEvent({
                message: chunk.toString(),
                pub,
                serverId,
                serviceId,
              })
            },
          },
        })

        console.log({ buildArgsResponse })

        if (buildArgsResponse.code === 0) {
          await sendEvent({
            message: `✅ Successfully added environment variables as build arguments`,
            pub,
            serverId,
            serviceId,
          })
        } else {
          await sendEvent({
            message: `❌ Failed to add environment variables as build arguments`,
            pub,
            serverId,
            serviceId,
          })
        }
      }

      // Step 4: Cloning the repo
      // Generating github-app details for deployment
      await sendEvent({
        message: `Stated cloning repository`,
        pub,
        serverId,
        serviceId,
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
            await sendEvent({
              message: chunk.toString(),
              pub,
              serverId,
              serviceId,
            })
          },
          onStderr: async chunk => {
            await sendEvent({
              message: chunk.toString(),
              pub,
              serverId,
              serviceId,
            })
          },
        },
      })

      if (cloningResponse.code === 0) {
        await sendEvent({
          message: `✅ Successfully cloned & build repository`,
          pub,
          serverId,
          serviceId,
        })
      } else {
        await sendEvent({
          message: `❌ Failed to clone & build repository`,
          pub,
          serverId,
          serviceId,
        })

        // exiting from the flow
        return
      }

      // Step 5: SSL certificate generation
      await sendEvent({
        message: `Started generating SSL`,
        pub,
        serverId,
        serviceId,
      })

      const letsencryptResponse = await dokku.letsencrypt.enable(ssh, appName, {
        onStdout: async chunk => {
          await sendEvent({
            message: chunk.toString(),
            pub,
            serverId,
            serviceId,
          })
        },
        onStderr: chunk => {},
      })

      console.dir({ letsencryptResponse, serviceDetails }, { depth: Infinity })

      if (letsencryptResponse.code === 0) {
        await sendEvent({
          message: `✅ Successfully generated SSL certificates`,
          pub,
          serverId,
          serviceId,
        })

        await sendEvent({
          message: `Updating domain details...`,
          pub,
          serverId,
          serviceId,
        })

        // todo: for now taking to first domain name
        const domainsResponse = await dokku.domains.report(ssh, appName)
        const defaultDomain = domainsResponse?.[0]

        if (defaultDomain) {
          const domainUpdateResponse = await payloadWebhook({
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

          const deploymentResponse = await payloadWebhook({
            payloadToken: `${payloadToken}`,
            data: {
              type: 'deployment.update',
              data: {
                deployment: {
                  id: serviceDetails.deploymentId,
                  status: 'success',
                },
              },
            },
          })

          console.log('deploymentResponse', await deploymentResponse.json())

          await sendEvent({
            message: `✅ Updated domain details`,
            pub,
            serverId,
            serviceId,
          })

          await pub.publish(
            'refresh-channel',
            JSON.stringify({ refresh: true }),
          )
        }
      } else {
        await sendEvent({
          message: `❌ Failed to generated SSL certificates`,
          pub,
          serverId,
          serviceId,
        })
      }

      // todo: add webhook to update deployment status
    } catch (error) {
      let message = ''

      if (error instanceof Error) {
        message = error.message
      }

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

  const queueData = job?.data

  if (queueData) {
    const { serviceDetails } = queueData
    const { serverId, serviceId } = serviceDetails

    await sendEvent({
      message: err.message,
      pub,
      serverId,
      serviceId,
    })
  }
})

export const addDeploymentQueue = async (data: QueueArgs) => {
  // Create a unique job ID that prevents duplicates but allows identification
  const id = `deploy:${data.appName}:${Date.now()}`
  return await deployAppQueue.add(id, data, {
    ...jobOptions,
    jobId: id,
  })
}
