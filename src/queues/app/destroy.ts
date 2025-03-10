import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'

import { pub, queueConnection } from '@/lib/redis'

const queueName = 'destroy-application'

interface QueueArgs {
  sshDetails: {
    privateKey: string
    host: string
    username: string
    port: number
  }
  serviceDetails: {
    name: string
  }
}

const destroyApplicationQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const { sshDetails, serviceDetails } = job.data

    console.log(`starting deletingApplication queue for ${serviceDetails.name}`)

    const ssh = await dynamicSSH(sshDetails)

    const deletedResponse = await dokku.apps.destroy(ssh, serviceDetails.name, {
      onStdout: async chunk => {
        await pub.publish('my-channel', chunk.toString())
        // console.info(chunk.toString());
      },
      onStderr: async chunk => {
        await pub.publish('my-channel', chunk.toString())

        console.info({
          deleteApplicationLogs: {
            message: chunk.toString(),
            type: 'stdout',
          },
        })
      },
    })

    if (deletedResponse) {
      await pub.publish(
        'my-channel',
        `✅ Successfully deleted ${serviceDetails.name}`,
      )
    }

    ssh.dispose()
  },
  { connection: queueConnection },
)

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  console.log('Failed to delete app', err)

  const serviceDetails = job?.data?.serviceDetails

  await pub.publish('my-channel', `❌ Failed deleting ${serviceDetails?.name}`)
})

export const addDestroyApplicationQueue = async (data: QueueArgs) =>
  await destroyApplicationQueue.add(queueName, data)
