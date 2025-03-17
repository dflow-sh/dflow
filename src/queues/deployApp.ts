import { dokku } from '../lib/dokku'
import { dynamicSSH } from '../lib/ssh'
import { createAppAuth } from '@octokit/auth-app'
import { Job, Queue, Worker } from 'bullmq'
import { NodeSSH } from 'node-ssh'
import { Octokit } from 'octokit'

import { payloadWebhook } from '@/lib/payloadWebhook'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
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

      console.log('inside queue: ' + QUEUE_NAME)
      console.log('from queue', job.id)
      ssh = await dynamicSSH(sshDetails)

      // Step 2: Setting dokku port
      const port = serviceDetails.port ?? '3000'
      await pub.publish('my-channel', `Stated exposing port ${port}`)

      const portResponse = await dokku.ports.set(
        ssh,
        appName,
        'http',
        '80',
        port,
        {
          onStdout: async chunk => {
            await pub.publish('my-channel', chunk.toString())
          },
          onStderr: async chunk => {
            await pub.publish('my-channel', chunk.toString())
          },
        },
      )

      if (portResponse) {
        await pub.publish('my-channel', `✅ Successfully exposed port ${port}`)
      } else {
        await pub.publish('my-channel', `❌ Failed to exposed port ${port}`)
      }

      // Step 3: Setting environment variables
      if (serviceDetails.environmentVariables) {
        await pub.publish('my-channel', `Stated setting environment variables`)

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
              await pub.publish('my-channel', chunk.toString())
            },
            onStderr: async chunk => {
              await pub.publish('my-channel', chunk.toString())
            },
          },
        })

        if (envResponse) {
          await pub.publish(
            'my-channel',
            `✅ Successfully set environment variables`,
          )
        } else {
          await pub.publish(
            'my-channel',
            `❌ Failed to set environment variables`,
          )
        }
      }

      // Step 4: Cloning the repo
      // Generating github-app details for deployment
      await pub.publish('my-channel', `Stated cloning repository`)

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
            await pub.publish('my-channel', chunk.toString())
          },
          onStderr: async chunk => {
            await pub.publish('my-channel', chunk.toString())
          },
        },
      })

      if (cloningResponse.code === 0) {
        await pub.publish(
          'my-channel',
          `✅ Successfully cloned & build repository`,
        )
      } else {
        await pub.publish('my-channel', `❌ Failed to clone & build repository`)

        // exiting from the flow
        return
      }

      console.log('generated SSL')

      // Step 5: SSL certificate generation
      await pub.publish('my-channel', `Started generating SSL`)

      const letsencryptResponse = await dokku.letsencrypt.enable(ssh, appName, {
        onStdout: async chunk => {
          await pub.publish('my-channel', chunk.toString())
        },
        onStderr: chunk => {},
      })

      console.dir({ letsencryptResponse, serviceDetails }, { depth: Infinity })

      if (letsencryptResponse.code === 0) {
        await pub.publish(
          'my-channel',
          `✅ Successfully generated SSL certificates`,
        )

        await pub.publish('my-channel', `Updating domain details...`)

        // todo: for now taking to first domain name
        const domainsResponse = await dokku.domains.report(ssh, appName)
        const defaultDomain = domainsResponse?.[0]

        console.log({ domainsResponse })

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

          await pub.publish('my-channel', `✅ Updated domain details`)

          await pub.publish(
            'refresh-channel',
            JSON.stringify({ refresh: true }),
          )
        }
      } else {
        await pub.publish(
          'my-channel',
          `❌ Failed to generated SSL certificates`,
        )
      }

      // todo: add webhook to update deployment status
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message)
      }

      throw new Error('Failed to deploy app')
    } finally {
      if (ssh) {
        ssh.dispose()
      }
    }
  },
  { connection: queueConnection },
)

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  // const payload = await getPayload({ config: configPromise })
  await pub.publish('my-channel', '❌ failed to create app')

  if (job?.data) {
    console.log('now working')
    const { serviceDetails } = job.data
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
