import { Job, Queue, Worker } from 'bullmq'
import { NodeSSH } from 'node-ssh'

import { dokku } from '@/lib/dokku'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendEvent } from '@/lib/sendEvent'
import { dynamicSSH } from '@/lib/ssh'

const queueName = 'database-backup-auth'

interface QueueArgs {
  databaseType: string
  databaseName: string
  awsAccessKeyId: string
  awsSecretAccessKey: string
  awsDefaultRegion: string
  provider: number
  endPointUrl: string
  sshDetails: {
    privateKey: string
    host: string
    username: string
    port: number
  }
  serverDetails: {
    id: string
  }
}

const backupAuthQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const {
      awsAccessKeyId,
      awsDefaultRegion,
      awsSecretAccessKey,
      databaseName,
      databaseType,
      endPointUrl,
      provider,
      sshDetails,
      serverDetails,
    } = job.data

    let ssh: NodeSSH | null = null

    console.log(
      `starting backup auth for ${databaseType} database called ${databaseName} `,
    )

    try {
      ssh = await dynamicSSH(sshDetails)

      const result = await dokku.database.backup.auth(
        ssh,
        databaseType,
        databaseName,
        awsAccessKeyId,
        awsSecretAccessKey,
        awsDefaultRegion,
        provider,
        endPointUrl,
        {
          onStdout: async chunk => {
            sendEvent({
              pub,
              message: chunk.toString(),
              serverId: serverDetails.id,
            })
          },
          onStderr: async chunk => {
            sendEvent({
              pub,
              message: chunk.toString(),
              serverId: serverDetails.id,
            })
          },
        },
      )

      if (result.code === 0) {
        sendEvent({
          pub,
          message: `✅ Backup auth for ${databaseType} database called ${databaseName} completed successfully`,
          serverId: serverDetails.id,
        })
      }
    } catch (error) {
      let message = error instanceof Error ? error.message : ''
      throw new Error(
        `❌ Backup auth for ${databaseType} database called ${databaseName} failed: ${message}`,
      )
    } finally {
      if (ssh) {
        ssh.dispose()
      }
    }
  },
  { connection: queueConnection },
)

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  console.log('failed', job?.name, err)
  const serverDetails = job?.data?.serverDetails

  if (serverDetails) {
    sendEvent({
      pub,
      message: err.message,
      serverId: serverDetails.id,
    })
  }
})

export const addBackupAuthQueue = async (data: QueueArgs) => {
  const id = `backup-auth-${data.databaseName}-${data.databaseType}:${new Date().getTime()}`
  return await backupAuthQueue.add(id, data, {
    ...jobOptions,
    jobId: id,
  })
}
