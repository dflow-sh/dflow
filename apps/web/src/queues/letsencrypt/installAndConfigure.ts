import configPromise from '@payload-config'
import { Job } from 'bullmq'
import { NodeSSH, SSHExecCommandResponse } from 'node-ssh'
import { getPayload } from 'payload'

import { pluginList } from '@/components/plugins'
import { getQueue, getWorker } from '@/lib/bullmq'
import { dokku } from '@/lib/dokku'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendActionEvent, sendEvent } from '@/lib/sendEvent'
import { SSHType, dynamicSSH } from '@/lib/ssh'

interface QueueArgs {
  sshDetails: SSHType
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

export const addInstallLetsencryptAndConfigureQueue = async (
  data: QueueArgs,
) => {
  const QUEUE_NAME = `server-${data.serverDetails.id}-install-letsencrypt-and-configure`

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
      const pluginGithubUrl =
        pluginList.find(plugin => plugin.value === 'letsencrypt')?.githubURL ??
        ''

      try {
        ssh = await dynamicSSH(sshDetails)

        const pluginsResponse = (await dokku.plugin.list(ssh)) ?? []

        const isLetsencryptInstalled = pluginsResponse.plugins.some(
          plugin => plugin.name === 'letsencrypt',
        )

        if (!isLetsencryptInstalled) {
          const pluginInstallationResponse = await dokku.plugin.install({
            ssh,
            pluginUrl: pluginGithubUrl,
            pluginName: 'letsencrypt',
            options: {
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
          })

          if (pluginInstallationResponse.code !== 0) {
            throw new Error(pluginInstallationResponse.stderr)
          } else {
            sendEvent({
              pub,
              message: `✅ Successfully installed letsencrypt plugin`,
              serverId: serverDetails.id,
            })
          }
        } else {
          sendEvent({
            pub,
            message: `✅ Letsencrypt plugin is already installed`,
            serverId: serverDetails.id,
          })
        }

        // Adding global email for letsencrypt
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
        throw new Error(
          `❌ Failed to install & configure letsencrypt plugin: ${message}`,
        )
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

  const id = `letsencrypt-and-configure-${data.pluginDetails.email}:${new Date().getTime()}`

  return await letsencryptPluginConfigureQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
