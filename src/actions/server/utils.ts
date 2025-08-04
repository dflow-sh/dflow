import { env } from 'env'
import { Payload } from 'payload'

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
export const checkBeszelConfiguration = async (): Promise<{
  configured: boolean
  missing?: string[]
}> => {
  const requiredEnvVars = {
    BESZEL_MONITORING_URL: env.BESZEL_MONITORING_URL,
    BESZEL_SUPERUSER_EMAIL: env.BESZEL_SUPERUSER_EMAIL,
    BESZEL_SUPERUSER_PASSWORD: env.BESZEL_SUPERUSER_PASSWORD,
    BESZEL_HUB_SSH_KEY: env.BESZEL_HUB_SSH_KEY,
  }

  const missing = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key, _]) => key)

  return {
    configured: missing.length === 0,
    missing: missing.length > 0 ? missing : undefined,
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
