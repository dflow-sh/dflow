import { env } from 'env'
import { Payload } from 'payload'

import { BeszelClient } from '@/lib/beszel/client/BeszelClient'
import { Collections } from '@/lib/beszel/types'
import { pub } from '@/lib/redis'
import { Template as DFlowTemplateType } from '@/lib/restSDK/types'
import { dFlowRestSdk } from '@/lib/restSDK/utils'
import { sendEvent } from '@/lib/sendEvent'
import { generateRandomString } from '@/lib/utils'
import { ServerType } from '@/payload-types-overrides'

/**
 * Check if all required Beszel environment variables are configured
 */
export function checkBeszelConfig() {
  const required = {
    BESZEL_MONITORING_URL: env.BESZEL_MONITORING_URL,
    BESZEL_SUPERUSER_EMAIL: env.BESZEL_SUPERUSER_EMAIL,
    BESZEL_SUPERUSER_PASSWORD: env.BESZEL_SUPERUSER_PASSWORD,
    BESZEL_HUB_SSH_KEY: env.BESZEL_HUB_SSH_KEY,
  }

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    return { configured: false as const, missing }
  }

  return {
    configured: true as const,
    monitoringUrl: required.BESZEL_MONITORING_URL!,
    superuserEmail: required.BESZEL_SUPERUSER_EMAIL!,
    superuserPassword: required.BESZEL_SUPERUSER_PASSWORD!,
    beszelHubSshKey: required.BESZEL_HUB_SSH_KEY!,
  }
}

/**
 * Find existing monitoring project for a server
 */
export async function findMonitoringProject(
  payload: Payload,
  serverId: string,
  tenantId: string,
) {
  const { docs } = await payload.find({
    collection: 'projects',
    pagination: false,
    depth: 2,
    where: {
      and: [
        { server: { equals: serverId } },
        { tenant: { equals: tenantId } },
        { name: { contains: 'monitoring' } },
        { hidden: { equals: true } },
      ],
    },
  })
  return docs[0] || null
}

/**
 * Create a new monitoring project with unique name
 */
export async function createMonitoringProject(
  payload: Payload,
  serverId: string,
  tenantId: string,
) {
  let name = 'monitoring'

  // Check for name conflicts
  const { docs: existing } = await payload.find({
    collection: 'projects',
    pagination: false,
    where: {
      and: [{ name: { equals: name } }, { tenant: { equals: tenantId } }],
    },
  })

  if (existing.length > 0) {
    name = `monitoring-${generateRandomString({ length: 4 })}`
  }

  return await payload.create({
    collection: 'projects',
    data: {
      name,
      description: 'Server monitoring tools',
      server: serverId,
      tenant: tenantId,
      hidden: true,
    },
    depth: 2,
  })
}

/**
 * Setup Beszel system and fingerprint for monitoring
 */
export async function setupBeszelSystem(
  config: any,
  serverDetails: ServerType,
  host: string,
  userEmails: string[],
) {
  // Create Beszel client
  const client = await BeszelClient.createWithSuperuserAuth(
    config.monitoringUrl,
    config.superuserEmail,
    config.superuserPassword,
  )

  // Get user IDs for access control
  const { items: users } = await client.getList({
    collection: Collections.USERS,
    filter: userEmails.map(email => `email="${email}"`).join(' || '),
    perPage: 10,
    page: 1,
  })
  const userIds = users.map((u: any) => u.id)

  // Get or create system
  const existingSystem = serverDetails.beszel?.systemId
    ? await client.getOne({
        collection: Collections.SYSTEMS,
        id: serverDetails.beszel.systemId,
      })
    : undefined

  let system = existingSystem
  if (system) {
    // Update existing system
    system = await client.update({
      collection: Collections.SYSTEMS,
      id: system.id,
      data: {
        name: serverDetails.name,
        host,
        port: '45876',
        users: userIds,
      },
    })
  } else {
    // Create new system
    system = await client.create({
      collection: Collections.SYSTEMS,
      data: {
        name: serverDetails.name,
        host,
        port: '45876',
        users: userIds,
      },
    })
  }

  // Get or create fingerprint
  const { items: fingerprints } = await client.getList({
    collection: Collections.FINGERPRINTS,
    filter: `system="${system.id}"`,
    perPage: 1,
    page: 1,
  })

  let fingerprint = fingerprints[0]
  if (fingerprint) {
    // Reset existing fingerprint
    fingerprint = await client.update({
      collection: Collections.FINGERPRINTS,
      id: fingerprint.id,
      data: {
        fingerprint: '',
        token: fingerprint.token,
        system: system.id,
      },
    })
  } else {
    // Create new fingerprint
    fingerprint = await client.create({
      collection: Collections.FINGERPRINTS,
      data: {
        system: system.id,
        fingerprint: '',
      },
    })
  }

  return { system, fingerprint }
}

/**
 * Fetch the official Beszel Agent template
 */
export async function fetchBeszelTemplate() {
  const { docs: templates } = await dFlowRestSdk.find({
    collection: 'templates',
    where: {
      and: [
        { name: { equals: 'Beszel Agent' } },
        { type: { equals: 'official' } },
      ],
    },
  })

  return templates[0]
}

/**
 * Configure template services with Beszel environment variables
 */
export function configureTemplateServices(
  services: DFlowTemplateType['services'],
  config: any,
  token?: string,
) {
  return services?.map(service => {
    if (service.name === 'beszel-agent') {
      return {
        ...service,
        variables: service.variables?.map((variable: any) => {
          switch (variable.key) {
            case 'KEY':
              return { ...variable, value: config.beszelHubSshKey }
            case 'HUB_URL':
              return { ...variable, value: config.monitoringUrl }
            case 'TOKEN':
              return { ...variable, value: token || '' }
            default:
              return variable
          }
        }),
      }
    }
    return service
  })
}

/**
 * Generate unique service name by checking existing services
 */
export async function generateUniqueServiceName(
  payload: Payload,
  projectName: string,
  templateServiceName: string,
  tenantId: string,
): Promise<string> {
  let baseName = `${projectName}-${templateServiceName}`

  // Check if base name already exists
  const { docs: existing } = await payload.find({
    collection: 'services',
    pagination: false,
    where: {
      and: [{ name: { equals: baseName } }, { tenant: { equals: tenantId } }],
    },
  })

  // If no conflict, use base name
  if (existing.length === 0) {
    return baseName
  }

  // If conflict exists, add random suffix
  const suffix = generateRandomString({ length: 4 })
  return `${baseName}-${suffix}`
}

/**
 * Process template services - create new ones or update existing ones
 */
export async function processServices(
  payload: Payload,
  project: any,
  templateServices: DFlowTemplateType['services'],
  tenantId: string,
  serverId: string,
) {
  const existingServices = project.services?.docs || []
  const newServices = []
  const updatedServices = []

  for (const templateService of templateServices ?? []) {
    // Check if service already exists
    const existing = existingServices.find((s: any) =>
      s.name?.includes(templateService.name),
    )

    if (existing) {
      // Check if existing service needs updates
      const needsUpdate = templateService.variables?.some(
        (tv: any) =>
          !existing.variables?.find(
            (ev: any) => ev.key === tv.key && ev.value === tv.value,
          ),
      )

      if (needsUpdate) {
        const updated = await payload.update({
          collection: 'services',
          id: existing.id,
          data: { variables: templateService.variables },
          depth: 3,
        })
        updatedServices.push(updated)

        sendEvent({
          pub,
          message: `🔄 Updated service: ${existing.name}`,
          serverId,
        })
      }
    } else {
      // Generate unique service name
      const serviceName = await generateUniqueServiceName(
        payload,
        project.name,
        templateService.name,
        tenantId,
      )

      // Create new service
      const newService = await payload.create({
        collection: 'services',
        data: {
          name: serviceName,
          type: templateService.type,
          dockerDetails: templateService.dockerDetails,
          variables: templateService.variables,
          volumes: templateService.volumes,
          project: project.id,
          tenant: tenantId,
        },
        depth: 3,
      })

      newServices.push(newService)

      sendEvent({
        pub,
        message: `🆕 Created service: ${serviceName}`,
        serverId,
      })
    }
  }

  return { newServices, updatedServices }
}
