import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'

import { jobOptions, pub, queueConnection } from '@/lib/redis'

const queueName = 'restart-app'

interface QueueArgs {
  sshDetails: {
    privateKey: string
    host: string
    username: string
    port: number
  }
  serviceDetails: {
    id: string
    name: string
  }
}

const restartAppQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const { sshDetails, serviceDetails } = job.data

    console.log(`starting restartApp queue for ${serviceDetails.name}`)

    const ssh = await dynamicSSH(sshDetails)
    const res = await dokku.process.restart(ssh, serviceDetails.name, {
      onStdout: async chunk => {
        await pub.publish('my-channel', chunk.toString())
        console.info(chunk.toString())
      },
      onStderr: async chunk => {
        await pub.publish('my-channel', chunk.toString())
        console.info(chunk.toString())
      },
    })

    await pub.publish(
      'my-channel',
      `✅ Successfully restarted ${serviceDetails.name}`,
    )

    ssh.dispose()
  },
  { connection: queueConnection },
)

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  console.log('Failed to restart app', err)

  const serviceDetails = job?.data?.serviceDetails

  await pub.publish(
    'my-channel',
    `❌ Failed restarting ${serviceDetails?.name}`,
  )
})

export const addRestartAppQueue = async (data: QueueArgs) => {
  const id = `restart-${data.serviceDetails.name}:${new Date().getTime()}`
  return await restartAppQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
