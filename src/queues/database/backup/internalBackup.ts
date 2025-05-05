import { Job, Queue, Worker } from 'bullmq'
import { NodeSSH } from 'node-ssh'

import { dokku } from '@/lib/dokku'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendEvent } from '@/lib/sendEvent'
import { dynamicSSH } from '@/lib/ssh'

const queueName = 'database-backup-internal'

interface QueueArgs {
  databaseType: string
  databaseName: string
  dumpFileName: string
  type: 'import' | 'export'
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

const internalBackupQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const {
      databaseName,
      databaseType,
      sshDetails,
      serverDetails,
      type,
      dumpFileName,
    } = job.data

    let ssh: NodeSSH | null = null

    console.log(
      `starting ${type} backup for ${databaseType} database called ${databaseName} `,
    )

    try {
      ssh = await dynamicSSH(sshDetails)

      if (type === 'import') {
        const result = await dokku.database.internal.import(
          ssh,
          databaseType,
          databaseName,
          dumpFileName,
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
            message: `✅ Imported backup for ${databaseType} database called ${databaseName} was successful`,
            serverId: serverDetails.id,
          })
        }

        console.log('Backup import result:', result)
      } else {
        const result = await dokku.database.internal.export(
          ssh,
          databaseType,
          databaseName,
          dumpFileName,
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
            message: `✅ Exported backup for ${databaseType} database called ${databaseName} was successful`,
            serverId: serverDetails.id,
          })
        }

        console.log('Backup export result:', result)
      }
    } catch (error) {
      let message = error instanceof Error ? error.message : ''
      throw new Error(
        `❌ ${type} backup for ${databaseType} database called ${databaseName} failed: ${message}`,
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
  console.error(`Job failed with id ${job?.id}:`, err)

  const serverDetails = job?.data?.serverDetails

  if (serverDetails) {
    sendEvent({
      pub,
      message: err.message,
      serverId: serverDetails.id,
    })
  }
})

export const addInternalBackupQueue = async (data: QueueArgs) => {
  const id = `backup-internal-${data.databaseType}-${data.databaseName}`
  return await internalBackupQueue.add(id, data, {
    ...jobOptions,
    jobId: id,
  })
}
