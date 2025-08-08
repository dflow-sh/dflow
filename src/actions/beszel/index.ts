'use server'

import { BeszelClient } from '@/lib/beszel/client/BeszelClient'
import { Collections } from '@/lib/beszel/types'
import { pub } from '@/lib/redis'
import { protectedClient, userClient } from '@/lib/safe-action'
import { sendActionEvent, sendEvent } from '@/lib/sendEvent'
import { ServerType } from '@/payload-types-overrides'
import { addTemplateDeployQueue } from '@/queues/template/deploy'

import {
  checkBeszelConfig,
  configureTemplateServices,
  createMonitoringProject,
  fetchBeszelTemplate,
  findMonitoringProject,
  processServices,
  setupBeszelSystem,
} from './utils'
import { getSystemStatsSchema, installMonitoringToolsSchema } from './validator'

export const installMonitoringToolsAction = protectedClient
  .metadata({ actionName: 'installMonitoringToolsAction' })
  .schema(installMonitoringToolsSchema)
  .action(async ({ clientInput, ctx }) => {
    const { serverId } = clientInput
    const { payload, userTenant, user } = ctx

    const serverDetails = (await payload.findByID({
      collection: 'servers',
      id: serverId,
      depth: 1,
      context: { populateServerDetails: true },
    })) as ServerType

    try {
      // Check environment configuration
      const config = checkBeszelConfig()
      if (!config.configured) {
        return {
          success: false,
          error: `Missing Beszel config: ${config.missing?.join(', ')}`,
        }
      }

      // Check if monitoring is already installed and running
      const existingProject = await findMonitoringProject(
        payload,
        serverId,
        userTenant.tenant.id,
      )

      sendEvent({
        pub,
        message: '🔧 Starting monitoring installation...',
        serverId: serverDetails.id,
      })

      // Get or create monitoring project
      let project = existingProject
      if (!project) {
        project = await createMonitoringProject(
          payload,
          serverId,
          userTenant.tenant.id,
        )
      }

      const host =
        serverDetails.preferConnectionType === 'ssh'
          ? serverDetails.ip
          : serverDetails.hostname

      // Setup Beszel system
      const { system, fingerprint } = await setupBeszelSystem(
        config,
        serverDetails,
        host as string,
        [user.email, config.superuserEmail],
      )

      // Get template and configure services
      const template = await fetchBeszelTemplate()
      const configuredServices = configureTemplateServices(
        template.services,
        config,
        fingerprint.token,
      )

      // Process services and deploy
      const { newServices, updatedServices } = await processServices(
        payload,
        project,
        configuredServices,
        userTenant.tenant.id,
        serverId,
      )

      if (newServices.length > 0 || updatedServices.length > 0) {
        sendEvent({
          pub,
          message: '🚀 Starting monitoring deployment...',
          serverId: serverDetails.id,
        })

        // Deploy new services via template
        if (newServices.length > 0) {
          await addTemplateDeployQueue({
            services: newServices,
            serverDetails,
            project,
            tenantDetails: { slug: userTenant.tenant.slug },
          })
        }

        // Deploy updated services in parallel
        if (updatedServices.length > 0) {
          const deployPromises = updatedServices.map(service =>
            addTemplateDeployQueue({
              services: [service],
              serverDetails,
              project,
              tenantDetails: { slug: userTenant.tenant.slug },
            }),
          )

          await Promise.all(deployPromises)
        }

        sendEvent({
          pub,
          message: '✅ Monitoring deployment queued successfully',
          serverId: serverDetails.id,
        })
      } else {
        // If no services to deploy, monitoring is already fully installed
        sendEvent({
          pub,
          message: '✅ Monitoring tools are already installed and running',
          serverId: serverDetails.id,
        })

        return {
          success: true,
          alreadyInstalled: true,
          message: 'Monitoring tools are already installed and running',
          projectId: project.id,
          servicesCreated: 0,
          servicesUpdated: 0,
        }
      }

      sendActionEvent({
        pub,
        action: 'refresh',
        tenantSlug: userTenant.tenant.slug,
      })

      return {
        success: true,
        projectId: project.id,
        servicesCreated: newServices.length,
        servicesUpdated: updatedServices.length,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'

      sendEvent({
        pub,
        message: `❌ Installation failed: ${message}`,
        serverId: serverDetails.id,
      })

      return { success: false, error: `Installation failed: ${message}` }
    }
  })

export const getSystemStatsAction = userClient
  .metadata({
    actionName: 'getSystemStats',
  })
  .schema(getSystemStatsSchema)
  .action(async ({ clientInput, ctx }) => {
    const { serverName, host, type, from } = clientInput

    try {
      // Step 1: Check Beszel configuration
      const beszelConfig = checkBeszelConfig()

      if (!beszelConfig.configured) {
        return {
          success: false,
          error: `Beszel monitoring environment is not properly configured. Missing: ${beszelConfig.missing?.join(', ')}`,
        }
      }

      const { monitoringUrl, superuserEmail, superuserPassword } = beszelConfig

      // Step 2: Authenticate with Beszel
      const client = await BeszelClient.createWithSuperuserAuth(
        monitoringUrl,
        superuserEmail,
        superuserPassword,
      )

      // Step 3: Fetch server details
      const { items: existingSystems } = await client.getList({
        collection: Collections.SYSTEMS,
        filter: `name="${serverName}" || host="${host}"`,
        perPage: 10,
        page: 1,
      })

      console.log(existingSystems)

      const system = existingSystems.find(
        (s: any) => s.name === serverName || s.host === host,
      )

      // Step 4: Fetch system stats
      const normalizedFrom = new Date(from)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ')

      const stats = await client.getList({
        collection: Collections.SYSTEM_STATS,
        page: 1,
        perPage: 500,
        filter: `system='${system?.id}' && created>'${normalizedFrom}' && type='${type}'`,
        sort: 'created',
        skipTotal: true,
      })

      console.log(stats)

      return {
        success: true,
        data: { system, stats },
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'

      return {
        success: false,
        error: `Failed to fetch system stats: ${message}`,
      }
    }
  })
