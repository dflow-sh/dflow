import configPromise from '@payload-config'
import { Job, Queue, Worker } from 'bullmq'
import { NodeSSH } from 'node-ssh'
import { getPayload } from 'payload'

import { dokku } from '@/lib/dokku'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendEvent } from '@/lib/sendEvent'
import { dynamicSSH } from '@/lib/ssh'

interface QueueArgs {
  databaseType: string
  databaseName: string
  sshDetails: {
    privateKey: string
    host: string
    username: string
    port: number
  }
  serverDetails: {
    id: string
  }
  serviceId: string
  backupId: string
}

const queueName = 'internal-backup-delete'

const internalBackupDeleteQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const payload = await getPayload({ config: configPromise })
    const { sshDetails, serverDetails, databaseType, databaseName, backupId } =
      job.data

    let ssh: NodeSSH | null = null

    console.log(`Deleting backup for database called ${databaseName} `)

    try {
      ssh = await dynamicSSH(sshDetails)

      const { createdAt: backupCreatedTime } = await payload.findByID({
        collection: 'backups',
        id: backupId,
      })

      const backupCreatedDate = new Date(backupCreatedTime)

      const formattedDate = [
        backupCreatedDate.getFullYear(),
        String(backupCreatedDate.getMonth() + 1).padStart(2, '0'),
        String(backupCreatedDate.getDate()).padStart(2, '0'),
        String(backupCreatedDate.getHours()).padStart(2, '0'),
        String(backupCreatedDate.getMinutes()).padStart(2, '0'),
        String(backupCreatedDate.getSeconds()).padStart(2, '0'),
      ].join('-')
      const fileName = `${databaseName}-${formattedDate}.dump`

      const result = await dokku.database.internal.delete({
        ssh,
        backupFileName: fileName,
        options: {
          onStdout(chunk) {
            sendEvent({
              pub,
              message: chunk.toString(),
              serverId: serverDetails.id,
            })
          },
          onStderr(chunk) {
            sendEvent({
              pub,
              message: chunk.toString(),
              serverId: serverDetails.id,
            })
          },
        },
      })

      if (result.code === 0) {
        sendEvent({
          pub,
          message: `✅ Successfully deleted ${fileName}`,
          serverId: serverDetails.id,
        })

        await payload.delete({
          collection: 'backups',
          id: backupId,
        })

        await pub.publish('refresh-channel', JSON.stringify({ refresh: true }))
      }
    } catch (error) {
      let message = error instanceof Error ? error.message : ''
      throw new Error(
        `❌ Backup delete failed for the database ${databaseName}: ${message}`,
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
  console.error(`Job failed with id ${job?.id}: `, err)

  const serverDetails = job?.data?.serverDetails

  if (serverDetails) {
    sendEvent({
      pub,
      message: err.message,
      serverId: serverDetails.id,
    })
  }
})

export const deleteInternalBackupQueue = async (data: QueueArgs) => {
  const id = `delete-internal-backup-${data.backupId}:${new Date().getTime()}`

  return await internalBackupDeleteQueue.add(id, data, {
    ...jobOptions,
    jobId: id,
  })
}
