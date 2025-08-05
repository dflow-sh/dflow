'use server'

import { triggerDeployment } from '../deployment/deploy'

import { BeszelClient } from '@/lib/beszel/client/BeszelClient'
import { Collections } from '@/lib/beszel/types'
import { pub } from '@/lib/redis'
import { protectedClient } from '@/lib/safe-action'
import { sendActionEvent, sendEvent } from '@/lib/sendEvent'
import { generateRandomString } from '@/lib/utils'
import { Template } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

import {
  checkBeszelConfiguration,
  getMonitoringProject,
  getOrCreateBeszelFingerprint,
  getOrCreateBeszelSystem,
  isMonitoringInstalled,
  processMonitoringServices,
} from './utils'
import { installMonitoringToolsSchema } from './validator'

export const installMonitoringToolsAction = protectedClient
  .metadata({
    actionName: 'installMonitoringToolsAction',
  })
  .schema(installMonitoringToolsSchema)
  .action(async ({ clientInput, ctx }) => {
    const { serverId } = clientInput
    const { payload, userTenant, user } = ctx

    const serverDetails = (await payload.findByID({
      collection: 'servers',
      id: serverId,
      depth: 1,
      context: {
        populateServerDetails: true,
      },
    })) as ServerType

    try {
      // Check if monitoring tools are already installed on this server
      const alreadyInstalled = await isMonitoringInstalled(
        payload,
        serverId,
        userTenant.tenant.id,
      )

      if (alreadyInstalled) {
        return {
          success: false,
          error: 'Monitoring tools are already installed on this server',
        }
      }

      // Check if Beszel environment is configured
      const beszelConfig = await checkBeszelConfiguration()

      if (!beszelConfig.configured) {
        return {
          success: false,
          error: `Beszel monitoring environment is not properly configured. Missing: ${beszelConfig.missing?.join(', ')}`,
        }
      }

      const {
        monitoringUrl,
        superuserEmail,
        superuserPassword,
        beszelHubSshKey,
      } = beszelConfig

      // Send initial notification
      sendEvent({
        pub,
        message: `🔧 Starting monitoring tools installation...`,
        serverId: serverDetails.id,
      })

      // STEP 1: Check or create monitoring project
      sendEvent({
        pub,
        message: `📁 Checking for existing monitoring project...`,
        serverId: serverDetails.id,
      })

      let projectDetails = await getMonitoringProject(
        payload,
        serverId,
        userTenant.tenant.id,
      )

      if (!projectDetails) {
        let uniqueName = 'monitoring'

        // Check for existing monitoring projects in this tenant
        const { docs: duplicateProjects } = await payload.find({
          collection: 'projects',
          pagination: false,
          where: {
            and: [
              {
                name: {
                  equals: uniqueName,
                },
              },
              {
                tenant: {
                  equals: userTenant.tenant.id,
                },
              },
            ],
          },
        })

        // If duplicates exist, append random suffix to ensure uniqueness
        if (duplicateProjects.length > 0) {
          const uniqueSuffix = generateRandomString({ length: 4 })
          uniqueName = `${uniqueName}-${uniqueSuffix}`
        }

        sendEvent({
          pub,
          message: `📁 Creating monitoring project: ${uniqueName}`,
          serverId: serverDetails.id,
        })

        // Create the monitoring project in database
        projectDetails = await payload.create({
          collection: 'projects',
          data: {
            name: uniqueName,
            description: 'Monitoring tools for server observability',
            server: serverDetails.id,
            tenant: userTenant.tenant.id,
            hidden: true, // Hide from main project list
          },
          depth: 2,
        })
      }

      // STEP 2: Set up Beszel monitoring system
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

      // STEP 3: Check or create Beszel system
      const existingSystemHost = (
        serverDetails.preferConnectionType === 'ssh'
          ? serverDetails.ip
          : serverDetails.hostname
      ) as string

      sendEvent({
        pub,
        message: `🖥️ Checking for existing Beszel system...`,
        serverId: serverDetails.id,
      })

      let beszelSystem = await getOrCreateBeszelSystem(
        client,
        serverDetails,
        existingSystemHost,
        userIds,
      )

      // STEP 4: Check or create Beszel fingerprint
      sendEvent({
        pub,
        message: `🔑 Checking monitoring fingerprint...`,
        serverId: serverDetails.id,
      })

      let beszelFingerprint = await getOrCreateBeszelFingerprint(
        client,
        beszelSystem.id,
      )

      // STEP 5: Fetch and configure Beszel Agent template
      sendEvent({
        pub,
        message: `📋 Fetching Beszel Agent template...`,
        serverId: serverDetails.id,
      })

      // Fetch the official Beszel Agent template from the API
      const res = await fetch(
        'https://dflow.sh/api/templates?where[and][0][name][equals]=Beszel%20Agent&where[and][1][type][equals]=official',
      )

      if (!res.ok) {
        throw new Error('Failed to fetch official templates')
      }

      const templateData = await res.json()
      const template = (templateData.docs.at(0) ?? []) as Template

      sendEvent({
        pub,
        message: `⚙️ Configuring monitoring agent services...`,
        serverId: serverDetails.id,
      })

      // Configure Beszel agent service with required environment variables
      const services = (template.services || []).map(service => {
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

      // STEP 6: Check or create/update services
      sendEvent({
        pub,
        message: `🏗️ Processing monitoring services...`,
        serverId: serverDetails.id,
      })

      const { servicesToDeploy, createdServices } =
        await processMonitoringServices(
          payload,
          projectDetails,
          services,
          userTenant.tenant.id,
          beszelFingerprint.token,
          serverDetails.id,
        )

      sendEvent({
        pub,
        message: `✅ Monitoring tools setup completed successfully`,
        serverId: serverDetails.id,
      })

      // STEP 7: Deploy services that need deployment
      if (servicesToDeploy.length > 0) {
        sendEvent({
          pub,
          message: `🚀 Deploying ${servicesToDeploy.length} monitoring services...`,
          serverId: serverDetails.id,
        })

        const deploymentPromises = servicesToDeploy.map(async serviceId => {
          try {
            const deploymentQueueId = await triggerDeployment({
              serviceId,
              tenantSlug: userTenant.tenant.slug,
              cache: 'no-cache',
            })

            sendEvent({
              pub,
              message: `🚀 Deployment queued for service: ${serviceId}`,
              serverId: serverDetails.id,
            })

            return { serviceId, deploymentQueueId, success: true }
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : 'Unknown deployment error'

            sendEvent({
              pub,
              message: `❌ Failed to deploy service ${serviceId}: ${message}`,
              serverId: serverDetails.id,
            })

            return { serviceId, error: message, success: false }
          }
        })

        const deploymentResults = await Promise.allSettled(deploymentPromises)
        const successfulDeployments = deploymentResults
          .filter(
            (
              result,
            ): result is PromiseFulfilledResult<{
              serviceId: string
              deploymentQueueId: string
              success: true
            }> => result.status === 'fulfilled' && result.value.success,
          )
          .map(result => result.value)

        sendEvent({
          pub,
          message: `📊 Deployment summary: ${successfulDeployments.length}/${servicesToDeploy.length} services queued successfully`,
          serverId: serverDetails.id,
        })
      } else {
        sendEvent({
          pub,
          message: `✅ All monitoring services are already up to date`,
          serverId: serverDetails.id,
        })
      }

      // Trigger UI refresh to show monitoring project
      sendActionEvent({
        pub,
        action: 'refresh',
        tenantSlug: userTenant.tenant.slug,
      })

      return {
        success: true,
        projectId: projectDetails.id,
        servicesProcessed: createdServices.length,
        servicesDeployed: servicesToDeploy.length,
      }
    } catch (error) {
      // Handle and report any errors during the installation process
      const message = error instanceof Error ? error.message : 'Unknown error'

      sendEvent({
        pub,
        message: `❌ Failed to install monitoring tools: ${message}`,
        serverId: serverDetails.id,
      })

      return {
        success: false,
        error: `Failed to install monitoring tools: ${message}`,
      }
    }
  })
