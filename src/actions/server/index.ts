'use server'

import dns from 'dns/promises'
import { env } from 'env'
import isPortReachable from 'is-port-reachable'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import updateRailpack from '@/lib/axios/updateRailpack'
import { BeszelClient } from '@/lib/beszel/client/BeszelClient'
import { Collections, CreateSystemData } from '@/lib/beszel/types'
import { dokku } from '@/lib/dokku'
import { pub } from '@/lib/redis'
import { protectedClient, userClient } from '@/lib/safe-action'
import { sendActionEvent, sendEvent } from '@/lib/sendEvent'
import { server } from '@/lib/server'
import { dynamicSSH, extractSSHDetails } from '@/lib/ssh'
import { generateRandomString } from '@/lib/utils'
import { Server, Service, Template } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'
import { addInstallRailpackQueue } from '@/queues/builder/installRailpack'
import { addInstallDokkuQueue } from '@/queues/dokku/install'
import { addManageServerDomainQueue } from '@/queues/domain/manageGlobal'
import { addDeleteProjectsQueue } from '@/queues/project/deleteProjects'
import { addMonitoringDeploymentQueue } from '@/queues/server/addMonitoringDeploymentQueue'
import { addResetServerQueue } from '@/queues/server/reset'

import { checkBeszelConfiguration, isMonitoringInstalled } from './utils'
import {
  checkDNSConfigSchema,
  checkServerConnectionSchema,
  completeServerOnboardingSchema,
  configureGlobalBuildDirSchema,
  createServerSchema,
  createTailscaleServerSchema,
  deleteServerSchema,
  installDokkuSchema,
  installMonitoringToolsSchema,
  uninstallDokkuSchema,
  updateRailpackSchema,
  updateServerDomainSchema,
  updateServerSchema,
  updateTailscaleServerSchema,
} from './validator'

type DeploymentService = Omit<Service, 'project'>

// No need to handle try/catch that abstraction is taken care by next-safe-actions
export const createServerAction = protectedClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'createServerAction',
  })
  .schema(createServerSchema)
  .action(async ({ clientInput, ctx }) => {
    const { name, description, ip, port, username, sshKey } = clientInput
    const {
      userTenant: { tenant },
      payload,
      user,
    } = ctx

    const response = await payload.create({
      collection: 'servers',
      data: {
        preferConnectionType: 'ssh',
        name,
        description,
        ip,
        port,
        username,
        sshKey,
        provider: 'other',
        tenant,
      },
      user,
    })

    if (response) {
      revalidatePath(`/${tenant.slug}/servers`)
    }

    return { success: true, server: response }
  })

export const createTailscaleServerAction = protectedClient
  .metadata({
    actionName: 'createTailscaleServerAction',
  })
  .schema(createTailscaleServerSchema)
  .action(async ({ clientInput, ctx }) => {
    const { name, description, hostname, username } = clientInput

    const {
      userTenant: { tenant },
      payload,
      user,
    } = ctx

    const response = await payload.create({
      collection: 'servers',
      data: {
        preferConnectionType: 'tailscale',
        name,
        description,
        hostname,
        username,
        provider: 'other',
        tenant,
      },
      user,
    })

    if (response) {
      redirect(`/${tenant.slug}/servers`)
    }
    return { success: true, server: response }
  })

export const updateTailscaleServerAction = protectedClient
  .metadata({
    actionName: 'updateTailscaleServerAction',
  })
  .schema(updateTailscaleServerSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id, ...data } = clientInput
    const { payload, user } = ctx

    const response = await payload.update({
      id,
      data,
      collection: 'servers',
      user,
    })

    if (response) {
      revalidatePath(`/servers/${id}`)
      revalidatePath(`/onboarding/add-server`)
    }

    return { success: true, server: response }
  })

export const updateServerAction = protectedClient
  .metadata({
    actionName: 'updateServerAction',
  })
  .schema(updateServerSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id, ...data } = clientInput
    const { payload, user } = ctx

    const response = await payload.update({
      id,
      data,
      collection: 'servers',
      user,
    })

    if (response) {
      revalidatePath(`/servers/${id}`)
      revalidatePath(`/onboarding/add-server`)
    }

    return { success: true, server: response }
  })

export const deleteServerAction = protectedClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'deleteServerAction',
  })
  .schema(deleteServerSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id, deleteProjects, deleteBackups } = clientInput
    const { payload, userTenant } = ctx

    const response = await payload.update({
      collection: 'servers',
      id,
      data: {
        deletedAt: new Date().toISOString(),
      },
    })

    const installationResponse = await addDeleteProjectsQueue({
      serverDetails: {
        id,
      },
      deleteProjectsFromServer: deleteProjects,
      deleteBackups,
      tenant: {
        slug: userTenant.tenant.slug,
      },
    })

    if (response && installationResponse.id) {
      revalidatePath(`${userTenant.tenant}/dashboard`)
      revalidatePath(`${userTenant.tenant}/servers`)
      revalidatePath(`${userTenant.tenant}/servers/${id}`)
      return { deleted: true }
    }
  })

export const installDokkuAction = protectedClient
  .metadata({
    actionName: 'installDokkuAction',
  })
  .schema(installDokkuSchema)
  .action(async ({ clientInput, ctx }) => {
    const { serverId } = clientInput
    const { payload, userTenant } = ctx

    const serverDetails = await payload.findByID({
      collection: 'servers',
      id: serverId,
      depth: 10,
    })

    const sshDetails = extractSSHDetails({ server: serverDetails })

    const installationResponse = await addInstallDokkuQueue({
      serverDetails: {
        id: serverId,
        provider: serverDetails.provider,
      },
      sshDetails,
      tenant: {
        slug: userTenant.tenant.slug,
      },
    })

    if (installationResponse.id) {
      return { success: true }
    }
  })

export const updateServerDomainAction = protectedClient
  .metadata({
    actionName: 'updateServerDomainAction',
  })
  .schema(updateServerDomainSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id, domains, operation } = clientInput
    const { payload, userTenant } = ctx

    // Fetching server-details for showing previous details
    const { domains: serverPreviousDomains } = await payload.findByID({
      id,
      collection: 'servers',
    })

    const previousDomains = serverPreviousDomains ?? []

    // for add operation check for duplicate domain check
    if (operation === 'add') {
      const addedDomain = domains?.[0]

      const domainExists = previousDomains.find(
        ({ domain }) => addedDomain === domain,
      )

      if (domainExists) {
        throw new Error(`${addedDomain} already exists!`)
      }
    }

    const filteredDomains =
      operation !== 'remove'
        ? [
            ...previousDomains,
            ...domains.map(domain => ({
              domain,
              default: operation === 'set',
            })),
          ]
        : previousDomains.filter(
            prevDomain => !domains.includes(prevDomain.domain),
          )

    const server = await payload.update({
      id,
      data: {
        domains: filteredDomains,
      },
      collection: 'servers',
      depth: 10,
    })

    // for delete action remove domain from dokku
    if (operation === 'remove') {
      const sshDetails = extractSSHDetails({ server })

      await addManageServerDomainQueue({
        serverDetails: {
          global: {
            domains,
            action: operation,
          },
          id,
        },
        sshDetails,
        tenant: {
          slug: userTenant.tenant.slug,
        },
      })
    }

    revalidatePath(`/servers/${id}`)
    return { success: true }
  })

export const installRailpackAction = protectedClient
  .metadata({
    actionName: 'installRailpackAction',
  })
  .schema(installDokkuSchema)
  .action(async ({ clientInput, ctx }) => {
    const { serverId } = clientInput
    const { payload, userTenant } = ctx

    const serverDetails = await payload.findByID({
      collection: 'servers',
      id: serverId,
      depth: 10,
    })

    const sshDetails = extractSSHDetails({ server: serverDetails })

    const installationResponse = await addInstallRailpackQueue({
      serverDetails: {
        id: serverId,
      },
      sshDetails,
      tenant: {
        slug: userTenant.tenant.slug,
      },
    })

    if (installationResponse.id) {
      return { success: true }
    }
  })

export const updateRailpackAction = protectedClient
  .metadata({
    actionName: 'updateRailpackAction',
  })
  .schema(updateRailpackSchema)
  .action(async ({ ctx, clientInput }) => {
    const { serverId, railpackVersion } = clientInput
    const { payload, userTenant } = ctx

    const latestRelease = await updateRailpack()

    if (+latestRelease > +railpackVersion) {
      const serverDetails = await payload.findByID({
        collection: 'servers',
        id: serverId,
        depth: 1,
      })

      const sshDetails = extractSSHDetails({ server: serverDetails })

      await addInstallRailpackQueue({
        serverDetails: {
          id: serverId,
        },
        sshDetails,
        tenant: {
          slug: userTenant.tenant.slug,
        },
      })

      return { success: true, message: 'Railpack updated' }
    }

    return { success: false, message: 'Railpack is already up to date' }
  })

export const completeServerOnboardingAction = protectedClient
  .metadata({
    actionName: 'completeServerOnboardingAction',
  })
  .schema(completeServerOnboardingSchema)
  .action(async ({ clientInput, ctx }) => {
    const { serverId } = clientInput
    const { payload, userTenant } = ctx

    const response = await payload.update({
      id: serverId,
      data: {
        onboarded: true,
      },
      collection: 'servers',
    })

    if (response) {
      revalidatePath(`${userTenant.tenant}/servers/${serverId}`)
      return { success: true, server: response }
    }

    return { success: false }
  })

export const getServersAction = protectedClient
  .metadata({
    actionName: 'getServersAction',
  })
  .action(async ({ ctx }) => {
    const { payload } = ctx

    const { docs } = await payload.find({
      collection: 'servers',
      select: {
        name: true,
      },
      pagination: false,
    })

    return docs
  })

export const checkDNSConfigAction = protectedClient
  .metadata({
    actionName: 'checkDNSConfigAction',
  })
  .schema(checkDNSConfigSchema)
  .action(async ({ clientInput }) => {
    const { domain, ip, proxyDomain } = clientInput

    try {
      // Try to resolve CNAME first if proxyDomain is provided
      if (proxyDomain) {
        const cnames = await dns.resolveCname(domain).catch(() => [])
        if (cnames.length > 0) {
          // Compare the CNAME target to the expected proxy domain (strict match)
          return cnames.some(cname => cname === proxyDomain)
        }
      }

      // Fallback: check A record
      const addresses = await dns.resolve4(domain)

      return addresses.includes(ip)
    } catch (e) {
      return false
    }
  })

export const syncServerDomainAction = protectedClient
  .metadata({
    actionName: 'syncServerDomainAction',
  })
  .schema(updateServerDomainSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id, domains, operation } = clientInput
    const { payload, userTenant } = ctx

    const server = await payload.findByID({
      id,
      collection: 'servers',
      depth: 10,
    })

    const sshDetails = extractSSHDetails({ server })

    const queueResponse = await addManageServerDomainQueue({
      serverDetails: {
        global: {
          domains,
          action: operation,
        },
        id,
      },
      sshDetails,
      tenant: {
        slug: userTenant.tenant.slug,
      },
    })

    if (queueResponse.id) {
      return { success: true }
    }
  })

export const checkServerConnection = protectedClient
  .metadata({
    actionName: 'checkServerConnection',
  })
  .schema(checkServerConnectionSchema)
  .action(async ({ clientInput }) => {
    const { connectionType } = clientInput

    console.log('triggered')

    if (connectionType === 'tailscale') {
      const { hostname, username } = clientInput

      try {
        // Validate input parameters
        if (!hostname || !username) {
          return {
            isConnected: false,
            portIsOpen: false,
            sshConnected: false,
            serverInfo: null,
            error:
              'Missing required connection parameters (hostname or username)',
          }
        }

        let sshConnected = false
        let serverInfo = null
        let ssh

        try {
          // Attempt Tailscale SSH connection
          console.log('tailscale ssh attempt')
          ssh = await dynamicSSH({
            type: 'tailscale',
            hostname,
            username,
          })

          if (ssh.isConnected()) {
            console.log('connected to tailscale ssh')
            sshConnected = true

            // Get server information
            const {
              dokkuVersion,
              linuxDistributionType,
              linuxDistributionVersion,
              netdataVersion,
              railpackVersion,
            } = await server.info({ ssh })

            serverInfo = {
              dokku: dokkuVersion,
              netdata: netdataVersion,
              os: {
                type: linuxDistributionType,
                version: linuxDistributionVersion,
              },
              railpack: railpackVersion,
            }
          }
        } catch (sshError) {
          console.error('Tailscale SSH connection failed:', sshError)

          // Handle specific SSH errors
          if (sshError instanceof Error) {
            const errorMessage = sshError.message.toLowerCase()

            if (errorMessage.includes('authentication')) {
              return {
                isConnected: false,
                portIsOpen: false,
                sshConnected: false,
                serverInfo: null,
                error:
                  'Tailscale SSH authentication failed. Please check if the device is authorized.',
              }
            } else if (errorMessage.includes('timeout')) {
              return {
                isConnected: false,
                portIsOpen: false,
                sshConnected: false,
                serverInfo: null,
                error:
                  'Tailscale SSH connection timeout. The device may be offline or unreachable.',
              }
            } else if (errorMessage.includes('refused')) {
              return {
                isConnected: false,
                portIsOpen: false,
                sshConnected: false,
                serverInfo: null,
                error:
                  'Tailscale SSH connection refused. Please check if SSH is enabled on the device.',
              }
            } else if (
              errorMessage.includes('not found') ||
              errorMessage.includes('unknown host')
            ) {
              return {
                isConnected: false,
                portIsOpen: false,
                sshConnected: false,
                serverInfo: null,
                error:
                  'Device not found in Tailscale network. Please ensure the device is connected to your tailnet.',
              }
            }
          }

          return {
            isConnected: false,
            portIsOpen: false,
            sshConnected: false,
            serverInfo: null,
            error:
              'Tailscale SSH connection failed. Please check your Tailscale configuration.',
          }
        } finally {
          // Clean up SSH connection
          if (ssh) {
            try {
              console.log('ssh connected successfully, and closing')
              ssh.dispose()
            } catch (disposeError) {
              console.error('Error disposing SSH connection:', disposeError)
            }
          }
        }

        // For Tailscale, we don't check port reachability separately since it uses Tailscale's mesh network
        // If SSH is connected, we consider the connection successful
        return {
          isConnected: sshConnected,
          portIsOpen: sshConnected, // Set to same as sshConnected for Tailscale
          sshConnected,
          serverInfo,
          error: null,
        }
      } catch (error) {
        console.error('Tailscale server connection check failed:', error)

        // Handle different types of errors
        if (error instanceof Error) {
          const errorMessage = error.message.toLowerCase()

          if (
            errorMessage.includes('tailscale') ||
            errorMessage.includes('not logged in')
          ) {
            return {
              isConnected: false,
              portIsOpen: false,
              sshConnected: false,
              serverInfo: null,
              error:
                'Tailscale not configured or not logged in. Please ensure Tailscale is installed and you are logged in.',
            }
          } else if (errorMessage.includes('timeout')) {
            return {
              isConnected: false,
              portIsOpen: false,
              sshConnected: false,
              serverInfo: null,
              error:
                'Connection timeout. The device may be offline or unreachable via Tailscale.',
            }
          }
        }

        // Generic error fallback
        return {
          isConnected: false,
          portIsOpen: false,
          sshConnected: false,
          serverInfo: null,
          error:
            'Failed to connect to device via Tailscale. Please check your Tailscale configuration and try again.',
        }
      }
    } else {
      const { ip, port, username, privateKey } = clientInput

      try {
        // Validate input parameters
        if (!ip || !port || !username || !privateKey) {
          return {
            isConnected: false,
            portIsOpen: false,
            sshConnected: false,
            serverInfo: null,
            error: 'Missing required connection parameters',
          }
        }

        // Check if port is reachable
        const portIsOpen = await isPortReachable(port, {
          host: ip,
          timeout: 5000, // 5 second timeout for port check
        })

        if (!portIsOpen) {
          return {
            isConnected: false,
            portIsOpen: false,
            sshConnected: false,
            serverInfo: null,
            error: `Port ${port} is not reachable on ${ip}. Please check if the server is running and the port is open.`,
          }
        }

        let sshConnected = false
        let serverInfo = null
        let ssh

        try {
          // Attempt SSH connection
          ssh = await dynamicSSH({
            type: 'ssh',
            ip,
            port,
            privateKey,
            username,
          })

          if (ssh.isConnected()) {
            sshConnected = true

            // Get server information
            const {
              dokkuVersion,
              linuxDistributionType,
              linuxDistributionVersion,
              netdataVersion,
              railpackVersion,
            } = await server.info({ ssh })

            serverInfo = {
              dokku: dokkuVersion,
              netdata: netdataVersion,
              os: {
                type: linuxDistributionType,
                version: linuxDistributionVersion,
              },
              railpack: railpackVersion,
            }
          }
        } catch (sshError) {
          console.error('SSH connection failed:', sshError)

          // Handle specific SSH errors
          if (sshError instanceof Error) {
            const errorMessage = sshError.message.toLowerCase()

            if (errorMessage.includes('authentication')) {
              return {
                isConnected: false,
                portIsOpen,
                sshConnected: false,
                serverInfo: null,
                error:
                  'SSH authentication failed. Please check your username and private key.',
              }
            } else if (errorMessage.includes('timeout')) {
              return {
                isConnected: false,
                portIsOpen,
                sshConnected: false,
                serverInfo: null,
                error:
                  'SSH connection timeout. The server may be slow to respond.',
              }
            } else if (errorMessage.includes('refused')) {
              return {
                isConnected: false,
                portIsOpen,
                sshConnected: false,
                serverInfo: null,
                error:
                  'SSH connection refused. Please check if SSH service is running on the server.',
              }
            } else if (errorMessage.includes('host key')) {
              return {
                isConnected: false,
                portIsOpen,
                sshConnected: false,
                serverInfo: null,
                error:
                  'SSH host key verification failed. The server key may have changed.',
              }
            }
          }

          return {
            isConnected: false,
            portIsOpen,
            sshConnected: false,
            serverInfo: null,
            error:
              'SSH connection failed. Please check your connection details.',
          }
        } finally {
          // Clean up SSH connection
          if (ssh) {
            try {
              ssh.dispose()
            } catch (disposeError) {
              console.error('Error disposing SSH connection:', disposeError)
            }
          }
        }

        const isFullyConnected = portIsOpen && sshConnected

        return {
          isConnected: isFullyConnected,
          portIsOpen,
          sshConnected,
          serverInfo,
          error: null,
        }
      } catch (error) {
        console.error('Server connection check failed:', error)

        // Handle different types of errors
        if (error instanceof Error) {
          const errorMessage = error.message.toLowerCase()

          if (
            errorMessage.includes('network') ||
            errorMessage.includes('dns')
          ) {
            return {
              isConnected: false,
              portIsOpen: false,
              sshConnected: false,
              serverInfo: null,
              error:
                'Network error. Please check your internet connection and server IP address.',
            }
          } else if (errorMessage.includes('timeout')) {
            return {
              isConnected: false,
              portIsOpen: false,
              sshConnected: false,
              serverInfo: null,
              error:
                'Connection timeout. The server may be unreachable or overloaded.',
            }
          }
        }

        // Generic error fallback
        return {
          isConnected: false,
          portIsOpen: false,
          sshConnected: false,
          serverInfo: null,
          error:
            'Failed to connect to server. Please check your connection details and try again.',
        }
      }
    }
  })

export const generateTailscaleHostname = userClient
  .metadata({
    actionName: 'generateTailscaleHostname',
  })
  .action(async ({ ctx }) => {
    const { payload } = ctx

    let unique = false
    let hostname = ''
    while (!unique) {
      hostname = `dfi-${generateRandomString({ length: 7, charset: '0123456789' })}`
      const response = await payload.count({
        collection: 'servers',
        where: {
          hostname: {
            equals: hostname,
          },
        },
      })
      if (response.totalDocs === 0) {
        unique = true
      }
    }

    return { hostname }
  })

export const configureGlobalBuildDirAction = protectedClient
  .metadata({
    actionName: 'configureGlobalBuildDirAction',
  })
  .schema(configureGlobalBuildDirSchema)
  .action(async ({ clientInput, ctx }) => {
    const { serverId, buildDir } = clientInput
    const { payload } = ctx

    const server = await payload.findByID({
      collection: 'servers',
      id: serverId,
      depth: 10,
    })

    const sshDetails = extractSSHDetails({ server })
    const ssh = await dynamicSSH(sshDetails)

    const result = await dokku.builder.setGlobalBuildDir({ ssh, buildDir })

    // Save the buildDir value to the server record
    await payload.update({
      collection: 'servers',
      id: serverId,
      data: {
        globalBuildPath: buildDir || null,
      },
    })

    return {
      success: result.code === 0,
      message: result.stdout || result.stderr,
    }
  })

export const resetOnboardingAction = protectedClient
  .metadata({
    actionName: 'resetOnboardingAction',
  })
  .schema(uninstallDokkuSchema)
  .action(async ({ clientInput, ctx }) => {
    const { serverId } = clientInput
    const { payload, userTenant } = ctx

    const serverDetails = (await payload.findByID({
      collection: 'servers',
      id: serverId,
      depth: 1,
      context: {
        populateServerDetails: true,
      },
    })) as ServerType

    const sshDetails = extractSSHDetails({ server: serverDetails })

    const resetServerResult = await addResetServerQueue({
      sshDetails,
      serverDetails: serverDetails,
      tenant: {
        slug: userTenant.tenant.slug,
        id: userTenant.tenant.id,
      },
    })

    if (resetServerResult.id) {
      return { success: true }
    }

    return { success: false }
  })

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

      const monitoringUrl = env.BESZEL_MONITORING_URL!
      const superuserEmail = env.BESZEL_SUPERUSER_EMAIL!
      const superuserPassword = env.BESZEL_SUPERUSER_PASSWORD!
      const beszelHubSshKey = env.BESZEL_HUB_SSH_KEY!

      // Send initial notification
      sendEvent({
        pub,
        message: `🔧 Starting monitoring tools installation...`,
        serverId: serverDetails.id,
      })

      // STEP 1: Create monitoring project
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
                equals: userTenant.tenant.id,
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
      const projectDetails = await payload.create({
        collection: 'projects',
        data: {
          name: uniqueName,
          description: 'Monitoring tools for server observability',
          server: serverDetails.id,
          tenant: userTenant.tenant.id,
          hidden: true, // Hide from main project list
        },
        depth: 10,
      })

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

      // STEP 4: Generate unique service names
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
        const finalName = nameExists ? `${baseName}-${uniqueSuffix}` : baseName
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
          variables?.push(variable)
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
              tenant: userTenant.tenant.id,
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
              tenant: userTenant.tenant.id,
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
                provider: service?.provider,
                builder: service?.builder,
                volumes: service?.volumes,
                tenant: userTenant.tenant.id,
              },
              depth: 3,
            })

            createdServices.push(serviceResponse)
          }
        }
      }

      sendEvent({
        pub,
        message: `✅ Monitoring tools setup completed successfully`,
        serverId: serverDetails.id,
      })

      sendEvent({
        pub,
        message: `🚀 Initiating monitoring services deployment...`,
        serverId: serverDetails.id,
      })

      // STEP 7: Queue only the deployment step
      // Remove project reference to avoid circular dependencies in deployment
      const lightweightServices = createdServices.map(
        ({ project, ...rest }) => rest,
      )

      const deployResponse = await addMonitoringDeploymentQueue({
        services: lightweightServices,
        serverDetails: {
          id: (projectDetails.server as Server).id,
        },
        project: projectDetails,
        tenantDetails: {
          slug: userTenant.tenant.slug,
        },
        serverId: serverDetails.id,
      })

      // Trigger UI refresh to show new monitoring project immediately
      sendActionEvent({
        pub,
        action: 'refresh',
        tenantSlug: userTenant.tenant.slug,
      })

      // Note: Deployment success/failure will be handled by the deployment queue
      // The monitoring setup is considered successful at this point
      return {
        success: true,
        projectId: projectDetails.id,
        deploymentJobId: deployResponse.id,
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
