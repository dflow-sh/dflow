import { dokku } from '../../lib/dokku'
import { dynamicSSH } from '../../lib/ssh'
import { Job, Queue, Worker } from 'bullmq'
import { SSHExecCommandResponse } from 'node-ssh'

import { payloadWebhook } from '@/lib/payloadWebhook'
import { jobOptions, pub, queueConnection } from '@/lib/redis'

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
  payloadToken: string | undefined
}

const queueName = 'letsencrypt-configure'

export const letsencryptPluginConfigureQueue = new Queue<QueueArgs>(queueName, {
  connection: queueConnection,
})

const worker = new Worker<QueueArgs>(
  queueName,
  async job => {
    const { sshDetails, pluginDetails, serverDetails, payloadToken } = job.data
    const { email, autoGenerateSSL } = pluginDetails

    try {
      const ssh = await dynamicSSH(sshDetails)

      const letsencryptEmailResponse = await dokku.letsencrypt.email(
        ssh,
        email,
        {
          onStdout: async chunk => {
            await pub.publish('my-channel', chunk.toString())
          },
          onStderr: async chunk => {
            await pub.publish('my-channel', chunk.toString())
          },
        },
      )

      if (letsencryptEmailResponse.code === 0) {
        await pub.publish(
          'my-channel',
          `✅ Successfully configured letsencrypt email: ${email}`,
        )

        let autoGenerateSSLResponse: SSHExecCommandResponse | null = null

        if (autoGenerateSSL) {
          autoGenerateSSLResponse = await dokku.letsencrypt.cron(ssh, {
            onStdout: async chunk => {
              await pub.publish('my-channel', chunk.toString())
            },
            onStderr: async chunk => {
              await pub.publish('my-channel', chunk.toString())
            },
          })

          if (autoGenerateSSLResponse.code === 0) {
            await pub.publish(
              'my-channel',
              `✅ Successfully added cron for  SSL certificate auto-generation`,
            )
          }
        } else {
          await pub.publish(
            'my-channel',
            `⏭️ Skipping automatic SSL certificate generation!`,
          )
        }

        await pub.publish('my-channel', `Syncing changes...`)

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

        console.dir({ pluginsWithConfig }, { depth: Infinity })

        const updatePluginResponse = await payloadWebhook({
          payloadToken: `${payloadToken}`,
          data: {
            type: 'plugin.update',
            data: {
              serverId: serverDetails.id,
              plugins: pluginsWithConfig,
            },
          },
        })

        await pub.publish('refresh-channel', JSON.stringify({ refresh: true }))
      }

      ssh.dispose()
    } catch (error) {
      throw error // Re-throw to trigger the failed event
    }
  },
  {
    connection: queueConnection,
    // Add concurrency limit
    concurrency: 1,
  },
)

worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
  console.log('Failed to configure letsencrypt plugin', err)

  await pub.publish('my-channel', '❌ failed to configure letsencrypt plugin')
})

export const addLetsencryptPluginConfigureQueue = async (data: QueueArgs) => {
  const id = `letsencrypt-configure-${data.pluginDetails.email}:${new Date().getTime()}`

  return await letsencryptPluginConfigureQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
