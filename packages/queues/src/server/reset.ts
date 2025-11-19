import { addUninstallRailpackQueue } from '../builder/uninstallRailpack'
import { addUninstallDokkuQueue } from '../dokku/uninstall'
import { addUninstallNetdataQueue } from '../netdata/uninstall'
import configPromise from '@payload-config'
import { Job } from 'bullmq'
import { NodeSSH } from 'node-ssh'
import { getPayload } from 'payload'

import { getQueue, getWorker } from '@/lib/bullmq'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendActionEvent, sendEvent } from '@/lib/sendEvent'
import { SSHType, dynamicSSH } from '@/lib/ssh'
import { waitForJobCompletion } from '@/lib/utils/waitForJobCompletion'
import { ServerType } from '@/payload-types-overrides'

interface QueueArgs {
  sshDetails: SSHType
  tenant: {
    slug: string
    id: string
  }
  serverDetails: ServerType
}

export const addResetServerQueue = async (data: QueueArgs) => {
  const payload = await getPayload({ config: configPromise })

  const QUEUE_NAME = `server-${data.serverDetails.id}-reset`

  const resetServerQueue = getQueue({
    name: QUEUE_NAME,
    connection: queueConnection,
  })

  const worker = getWorker<QueueArgs>({
    name: QUEUE_NAME,
    processor: async job => {
      const { sshDetails, serverDetails, tenant } = job.data
      let ssh: NodeSSH | null = null

      try {
        ssh = await dynamicSSH(sshDetails)

        // Uninstall dokku
        const uninstallDokkuJob = await addUninstallDokkuQueue({
          sshDetails,
          serverDetails: {
            id: serverDetails.id,
            provider: serverDetails.provider,
          },
          tenant,
        })

        // Uninstall railpack
        const uninstallRailpackJob = await addUninstallRailpackQueue({
          sshDetails,
          serverDetails: {
            id: serverDetails.id,
          },
          tenant,
        })

        // Uninstall netdata
        // todo: Do we need to check the commented lines?
        const isNetdataAvailable = serverDetails.netdataVersion
        // serverDetails.hardware &&
        // serverDetails.network &&
        // serverDetails.kernel

        const uninstallDokkuResult =
          await waitForJobCompletion(uninstallDokkuJob)

        const uninstallRailpackResult =
          await waitForJobCompletion(uninstallRailpackJob)

        let uninstallNetdataResult: { success: boolean } = { success: true }

        if (isNetdataAvailable) {
          const uninstallNetdataJob = await addUninstallNetdataQueue({
            serverDetails,
            sshDetails,
            tenant,
          })
          uninstallNetdataResult =
            await waitForJobCompletion(uninstallNetdataJob)
        }

        await payload.update({
          id: serverDetails.id,
          data: { onboarded: false, domains: [], plugins: [] },
          collection: 'servers',
        })

        const projectResponse = await payload.update({
          collection: 'projects',
          where: {
            and: [
              {
                server: {
                  equals: serverDetails.id,
                },
              },
              {
                tenant: {
                  equals: tenant.id,
                },
              },
            ],
          },
          data: {
            deletedAt: new Date().toISOString(),
          },
        })

        const projectId = projectResponse.docs?.[0]?.id

        await payload.update({
          collection: 'services',
          where: {
            and: [
              {
                project: {
                  equals: projectId,
                },
              },
              {
                tenant: {
                  equals: tenant.id,
                },
              },
            ],
          },
          data: {
            deletedAt: new Date().toISOString(),
          },
        })

        // Log success message
        sendEvent({
          pub,
          message: `Server reset successfully for ${tenant.slug}`,
          serverId: serverDetails.id,
        })

        sendActionEvent({
          pub,
          action: 'refresh',
          tenantSlug: tenant.slug,
        })

        if (
          uninstallDokkuResult.success &&
          uninstallRailpackResult.success &&
          (isNetdataAvailable ? uninstallNetdataResult.success : true)
        ) {
          return { success: true }
        }

        return { success: false }
      } catch (error) {
        // Handle errors and log them
        const err = error as Error
        sendEvent({
          pub,
          message: `Error resetting server: ${err.message}`,
          serverId: serverDetails.id,
        })
      } finally {
        if (ssh) {
          ssh.dispose()
        }
      }
    },
    connection: queueConnection,
  })

  worker.on('failed', async (job: Job | undefined, err) => {
    if (job?.data) {
      sendEvent({
        pub,
        message: `Job failed: ${err.message}`,
        serverId: job.data.serverDetails.id,
      })
    }
  })

  const id = `reset-server:${new Date().getTime()}`

  return await resetServerQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
