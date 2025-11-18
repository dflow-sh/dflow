import configPromise from '@payload-config'
import { Job } from 'bullmq'
import { NodeSSH } from 'node-ssh'
import { getPayload } from 'payload'
import { z } from 'zod'

import { createServiceSchema } from '@dflow/actions/service/validator'
import { pluginList } from '@dflow/components/plugins'
import { getQueue, getWorker } from '@dflow/lib/bullmq'
import { dokku } from '@dflow/lib/dokku'
import { jobOptions, pub, queueConnection } from '@dflow/lib/redis'
import { sendActionEvent, sendEvent } from '@dflow/lib/sendEvent'
import { SSHType, dynamicSSH } from '@dflow/lib/ssh'
import { parseDatabaseInfo } from '@dflow/lib/utils'

export type DatabaseType = Exclude<
  z.infer<typeof createServiceSchema>['databaseType'],
  undefined
>

interface QueueArgs {
  databaseName: string
  databaseType: DatabaseType
  sshDetails: SSHType
  serviceDetails: {
    id: string
    deploymentId: string
    serverId: string
  }
  tenant: {
    slug: string
  }
}

const getRequiredPlugins = (databaseType: string): string[] => {
  const databasePlugins = pluginList.filter(
    plugin => plugin.category === 'database' && plugin.value === databaseType,
  )
  return databasePlugins.map(plugin => plugin.value)
}

const checkPluginsInstalled = async (
  ssh: NodeSSH,
  pluginNames: string[],
): Promise<Record<string, boolean>> => {
  const pluginsResponse = await dokku.plugin.list(ssh)
  const installedStatus: Record<string, boolean> = {}

  for (const pluginName of pluginNames) {
    installedStatus[pluginName] = pluginsResponse.plugins.some(
      plugin => plugin.name === pluginName && plugin.status,
    )
  }

  return installedStatus
}

export const addCreateDatabaseWithPluginsQueue = async (data: QueueArgs) => {
  const QUEUE_NAME = `server-${data?.serviceDetails?.serverId}-create-database-with-plugins`

  const createDatabaseQueue = getQueue({
    name: QUEUE_NAME,
    connection: queueConnection,
  })

  const worker = getWorker({
    name: QUEUE_NAME,
    connection: queueConnection,
    processor: async job => {
      const payload = await getPayload({ config: configPromise })
      const { databaseName, databaseType, sshDetails, serviceDetails, tenant } =
        job.data
      const { id: serviceId, serverId, deploymentId } = serviceDetails

      let ssh: NodeSSH | null = null

      try {
        console.log(
          `Starting database creation with plugin check for ${databaseType} database: ${databaseName}`,
        )

        // Update deployment status
        await payload.update({
          collection: 'deployments',
          id: serviceDetails.deploymentId,
          data: { status: 'building' },
        })

        sendActionEvent({
          pub,
          action: 'refresh',
          tenantSlug: tenant.slug,
        })

        ssh = await dynamicSSH(sshDetails)

        // Check required plugins
        const requiredPlugins = getRequiredPlugins(databaseType)

        if (requiredPlugins.length > 0) {
          sendEvent({
            message: `Checking required plugins for ${databaseType}...`,
            pub,
            serverId,
            serviceId,
            channelId: deploymentId,
          })

          const pluginStatuses = await checkPluginsInstalled(
            ssh,
            requiredPlugins,
          )
          const missingPlugins = requiredPlugins.filter(
            pluginName => !pluginStatuses[pluginName],
          )

          // Install missing plugins
          if (missingPlugins.length > 0) {
            sendEvent({
              message: `Installing required plugins: ${missingPlugins.join(', ')}`,
              pub,
              serverId,
              serviceId,
              channelId: deploymentId,
            })

            for (const pluginName of missingPlugins) {
              const pluginData = pluginList.find(
                plugin => plugin.value === pluginName,
              )

              if (pluginData) {
                sendEvent({
                  message: `Installing ${pluginName} plugin...`,
                  pub,
                  serverId,
                  serviceId,
                  channelId: deploymentId,
                })

                const pluginInstallResponse = await dokku.plugin.install({
                  ssh,
                  pluginUrl: pluginData.githubURL,
                  pluginName: pluginData.value,
                  options: {
                    onStdout: async chunk => {
                      sendEvent({
                        pub,
                        message: chunk.toString(),
                        serverId,
                        serviceId,
                        channelId: deploymentId,
                      })
                    },
                    onStderr: async chunk => {
                      sendEvent({
                        pub,
                        message: chunk.toString(),
                        serverId,
                        serviceId,
                        channelId: deploymentId,
                      })
                    },
                  },
                })

                if (pluginInstallResponse.code === 0) {
                  sendEvent({
                    pub,
                    message: `✅ Successfully installed ${pluginName} plugin`,
                    serverId,
                    serviceId,
                    channelId: deploymentId,
                  })
                } else {
                  throw new Error(`Failed to install ${pluginName} plugin`)
                }
              }
            }

            // Update server plugins in database
            sendEvent({
              message: `Syncing plugin changes...`,
              pub,
              serverId,
              serviceId,
              channelId: deploymentId,
            })

            const server = await payload.findByID({
              collection: 'servers',
              id: serverId,
            })

            const updatedPluginsResponse = await dokku.plugin.list(ssh)
            const filteredPlugins = updatedPluginsResponse.plugins.map(
              plugin => {
                const previousPluginDetails = (server.plugins ?? []).find(
                  previousPlugin => previousPlugin?.name === plugin?.name,
                )

                return {
                  name: plugin.name,
                  status: plugin.status
                    ? ('enabled' as const)
                    : ('disabled' as const),
                  version: plugin.version,
                  configuration:
                    previousPluginDetails?.configuration &&
                    typeof previousPluginDetails?.configuration === 'object' &&
                    !Array.isArray(previousPluginDetails?.configuration)
                      ? previousPluginDetails.configuration
                      : {},
                }
              },
            )

            await payload.update({
              collection: 'servers',
              id: serverId,
              data: { plugins: filteredPlugins },
            })
          } else {
            sendEvent({
              message: `✅ All required plugins already installed`,
              pub,
              serverId,
              serviceId,
              channelId: deploymentId,
            })
          }
        }

        // Now create the database
        sendEvent({
          message: `Creating ${databaseType} database: ${databaseName}`,
          pub,
          serverId,
          serviceId,
          channelId: deploymentId,
        })

        const res = await dokku.database.create(
          ssh,
          databaseName,
          databaseType,
          {
            onStdout: async chunk => {
              sendEvent({
                message: chunk.toString(),
                pub,
                serverId,
                serviceId,
                channelId: deploymentId,
              })
            },
            onStderr: async chunk => {
              sendEvent({
                message: chunk.toString(),
                pub,
                serverId,
                serviceId,
                channelId: deploymentId,
              })
            },
          },
        )

        sendEvent({
          message: `✅ Successfully created ${databaseName} database`,
          pub,
          serverId,
          serviceId,
          channelId: deploymentId,
        })

        const formattedData = parseDatabaseInfo({
          stdout: res.stdout,
          dbType: databaseType,
        })

        await payload.update({
          collection: 'services',
          id: serviceId,
          data: {
            databaseDetails: { ...formattedData },
          },
        })

        const logs = await pub.lrange(deploymentId, 0, -1)
        await payload.update({
          collection: 'deployments',
          id: deploymentId,
          data: {
            status: 'success',
            logs,
          },
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'

        sendEvent({
          message: `❌ ${message}`,
          pub,
          serverId,
          serviceId,
          channelId: deploymentId,
        })

        const logs = await pub.lrange(deploymentId, 0, -1)
        await payload.update({
          collection: 'deployments',
          id: deploymentId,
          data: {
            status: 'failed',
            logs,
          },
        })

        throw new Error(
          `❌ Failed creating ${databaseName} database: ${message}`,
        )
      } finally {
        sendActionEvent({
          pub,
          action: 'refresh',
          tenantSlug: tenant.slug,
        })

        if (ssh) {
          ssh.dispose()
        }
      }
    },
  })

  worker.on('failed', async (job: Job | undefined, err) => {
    if (job?.data) {
      sendEvent({
        pub,
        message: err.message,
        serverId: job.data.serviceDetails.serverId,
        serviceId: job.data.serviceDetails.id,
        channelId: job.data.serviceDetails.deploymentId,
      })
    }
  })

  const id = `create-database-with-plugins-${data.databaseName}-${data.databaseType}:${new Date().getTime()}`
  return await createDatabaseQueue.add(id, data, { ...jobOptions, jobId: id })
}
