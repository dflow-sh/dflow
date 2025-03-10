import { dokku } from '../lib/dokku'
import { dynamicSSH } from '../lib/ssh'
import { createAppAuth } from '@octokit/auth-app'
import { Job, Queue, Worker } from 'bullmq'
import { Octokit } from 'octokit'

import { payloadWebhook } from '@/lib/payloadWebhook'
import { pub, queueConnection } from '@/lib/redis'
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
    projectId: string
    provider: string | GitProvider | null | undefined
    name: string
    port?: string
    environmentVariables: Record<string, unknown> | undefined
  }
  payloadToken: string
}

const queueName = 'deploy-app'

export const deployAppQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const {
      appName,
      userName: repoOwner,
      repoName,
      branch,
      sshDetails,
      serviceDetails,
      payloadToken,
    } = job.data

    console.log('inside queue: ' + queueName)
    console.log('from queue', job.id)
    const ssh = await dynamicSSH(sshDetails)

    // Step 1: Creating a dokku app
    await pub.publish(
      'my-channel',
      `Stated creating a 🐳 ${serviceDetails.name} app`,
    )

    const appResponse = await dokku.apps.create(ssh, serviceDetails.name, {
      onStdout: async chunk => {
        pub.publish('my-channel', chunk.toString())
      },
      onStderr: async chunk => {
        await pub.publish('my-channel', chunk.toString())
      },
    })

    if (appResponse) {
      await pub.publish(
        'my-channel',
        `✅ Successfully created a 🐳 ${serviceDetails.name} app`,
      )
    } else {
      await pub.publish(
        'my-channel',
        `❌ Failed to create a 🐳 ${serviceDetails.name} app`,
      )

      // exiting from the flow
      return
    }

    // Step 2: Setting dokku port
    const port = serviceDetails.port ?? '3000'
    await pub.publish('my-channel', `Stated exposing port ${port}`)

    const portResponse = await dokku.ports.set(
      ssh,
      serviceDetails.name,
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
        name: serviceDetails.name,
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

        await pub.publish('my-channel', `✅ Updated domain details`)

        console.log('domainUpdateResponse', await domainUpdateResponse.json())

        await pub.publish('refresh-channel', JSON.stringify({ refresh: true }))
      }
    } else {
      await pub.publish('my-channel', `❌ Failed to generated SSL certificates`)
    }

    // todo: add webhook to update deployment status

    ssh.dispose()
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

export const addDeploymentQueue = async (data: QueueArgs) =>
  await deployAppQueue.add(queueName, data)
