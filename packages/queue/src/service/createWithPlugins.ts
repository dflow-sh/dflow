import configPromise from '@payload-config'
import { NodeSSH } from 'node-ssh'
import { getPayload } from 'payload'
import { z } from 'zod'

import { createServiceSchema } from '@dflow/actions/service/validator'
import { pluginList } from '@dflow/components/plugins'
import { getQueue, getWorker } from '@dflow/lib/bullmq'
import { dokku } from '@dflow/lib/dokku'
import { jobOptions, pub, queueConnection } from '@dflow/lib/redis'
import { sendActionEvent, sendEvent } from '@dflow/lib/sendEvent'
import { dynamicSSH, extractSSHDetails } from '@dflow/lib/ssh'
import { generateRandomString } from '@dflow/lib/utils'
import { Server } from '@/payload-types'

export type ServiceCreateData = z.infer<typeof createServiceSchema>

interface QueueArgs {
  name: string
  description?: string
  projectId: string
  type: ServiceCreateData['type']
  databaseType?: ServiceCreateData['databaseType']
  userId: string
  tenantId: string
  tenantSlug: string
  serverDetails: {
    id: string
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

export const addCreateServiceWithPluginsQueue = async (data: QueueArgs) => {
  const QUEUE_NAME = `server-${data.serverDetails.id}-service-creation-with-plugins`

  const createServiceQueue = getQueue({
    name: QUEUE_NAME,
    connection: queueConnection,
  })

  getWorker({
    name: QUEUE_NAME,
    connection: queueConnection,
    processor: async job => {
      const payload = await getPayload({ config: configPromise })
      const {
        name,
        description,
        projectId,
        type,
        databaseType,
        userId,
        tenantId,
        tenantSlug,
      } = job.data

      let ssh: NodeSSH | null = null
      let server: Server | null = null
      const jobId = `service-${name}-${Date.now()}`

      try {
        console.log(`Starting service creation: ${name}`)

        // Get project and server details
        const { server: projectServer, name: projectName } =
          await payload.findByID({
            collection: 'projects',
            id: projectId,
            depth: 2,
          })

        if (!projectServer) {
          throw new Error('No server associated with this project')
        }

        const serverId =
          typeof projectServer === 'object' ? projectServer.id : projectServer

        server = await payload.findByID({
          collection: 'servers',
          id: serverId,
        })

        if (!server) {
          throw new Error(`Server not found: ${serverId}`)
        }

        const sshDetails = extractSSHDetails({ server })
        ssh = await dynamicSSH(sshDetails)

        // Generate service name
        const slicedName = name.slice(0, 10)
        let serviceName = `${projectName}-${slicedName}`

        // Check if service name exists
        const { totalDocs } = await payload.find({
          collection: 'services',
          where: {
            and: [
              { tenant: { equals: tenantId } },
              { name: { equals: serviceName } },
            ],
          },
        })

        if (totalDocs > 0) {
          const uniqueSuffix = generateRandomString({ length: 4 })
          serviceName = `${serviceName}-${uniqueSuffix}`
        }

        // Install required plugins for database type if needed
        if (databaseType) {
          const requiredPlugins = getRequiredPlugins(databaseType)

          if (requiredPlugins.length > 0) {
            sendEvent({
              message: `Checking required plugins for ${databaseType}...`,
              pub,
              serverId: server.id,
              serviceId: jobId,
              channelId: jobId,
            })

            const pluginStatuses = await checkPluginsInstalled(
              ssh,
              requiredPlugins,
            )
            const missingPlugins = requiredPlugins.filter(
              pluginName => !pluginStatuses[pluginName],
            )

            if (missingPlugins.length > 0) {
              sendEvent({
                message: `Installing required plugins: ${missingPlugins.join(', ')}`,
                pub,
                serverId: server.id,
                serviceId: jobId,
                channelId: jobId,
              })

              for (const pluginName of missingPlugins) {
                const pluginData = pluginList.find(
                  plugin => plugin.value === pluginName,
                )

                if (pluginData) {
                  sendEvent({
                    message: `Installing ${pluginName} plugin...`,
                    pub,
                    serverId: server.id,
                    serviceId: jobId,
                    channelId: jobId,
                  })

                  const pluginInstallResponse = await dokku.plugin.install({
                    ssh,
                    pluginUrl: pluginData.githubURL,
                    pluginName: pluginData.value,
                    options: {
                      onStdout: async chunk => {
                        // Add null check inside callback
                        if (!server) return
                        sendEvent({
                          pub,
                          message: chunk.toString(),
                          serverId: server.id,
                          serviceId: jobId,
                          channelId: jobId,
                        })
                      },
                      onStderr: async chunk => {
                        // Add null check inside callback
                        if (!server) return
                        sendEvent({
                          pub,
                          message: chunk.toString(),
                          serverId: server.id,
                          serviceId: jobId,
                          channelId: jobId,
                        })
                      },
                    },
                  })

                  if (pluginInstallResponse.code === 0) {
                    sendEvent({
                      pub,
                      message: `✅ Successfully installed ${pluginName} plugin`,
                      serverId: server.id,
                      serviceId: jobId,
                      channelId: jobId,
                    })
                  } else {
                    throw new Error(`Failed to install ${pluginName} plugin`)
                  }
                }
              }

              // Update server plugins in database
              const updatedPluginsResponse = await dokku.plugin.list(ssh)

              const filteredPlugins = updatedPluginsResponse.plugins.map(
                plugin => {
                  const previousPluginDetails = (server!.plugins ?? []).find(
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
                      typeof previousPluginDetails?.configuration ===
                        'object' &&
                      !Array.isArray(previousPluginDetails?.configuration)
                        ? previousPluginDetails.configuration
                        : {},
                  }
                },
              )

              await payload.update({
                collection: 'servers',
                id: server.id,
                data: { plugins: filteredPlugins },
              })

              sendEvent({
                message: `✅ Updated server plugin database`,
                pub,
                serverId: server.id,
                serviceId: jobId,
                channelId: jobId,
              })
            } else {
              sendEvent({
                message: `✅ All required plugins already installed`,
                pub,
                serverId: server.id,
                serviceId: jobId,
                channelId: jobId,
              })
            }
          }
        }

        let serviceResponse: any = null

        if (type === 'app' || type === 'docker') {
          sendEvent({
            message: `Creating ${type} service: ${serviceName}`,
            pub,
            serverId: server.id,
            serviceId: jobId,
            channelId: jobId,
          })

          // Creating app in dokku
          const appsCreationResponse = await dokku.apps.create(ssh, serviceName)

          if (appsCreationResponse) {
            serviceResponse = await payload.create({
              collection: 'services',
              data: {
                project: projectId,
                name: serviceName,
                description,
                type,
                databaseDetails: {
                  type: databaseType,
                },
                tenant: tenantId,
              },
              user: { id: userId },
            })

            // Apply default resource limits if configured
            if (
              server &&
              typeof server === 'object' &&
              'defaultResourceLimits' in server &&
              server.defaultResourceLimits &&
              (server.defaultResourceLimits.cpu ||
                server.defaultResourceLimits.memory)
            ) {
              const resourceArgs = []
              if (server.defaultResourceLimits.cpu)
                resourceArgs.push(`--cpu ${server.defaultResourceLimits.cpu}`)
              if (server.defaultResourceLimits.memory)
                resourceArgs.push(
                  `--memory ${server.defaultResourceLimits.memory}`,
                )

              try {
                await dokku.resource.limit(ssh, serviceName, resourceArgs)
                sendEvent({
                  message: `✅ Applied default resource limits`,
                  pub,
                  serverId: server.id,
                  serviceId: jobId,
                  channelId: jobId,
                })
              } catch (e) {
                console.error('Failed to apply default resource limits:', e)
                sendEvent({
                  message: `⚠️ Warning: Failed to apply resource limits`,
                  pub,
                  serverId: server.id,
                  serviceId: jobId,
                  channelId: jobId,
                })
              }
            }
          }
        } else if (databaseType) {
          sendEvent({
            message: `Creating ${databaseType} database: ${serviceName}`,
            pub,
            serverId: server.id,
            serviceId: jobId,
            channelId: jobId,
          })

          // Now we can safely call database.list since plugins are installed
          const databaseList = await dokku.database.list(ssh, databaseType)

          if (databaseList.includes(serviceName)) {
            throw new Error('Database name is already taken!')
          }

          serviceResponse = await payload.create({
            collection: 'services',
            data: {
              project: projectId,
              name: serviceName,
              description,
              type,
              databaseDetails: {
                type: databaseType,
              },
              tenant: tenantId,
            },
            user: { id: userId },
          })
        }

        if (serviceResponse?.id) {
          sendEvent({
            message: `✅ Successfully created service: ${serviceName}`,
            pub,
            serverId: server.id,
            serviceId: jobId,
            channelId: jobId,
          })

          return {
            success: true,
            serviceId: serviceResponse.id,
            serviceName,
            redirectUrl: `/${tenantSlug}/dashboard/project/${projectId}/service/${serviceResponse.id}`,
          }
        }

        throw new Error('Failed to create service')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'

        // Use nullish coalescing for safer serverId access
        const serverId = server?.id ?? 'unknown'

        sendEvent({
          message: `❌ ${message}`,
          pub,
          serverId,
          serviceId: jobId,
          channelId: jobId,
        })

        throw new Error(`Failed creating service: ${message}`)
      } finally {
        sendActionEvent({
          pub,
          action: 'refresh',
          tenantSlug: tenantSlug,
        })

        if (ssh) {
          ssh.dispose()
        }
      }
    },
  })

  const id = `create-service-${data.name}:${new Date().getTime()}`
  return await createServiceQueue.add(id, data, { ...jobOptions, jobId: id })
}
