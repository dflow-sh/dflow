import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import configPromise from '@payload-config'
import { Job } from 'bullmq'
import { NodeSSH, SSHExecCommandResponse } from 'node-ssh'
import { getPayload } from 'payload'

import { getQueue, getWorker } from '@/lib/bullmq'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendActionEvent, sendEvent } from '@/lib/sendEvent'

interface QueueArgs {
  sshDetails: {
    host: string
    port: number
    username: string
    privateKey: string
  }
  pluginDetails: {
    email: string
    autoGenerateSSL: boolean
  }
  serverDetails: {
    id: string
  }
  tenant: {
    slug: string
  }
}

export const addLetsencryptPluginConfigureQueue = async (data: QueueArgs) => {
  const QUEUE_NAME = `server-${data.serverDetails.id}-letsencrypt-configure`

  const letsencryptPluginConfigureQueue = getQueue({
    name: QUEUE_NAME,
    connection: queueConnection,
  })

  const worker = getWorker<QueueArgs>({
    name: QUEUE_NAME,
    processor: async job => {
      const { sshDetails, pluginDetails, serverDetails, tenant } = job.data
      const { email, autoGenerateSSL } = pluginDetails
      let ssh: NodeSSH | null = null
      const payload = await getPayload({ config: configPromise })

      try {
        ssh = await dynamicSSH(sshDetails)

        const letsencryptEmailResponse = await dokku.letsencrypt.addGlobalEmail(
          ssh,
          email,
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

        if (letsencryptEmailResponse.code === 0) {
          sendEvent({
            pub,
            message: `✅ Successfully configured letsencrypt email: ${email}`,
            serverId: serverDetails.id,
          })

          let autoGenerateSSLResponse: SSHExecCommandResponse | null = null

          if (autoGenerateSSL) {
            autoGenerateSSLResponse = await dokku.letsencrypt.cron(ssh, {
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
            })

            if (autoGenerateSSLResponse.code === 0) {
              sendEvent({
                pub,
                message: `✅ Successfully added cron for  SSL certificate auto-generation`,
                serverId: serverDetails.id,
              })
            }
          } else {
            sendEvent({
              pub,
              message: `⏭️ Skipping automatic SSL certificate generation!`,
              serverId: serverDetails.id,
            })
          }

          sendEvent({
            pub,
            message: `Syncing changes...`,
            serverId: serverDetails.id,
          })

          const pluginsResponse = (await dokku.plugin.list(ssh)) ?? []

          const pluginsWithConfig = pluginsResponse.plugins.map(plugin => {
            if (plugin.name === 'letsencrypt') {
              return {
                name: plugin.name,
                status: plugin.status
                  ? ('enabled' as const)
                  : ('disabled' as const),
                version: plugin.version,
                configuration: {
                  email,
                  autoGenerateSSL: autoGenerateSSLResponse?.code === 0,
                },
              }
            }

            return {
              name: plugin.name,
              status: plugin.status
                ? ('enabled' as const)
                : ('disabled' as const),
              version: plugin.version,
            }
          })

          await payload.update({
            collection: 'servers',
            id: serverDetails.id,
            data: {
              plugins: pluginsWithConfig,
            },
          })

          sendActionEvent({
            pub,
            action: 'refresh',
            tenantSlug: tenant.slug,
          })
        }
      } catch (error) {
        let message = error instanceof Error ? error.message : ''
        throw new Error(`❌ failed to configure letsencrypt plugin: ${message}`)
      } finally {
        ssh?.dispose()
      }
    },

    connection: queueConnection,
  })

  worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
    if (job?.data) {
      sendEvent({
        pub,
        message: err.message,
        serverId: job.data.serverDetails.id,
      })
    }
  })

  const id = `letsencrypt-configure-${data.pluginDetails.email}:${new Date().getTime()}`

  return await letsencryptPluginConfigureQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
