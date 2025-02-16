import { dokku } from '../lib/dokku'
import { dynamicSSH, sshConnect } from '../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'
import createDebug from 'debug'
import Redis from 'ioredis'

import { pub } from '@/lib/redis'

interface QueueArgs {
  appId: string
  appName: string
  userName: string
  repoName: string
  branch?: string
  token: string
  sshDetails?: {
    host: string
    port: number
    username: string
    privateKey: string
  }
  serviceDetails: {
    deploymentId: string
    serviceId: string
    projectId: string
  }
}

const queueName = 'deploy-app'
const debug = createDebug(`queue:${queueName}`)

const redisClient = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})

export const deployAppQueue = new Queue<QueueArgs>(queueName, {
  connection: redisClient,
})

/**
 * - Create app
 */
const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const {
      appId,
      appName,
      userName: repoOwner,
      repoName,
      branch,
      sshDetails,
      serviceDetails,
      token,
    } = job.data

    // const payload = await getPayload({ config: configPromise })

    console.log('from queue', job.id)
    console.dir(
      {
        data: {
          appId,
          appName,
          userName: repoOwner,
          repoName,
          branch,
          sshDetails,
          serviceDetails,
          token,
        },
      },
      { depth: Infinity },
    )

    debug(`starting deploy app queue for ${appId} app`)

    const branchName = branch ?? 'main'
    const ssh = sshDetails ? await dynamicSSH(sshDetails) : await sshConnect()

    const cloningResponse = await dokku.git.sync({
      ssh,
      appName: appName,
      // gitRepoUrl: `https://github.com/${repoOwner}/${repoName}.git`,
      gitRepoUrl: `https://oauth2:${token}@github.com/${repoOwner}/${repoName}.git`,
      branchName,
      options: {
        onStdout: async chunk => {
          await pub.publish('my-channel', chunk.toString())
          // console.log(chunk.toString())
        },
        onStderr: async chunk => {
          await pub.publish('my-channel', chunk.toString())
          // console.log(chunk.toString())
        },
      },
    })

    console.log({ cloningResponse })

    const sshResponse = await dokku.letsencrypt.enable(ssh, appName, {
      onStdout: async chunk => {
        await pub.publish('my-channel', chunk.toString())
        console.info(chunk.toString())
      },
      onStderr: chunk => {
        console.info(chunk.toString())
      },
    })

    console.log({ sshResponse })

    debug(
      `finishing create app ${appName} from https://github.com/${repoOwner}/${repoName}.git`,
    )

    // if (!res.stderr) {
    //   await pub.publish('my-channel', 'successfully created')
    //   console.log(' working')
    // } else if (res.stderr) {
    //   await pub.publish('my-channel', 'failed to create app')
    //   console.log('now working')
    // }
    ssh.dispose()

    // Updating status to success at ending
    // const deploymentResponse = await payload.update({
    //   collection: 'deployments',
    //   id: serviceDetails.deploymentId,
    //   data: {
    //     status: 'success',
    //   },
    // })

    // console.log({ deploymentResponse })

    // revalidatePath(
    //   `/dashboard/project/${serviceDetails.projectId}/service/${serviceDetails.serviceId}/deployments`,
    // )
  },
  { connection: redisClient },
)

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  // const payload = await getPayload({ config: configPromise })
  await pub.publish('my-channel', '❌ failed to create app')

  if (job?.data) {
    console.log('now working')
    const { appId, serviceDetails } = job.data
    debug(`${job?.id} has failed for for ${appId}   : ${err.message}`)

    // Updating deployment-status to failed & revalidating deployment path
    // await payload.update({
    //   collection: 'deployments',
    //   id: serviceDetails.deploymentId,
    //   data: {
    //     status: 'failed',
    //   },
    // })

    // revalidatePath(
    //   `/dashboard/project/${serviceDetails.projectId}/service/${serviceDetails.serviceId}/deployments`,
    // )
  }
})
