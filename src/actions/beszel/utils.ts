import { env } from 'env'
import { Payload } from 'payload'

import { BeszelClient } from '@/lib/beszel/client/BeszelClient'
import { Collections, CreateSystemData } from '@/lib/beszel/types'
import { pub } from '@/lib/redis'
import { sendEvent } from '@/lib/sendEvent'
import { generateRandomString } from '@/lib/utils'
import { Project, Server, Service } from '@/payload-types'

/**
 * Check if monitoring tools are already installed on a server
 * @param payload - Payload instance
 * @param serverId - Server ID to check
 * @param tenantId - Tenant ID for scoping
 * @returns Promise<boolean> - True if monitoring is already installed
 */
export const isMonitoringInstalled = async (
  payload: Payload,
  serverId: string,
  tenantId: string,
): Promise<boolean> => {
  const { docs: existingMonitoringProjects } = await payload.find({
    collection: 'projects',
    pagination: false,
    where: {
      and: [
        {
          server: {
            equals: serverId,
          },
        },
        {
          tenant: {
            equals: tenantId,
          },
        },
        {
          name: {
            contains: 'monitoring',
          },
        },
        {
          hidden: {
            equals: true,
          },
        },
      ],
    },
  })

  return existingMonitoringProjects.length > 0
}

/**
 * Check if Beszel environment variables are properly configured
 * @returns Promise<{configured: boolean, missing?: string[]}> - Configuration status
 */
export const checkBeszelConfiguration = async (): Promise<
  | {
      configured: true
      monitoringUrl: string
      superuserEmail: string
      superuserPassword: string
      beszelHubSshKey: string
    }
  | {
      configured: false
      missing: string[]
    }
> => {
  const requiredEnvVars = {
    BESZEL_MONITORING_URL: env.BESZEL_MONITORING_URL,
    BESZEL_SUPERUSER_EMAIL: env.BESZEL_SUPERUSER_EMAIL,
    BESZEL_SUPERUSER_PASSWORD: env.BESZEL_SUPERUSER_PASSWORD,
    BESZEL_HUB_SSH_KEY: env.BESZEL_HUB_SSH_KEY,
  }

  const missing = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    return {
      configured: false,
      missing,
    }
  }

  return {
    configured: true,
    monitoringUrl: env.BESZEL_MONITORING_URL!,
    superuserEmail: env.BESZEL_SUPERUSER_EMAIL!,
    superuserPassword: env.BESZEL_SUPERUSER_PASSWORD!,
    beszelHubSshKey: env.BESZEL_HUB_SSH_KEY!,
  }
}

/**
 * Get monitoring project for a server if it exists
 * @param payload - Payload instance
 * @param serverId - Server ID
 * @param tenantId - Tenant ID
 * @returns Promise<Project | null> - Monitoring project or null if not found
 */
export const getMonitoringProject = async (
  payload: Payload,
  serverId: string,
  tenantId: string,
) => {
  const { docs: monitoringProjects } = await payload.find({
    collection: 'projects',
    pagination: false,
    depth: 2,
    where: {
      and: [
        {
          server: {
            equals: serverId,
          },
        },
        {
          tenant: {
            equals: tenantId,
          },
        },
        {
          name: {
            contains: 'monitoring',
          },
        },
        {
          hidden: {
            equals: true,
          },
        },
      ],
    },
  })

  return monitoringProjects[0] || null
}

/**
 * Get or create Beszel system
 * @param client - Beszel client instance
 * @param serverDetails - Server details
 * @param host - System host
 * @param userIds - User IDs for access control
 * @returns Promise<BeszelSystem> - System object
 */
export const getOrCreateBeszelSystem = async (
  client: BeszelClient,
  serverDetails: Server,
  host: string,
  userIds: string[],
): Promise<any> => {
  // Check if system already exists in Beszel
  const { items: existingSystems } = await client.getList({
    collection: Collections.SYSTEMS,
    filter: `name="${serverDetails.name}" || host="${host}"`,
    perPage: 10,
    page: 1,
  })

  let beszelSystem = existingSystems.find(
    (s: any) => s.name === serverDetails.name || s.host === host,
  )

  if (beszelSystem) {
    // Check if system needs updating
    const needsUpdate =
      beszelSystem.name !== serverDetails.name ||
      beszelSystem.host !== host ||
      beszelSystem.port !== '45876' ||
      !userIds.every((id: string) => beszelSystem?.users.includes(id))

    if (needsUpdate) {
      sendEvent({
        pub,
        message: `🔄 Updating existing monitoring system configuration...`,
        serverId: serverDetails.id,
      })

      // Update existing system with current details
      beszelSystem = await client.update({
        collection: Collections.SYSTEMS,
        id: beszelSystem.id,
        data: {
          name: serverDetails.name,
          status: 'up',
          host: host,
          port: '45876',
          info: '',
          users: userIds,
        },
      })
    } else {
      sendEvent({
        pub,
        message: `✅ Found existing monitoring system with correct configuration`,
        serverId: serverDetails.id,
      })
    }
  } else {
    // Create new system
    sendEvent({
      pub,
      message: `🖥️ Creating new monitoring system for ${serverDetails.name}...`,
      serverId: serverDetails.id,
    })

    const systemData = {
      name: serverDetails.name,
      status: 'up',
      host: host,
      port: '45876', // Default Beszel agent port
      info: '',
      users: userIds, // Grant access to specified users
    } as CreateSystemData

    // Register this server as a system in Beszel
    beszelSystem = await client.create({
      collection: Collections.SYSTEMS,
      data: systemData,
    })
  }

  return beszelSystem
}

/**
 * Get or create Beszel fingerprint
 * @param client - Beszel client instance
 * @param systemId - System ID
 * @returns Promise<BeszelFingerprint> - Fingerprint object
 */
export const getOrCreateBeszelFingerprint = async (
  client: any,
  systemId: string,
): Promise<any> => {
  // Check if fingerprint already exists for this system
  const { items: existingFingerprints } = await client.getList({
    collection: Collections.FINGERPRINTS,
    filter: `system="${systemId}"`,
    perPage: 1,
    page: 1,
  })

  let beszelFingerprint = existingFingerprints[0]

  if (beszelFingerprint) {
    sendEvent({
      pub,
      message: `✅ Using existing monitoring fingerprint`,
      serverId: systemId,
    })
  } else {
    sendEvent({
      pub,
      message: `🔑 Generating new monitoring fingerprint...`,
      serverId: systemId,
    })

    // Create fingerprint for secure agent-hub communication
    beszelFingerprint = await client.create({
      collection: Collections.FINGERPRINTS,
      data: {
        system: systemId,
        fingerprint: '', // Will be populated by Beszel
      },
    })
  }

  return beszelFingerprint
}

/**
 * Process monitoring services - check, create, or update as needed
 * @param payload - Payload instance
 * @param projectDetails - Project details
 * @param templateServices - Template services configuration
 * @param tenantId - Tenant ID
 * @param currentToken - Current Beszel token
 * @param serverId - Server ID for logging
 * @returns Promise<{servicesToDeploy: string[], createdServices: Service[]}> - Processing results
 */
export const processMonitoringServices = async (
  payload: Payload,
  projectDetails: Project,
  templateServices: any[],
  tenantId: string,
  currentToken?: string | null,
  serverId?: string,
): Promise<{
  servicesToDeploy: string[]
  createdServices: Service[]
}> => {
  // Generate unique service names
  const serviceNames = {} as Record<string, string>
  const projectServices = projectDetails?.services?.docs ?? []

  templateServices.forEach(service => {
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
        typeof serviceDetails === 'object' && serviceDetails?.name === baseName,
    )

    // Add suffix if name collision detected
    const finalName = nameExists ? `${baseName}-${uniqueSuffix}` : baseName
    serviceNames[service.name] = finalName
  })

  // Prepare services with unique names and variables
  const updatedServices = templateServices.map(service => {
    const serviceName = serviceNames[`${service?.name}`]

    // Prepare service variables array
    let variables = [] as Array<{
      key: string
      value: string
      id?: string | null
    }>

    service?.variables?.forEach((variable: any) => {
      variables?.push(variable)
    })

    return { ...service, name: serviceName, variables }
  })

  let createdServices: Service[] = []
  const existingServices = projectDetails?.services?.docs ?? []
  const servicesToDeploy: string[] = []

  // Process each service
  for await (const service of updatedServices) {
    const { type, name } = service

    // Check if service already exists
    const existingService = existingServices.find(
      s => typeof s === 'object' && s?.name === name,
    ) as Service | undefined

    if (existingService) {
      sendEvent({
        pub,
        message: `🔄 Checking configuration for existing service: ${name}`,
        serverId: serverId || '',
      })

      // Check if environment variables are correctly configured
      const needsUpdate = await checkServiceConfiguration(
        existingService,
        service,
        currentToken,
      )

      if (needsUpdate) {
        sendEvent({
          pub,
          message: `⚙️ Updating configuration for service: ${name}`,
          serverId: serverId || '',
        })

        // Update service with new configuration
        const updatedService = await updateServiceConfiguration(
          payload,
          existingService,
          service,
          currentToken,
        )
        createdServices.push(updatedService)
        servicesToDeploy.push(updatedService.id)
      } else {
        sendEvent({
          pub,
          message: `✅ Service ${name} already correctly configured`,
          serverId: serverId || '',
        })
        createdServices.push(existingService)
      }
    } else {
      // Create new service
      sendEvent({
        pub,
        message: `🆕 Creating new service: ${name}`,
        serverId: serverId || '',
      })

      let newService: Service

      // Handle database services
      if (type === 'database' && service?.databaseDetails) {
        newService = await payload.create({
          collection: 'services',
          data: {
            name: `${name}`,
            type,
            databaseDetails: {
              type: service.databaseDetails?.type,
              exposedPorts: service.databaseDetails?.exposedPorts ?? [],
            },
            project: projectDetails?.id,
            tenant: tenantId,
          },
          depth: 3,
        })
      }
      // Handle Docker container services
      else if (type === 'docker' && service?.dockerDetails) {
        newService = await payload.create({
          collection: 'services',
          data: {
            name: `${name}`,
            type,
            dockerDetails: service?.dockerDetails,
            project: projectDetails?.id,
            variables: service?.variables,
            volumes: service?.volumes,
            tenant: tenantId,
          },
          depth: 3,
        })
      }
      // Handle application services (Git-based deployments)
      else if (type === 'app') {
        // Currently supports GitHub provider
        if (service?.providerType === 'github' && service?.githubSettings) {
          newService = await payload.create({
            collection: 'services',
            data: {
              name: `${name}`,
              type,
              project: projectDetails?.id,
              variables: service?.variables,
              githubSettings: service?.githubSettings,
              providerType: service?.providerType,
              provider: service?.provider,
              builder: service?.builder,
              volumes: service?.volumes,
              tenant: tenantId,
            },
            depth: 3,
          })
        } else {
          throw new Error(`Unsupported app service configuration for ${name}`)
        }
      } else {
        throw new Error(`Unsupported service type: ${type} for service ${name}`)
      }

      createdServices.push(newService!)
      servicesToDeploy.push(newService!.id)
    }
  }

  return {
    servicesToDeploy,
    createdServices,
  }
}

/**
 * Check if a service's configuration needs updating
 * @param existingService - Current service from database
 * @param templateService - Template service configuration
 * @param currentToken - Current Beszel token
 * @returns Promise<boolean> - True if service needs updating
 */
export const checkServiceConfiguration = async (
  existingService: Service,
  templateService: any,
  currentToken?: string | null,
): Promise<boolean> => {
  if (!existingService.variables || !templateService.variables) {
    return false
  }

  const existingVars = existingService.variables || []
  const templateVars = templateService.variables || []

  // Check if critical environment variables are correct
  for (const templateVar of templateVars) {
    const existingVar = existingVars.find(v => v.key === templateVar.key)

    if (!existingVar) {
      return true // Missing variable, needs update
    }

    // Check specific critical variables
    if (templateVar.key === 'TOKEN' && existingVar.value !== currentToken) {
      return true // Token mismatch, needs update
    }

    if (
      templateVar.key === 'HUB_URL' &&
      existingVar.value !== env.BESZEL_MONITORING_URL
    ) {
      return true // Hub URL mismatch, needs update
    }

    if (
      templateVar.key === 'KEY' &&
      existingVar.value !== env.BESZEL_HUB_SSH_KEY
    ) {
      return true // SSH key mismatch, needs update
    }
  }

  return false
}

/**
 * Update service configuration with new environment variables
 * @param payload - Payload instance
 * @param existingService - Current service to update
 * @param templateService - Template service with new configuration
 * @param currentToken - Current Beszel token
 * @returns Promise<Service> - Updated service
 */
export const updateServiceConfiguration = async (
  payload: Payload,
  existingService: Service,
  templateService: any,
  currentToken?: string | null,
): Promise<Service> => {
  // Update variables with new values
  const updatedVariables =
    templateService.variables?.map((templateVar: any) => {
      if (templateVar.key === 'TOKEN') {
        return { ...templateVar, value: currentToken ?? '' }
      }
      if (templateVar.key === 'HUB_URL') {
        return { ...templateVar, value: env.BESZEL_MONITORING_URL ?? '' }
      }
      if (templateVar.key === 'KEY') {
        return { ...templateVar, value: env.BESZEL_HUB_SSH_KEY ?? '' }
      }
      return templateVar
    }) || []

  // Update the service in database
  const updatedService = await payload.update({
    collection: 'services',
    id: existingService.id,
    data: {
      variables: updatedVariables,
    },
    depth: 3,
  })

  return updatedService
}
