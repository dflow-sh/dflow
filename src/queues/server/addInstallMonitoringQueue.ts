import { addTemplateDeployQueue } from '../template/deploy'
import configPromise from '@payload-config'
import { Job } from 'bullmq'
import { env } from 'env'
import { getPayload } from 'payload'

import { BeszelClient } from '@/lib/beszel/client/BeszelClient'
import { Collections, CreateSystemData } from '@/lib/beszel/types'
import { getQueue, getWorker } from '@/lib/bullmq'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { dFlowRestSdk } from '@/lib/restSDK/utils'
import { sendActionEvent, sendEvent } from '@/lib/sendEvent'
import { generateRandomString } from '@/lib/utils'
import { Project, Server, Service, User } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

interface QueueArgs {
  serverDetails: ServerType
  user: User
  tenant: {
    slug: string
    id: string
  }
}

/**
 * Adds a monitoring installation job to the queue for a specific server
 *
 * This function creates a queue worker that will:
 * 1. Create a monitoring project in the database
 * 2. Set up Beszel monitoring system integration
 * 3. Deploy monitoring services (Beszel agent)
 * 4. Configure user access and permissions
 *
 * @param data - Queue arguments containing server details, user, and tenant info
 * @returns Promise resolving to the queued job
 */
export const addInstallMonitoringQueue = async (data: QueueArgs) => {
  // Create a unique queue name for this server's monitoring installation
  const QUEUE_NAME = `server-${data.serverDetails.id}-install-monitoring`

  // Initialize the monitoring installation queue
  const installMonitoringQueue = getQueue({
    name: QUEUE_NAME,
    connection: queueConnection,
  })

  // Create worker to process monitoring installation jobs
  const worker = getWorker<QueueArgs>({
    name: QUEUE_NAME,
    processor: async job => {
      const { serverDetails, tenant, user } = job.data
      const payload = await getPayload({ config: configPromise })

      try {
        // Notify user that installation has started
        sendEvent({
          pub,
          message: `🔧 Starting monitoring tools installation...`,
          serverId: serverDetails.id,
        })

        let projectDetails: Project

        // STEP 1: Create monitoring project
        // Generate unique project name to avoid conflicts
        const slicedName = 'monitoring'
        let uniqueName = slicedName

        // Check for existing monitoring projects in this tenant
        const { docs: duplicateProjects } = await payload.find({
          collection: 'projects',
          pagination: false,
          where: {
            and: [
              {
                name: {
                  equals: slicedName,
                },
              },
              {
                tenant: {
                  equals: tenant.id,
                },
              },
            ],
          },
        })

        // If duplicates exist, append random suffix to ensure uniqueness
        if (duplicateProjects.length > 0) {
          const uniqueSuffix = generateRandomString({ length: 4 })
          uniqueName = `${slicedName}-${uniqueSuffix}`
        }

        sendEvent({
          pub,
          message: `📁 Creating monitoring project: ${uniqueName}`,
          serverId: serverDetails.id,
        })

        // Create the monitoring project in database
        const response = await payload.create({
          collection: 'projects',
          data: {
            name: uniqueName,
            description: 'Monitoring tools for server observability',
            server: serverDetails.id,
            tenant: tenant.id,
            hidden: true, // Hide from main project list
          },
        })

        projectDetails = response

        // STEP 2: Set up Beszel monitoring system
        // Validate required environment variables for Beszel integration
        const monitoringUrl = env.BESZEL_MONITORING_URL
        const superuserEmail = env.BESZEL_SUPERUSER_EMAIL
        const superuserPassword = env.BESZEL_SUPERUSER_PASSWORD
        const beszelHubSshKey = env.BESZEL_HUB_SSH_KEY

        if (
          !monitoringUrl ||
          !superuserEmail ||
          !superuserPassword ||
          !beszelHubSshKey
        ) {
          throw new Error(
            'Beszel credentials not configured, skipping beszel user creation',
          )
        }

        sendEvent({
          pub,
          message: `🔐 Authenticating with Beszel monitoring system...`,
          serverId: serverDetails.id,
        })

        // Authenticate with Beszel using superuser credentials
        const client = await BeszelClient.createWithSuperuserAuth(
          monitoringUrl,
          superuserEmail,
          superuserPassword,
        )

        sendEvent({
          pub,
          message: `👤 Setting up monitoring user access...`,
          serverId: serverDetails.id,
        })

        // Get user IDs for access control (current user + superuser)
        const { items: users } = await client.getList({
          collection: Collections.USERS,
          filter: `email="${user.email}" || email="${superuserEmail}"`,
          perPage: 2,
          page: 1,
        })

        const userIds = users.map(u => u.id)

        // Prepare system data for Beszel registration
        const systemData = {
          name: serverDetails.name,
          status: 'up',
          host: (serverDetails.preferConnectionType === 'ssh'
            ? serverDetails.ip
            : serverDetails.hostname) as string,
          port: '45876', // Default Beszel agent port
          info: '',
          users: userIds, // Grant access to specified users
        } as CreateSystemData

        sendEvent({
          pub,
          message: `🖥️ Creating monitoring system for ${serverDetails.name}...`,
          serverId: serverDetails.id,
        })

        // Register this server as a system in Beszel
        const beszelSystem = await client.create({
          collection: Collections.SYSTEMS,
          data: systemData,
        })

        sendEvent({
          pub,
          message: `🔑 Generating monitoring fingerprint...`,
          serverId: serverDetails.id,
        })

        // Create fingerprint for secure agent-hub communication
        const beszelFingerprint = await client.create({
          collection: Collections.FINGERPRINTS,
          data: {
            system: beszelSystem.id,
            fingerprint: '', // Will be populated by Beszel
          },
        })

        // STEP 3: Fetch and configure Beszel Agent template
        sendEvent({
          pub,
          message: `📋 Fetching Beszel Agent template...`,
          serverId: serverDetails.id,
        })

        // Fetch the official Beszel Agent template from the API
        const { docs: templates } = await dFlowRestSdk.find({
          collection: 'templates',
          where: {
            and: [
              { name: { equals: 'Beszel Agent' } },
              { type: { equals: 'official' } },
            ],
          },
        })
        const template = templates.at(0)

        sendEvent({
          pub,
          message: `⚙️ Configuring monitoring agent services...`,
          serverId: serverDetails.id,
        })

        // Configure Beszel agent service with required environment variables
        const services = (template?.services || []).map(service => {
          if (service.name === 'beszel-agent') {
            return {
              ...service,
              variables: service.variables?.map(variable => {
                // Set SSH key for secure communication
                if (variable.key === 'KEY') {
                  return {
                    ...variable,
                    value: beszelHubSshKey,
                  }
                }

                // Set hub URL for agent to connect to
                if (variable.key === 'HUB_URL') {
                  return {
                    ...variable,
                    value: monitoringUrl,
                  }
                }

                // Set authentication token from fingerprint
                if (variable.key === 'TOKEN') {
                  return {
                    ...variable,
                    value: beszelFingerprint.token ?? '',
                  }
                }

                return variable
              }),
            }
          }

          return service
        })

        if (!services.length) {
          throw new Error('Please attach services to deploy the template')
        }

        // STEP 4: Generate unique service names
        // Create mapping of original service names to unique names
        const serviceNames = {} as Record<string, string>
        const projectServices = projectDetails?.services?.docs ?? []

        services.forEach(service => {
          const uniqueSuffix = generateRandomString({ length: 4 })
          let baseServiceName = service.name

          // Special handling for database services (limit name length)
          if (service?.type === 'database') {
            baseServiceName = service.name.slice(0, 10)
          }

          const baseName = `${projectDetails.name}-${baseServiceName}`

          // Check if service name already exists in this project
          const nameExists = projectServices?.some(
            serviceDetails =>
              typeof serviceDetails === 'object' &&
              serviceDetails?.name === baseName,
          )

          // Add suffix if name collision detected
          const finalName = nameExists
            ? `${baseName}-${uniqueSuffix}`
            : baseName
          serviceNames[service.name] = finalName
        })

        // STEP 5: Prepare services with unique names and variables
        const updatedServices = services.map(service => {
          const serviceName = serviceNames[`${service?.name}`]

          // Prepare service variables array
          let variables = [] as Array<{
            key: string
            value: string
            id?: string | null
          }>

          service?.variables?.forEach(variable => {
            variables?.push({
              ...variable,
              value: variable.value ?? '',
            })
          })

          return { ...service, name: serviceName, variables }
        })

        let createdServices: Service[] = []

        sendEvent({
          pub,
          message: `🏗️ Creating monitoring services in database...`,
          serverId: serverDetails.id,
        })

        // STEP 6: Create services in database based on service type
        for await (const service of updatedServices) {
          const { type, name } = service

          // Handle database services
          if (type === 'database' && service?.databaseDetails) {
            const serviceResponse = await payload.create({
              collection: 'services',
              data: {
                name: `${name}`,
                type,
                databaseDetails: {
                  type: service.databaseDetails?.type,
                  exposedPorts: service.databaseDetails?.exposedPorts ?? [],
                },
                project: projectDetails?.id,
                tenant: tenant.id,
              },
              depth: 3,
            })

            createdServices.push(serviceResponse)
          }
          // Handle Docker container services
          else if (type === 'docker' && service?.dockerDetails) {
            const serviceResponse = await payload.create({
              collection: 'services',
              data: {
                name: `${name}`,
                type,
                dockerDetails: service?.dockerDetails,
                project: projectDetails?.id,
                variables: service?.variables,
                volumes: service?.volumes,
                tenant: tenant.id,
              },
              depth: 3,
            })

            createdServices.push(serviceResponse)
          }
          // Handle application services (Git-based deployments)
          else if (type === 'app') {
            // Currently supports GitHub provider
            if (service?.providerType === 'github' && service?.githubSettings) {
              const serviceResponse = await payload.create({
                collection: 'services',
                data: {
                  name: `${name}`,
                  type,
                  project: projectDetails?.id,
                  variables: service?.variables,
                  githubSettings: service?.githubSettings,
                  providerType: service?.providerType,
                  builder: service?.builder,
                  volumes: service?.volumes,
                  tenant: tenant.id,
                },
                depth: 3,
              })

              createdServices.push(serviceResponse)
            }
          }
        }

        // Remove project reference to avoid circular dependencies in deployment
        const lightweightServices = createdServices.map(
          ({ project, ...rest }) => rest,
        )

        sendEvent({
          pub,
          message: `🚀 Initiating monitoring services deployment...`,
          serverId: serverDetails.id,
        })

        // STEP 7: Trigger deployment of monitoring services
        const deployResponse = await addTemplateDeployQueue({
          services: lightweightServices,
          serverDetails: {
            id: (projectDetails.server as Server).id,
          },
          project: projectDetails,
          tenantDetails: {
            slug: tenant.slug,
          },
        })

        // Verify deployment was successfully queued
        if (deployResponse.id) {
          sendEvent({
            pub,
            message: `✅ Monitoring tools installation initiated successfully`,
            serverId: serverDetails.id,
          })

          // Trigger UI refresh to show new monitoring project
          sendActionEvent({
            pub,
            action: 'refresh',
            tenantSlug: tenant.slug,
          })
        } else {
          throw new Error('Failed to trigger template deployment')
        }
      } catch (error) {
        // Handle and report any errors during the installation process
        const message = error instanceof Error ? error.message : 'Unknown error'

        sendEvent({
          pub,
          message: `❌ Failed to install monitoring tools: ${message}`,
          serverId: serverDetails.id,
        })

        throw new Error(`❌ Failed to install monitoring tools: ${message}`, {
          cause: error,
        })
      }
    },

    connection: queueConnection,
  })

  // Handle job failures and notify users
  worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
    if (job?.data) {
      sendEvent({
        pub,
        message: `❌ Monitoring installation failed: ${err.message}`,
        serverId: job.data.serverDetails.id,
      })
    }
  })

  // Create unique job ID and add to queue
  const id = `install-monitoring:${new Date().getTime()}`

  return await installMonitoringQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
