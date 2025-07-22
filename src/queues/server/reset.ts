import { addUninstallRailpackQueue } from '../builder/uninstallRailpack'
import { addUninstallDokkuQueue } from '../dokku/uninstall'
import { addUninstallNetdataQueue } from '../netdata/uninstall'
import { Job } from 'bullmq'
import { NodeSSH } from 'node-ssh'

import { getQueue, getWorker } from '@/lib/bullmq'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendActionEvent, sendEvent } from '@/lib/sendEvent'
import { SSHType, dynamicSSH } from '@/lib/ssh'
import { waitForJobCompletion } from '@/lib/utils/waitForJobCompletion'
import { Server } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

interface QueueArgs {
  sshDetails: SSHType
  tenant: {
    slug: string
  }
  server: ServerType
  serverDetails: {
    id: string
    server: Server['provider']
    kernel: Record<string, string>
    hardware: {
      cpu: { cores: string; frequency: string; model: string }
      memory: { total: string; type: string }
      storage: { total: string }
      virtualization: { type: string; detection_method: string }
    }
    network: {
      hostname: string
      timezone: { name: string; abbreviation: string }
      cloud: { provider: string; instance_type: string; region: string }
    }
  }
}

export const addResetServerQueue = async (data: QueueArgs) => {
  const QUEUE_NAME = `server-${data.serverDetails.id}-reset`

  const resetServerQueue = getQueue({
    name: QUEUE_NAME,
    connection: queueConnection,
  })

  const worker = getWorker<QueueArgs>({
    name: QUEUE_NAME,
    processor: async job => {
      const { sshDetails, serverDetails, tenant, server } = job.data
      let ssh: NodeSSH | null = null

      try {
        ssh = await dynamicSSH(sshDetails)

        // Uninstall dokku
        const uninstallDokkuJob = await addUninstallDokkuQueue({
          sshDetails,
          serverDetails: {
            id: serverDetails.id,
            provider: serverDetails.server,
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
        const isNetdataAvailable =
          server.netdataVersion &&
          serverDetails &&
          serverDetails.hardware &&
          serverDetails.network &&
          serverDetails.kernel

        await waitForJobCompletion(uninstallDokkuJob)

        await waitForJobCompletion(uninstallRailpackJob)

        if (isNetdataAvailable) {
          const uninstallNetdataJob = await addUninstallNetdataQueue({
            serverDetails,
            sshDetails,
            tenant,
          })
          await waitForJobCompletion(uninstallNetdataJob)
        }

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

  return await resetServerQueue.add(id, {
    jobId: id,
    ...jobOptions,
  })
}
