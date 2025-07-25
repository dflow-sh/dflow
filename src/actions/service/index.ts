'use server'

import { env } from 'env'
import { revalidatePath } from 'next/cache'
import { NodeSSH } from 'node-ssh'

import { dokku } from '@/lib/dokku'
import { protectedClient } from '@/lib/safe-action'
import { checkServerResources } from '@/lib/server/resourceCheck'
import { dynamicSSH, extractSSHDetails } from '@/lib/ssh'
import { generateRandomString } from '@/lib/utils'
import { addDestroyApplicationQueue } from '@/queues/app/destroy'
import { addResourceAppQueue } from '@/queues/app/resource'
import { addRestartAppQueue } from '@/queues/app/restart'
import { addScaleAppQueue } from '@/queues/app/scale'
import { addStopAppQueue } from '@/queues/app/stop'
import { addDestroyDatabaseQueue } from '@/queues/database/destroy'
import { addExposeDatabasePortQueue } from '@/queues/database/expose'
import { addRestartDatabaseQueue } from '@/queues/database/restart'
import { addStopDatabaseQueue } from '@/queues/database/stop'
import { addManageServiceDomainQueue } from '@/queues/domain/manage'
import { addUpdateEnvironmentVariablesQueue } from '@/queues/environment/update'
import { addLetsencryptRegenerateQueueQueue } from '@/queues/letsencrypt/regenerate'
import { updateVolumesQueue } from '@/queues/volume/updateVolumesQueue'

import {
  checkServerResourcesSchema,
  clearServiceResourceLimitSchema,
  clearServiceResourceReserveSchema,
  createServiceSchema,
  deleteServiceSchema,
  exposeDatabasePortSchema,
  fetchServiceResourceStatusSchema,
  fetchServiceScaleStatusSchema,
  regenerateSSLSchema,
  restartServiceSchema,
  scaleServiceSchema,
  setServiceResourceLimitSchema,
  setServiceResourceReserveSchema,
  stopServiceSchema,
  updateServiceDomainSchema,
  updateServiceSchema,
  updateVolumesSchema,
} from './validator'

function getServerIdFromProject(project: any): string {
  if (!project) return ''
  if (typeof project === 'string') return project
  if (typeof project.server === 'string') return project.server
  if (typeof project.server === 'object' && project.server !== null)
    return project.server.id
  return ''
}

// No need to handle try/catch that abstraction is taken care by next-safe-actions
export const createServiceAction = protectedClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'createServiceAction',
  })
  .schema(createServiceSchema)
  .action(async ({ clientInput, ctx }) => {
    const { name, description, projectId, type, databaseType } = clientInput
    const {
      userTenant: { tenant },
      payload,
      user,
    } = ctx

    const { server, name: projectName } = await payload.findByID({
      collection: 'projects',
      id: projectId,
      depth: 10,
    })

    const slicedName = name.slice(0, 10)

    let serviceName = `${projectName}-${slicedName}`

    const { totalDocs } = await payload.find({
      collection: 'services',
      where: {
        and: [
          {
            tenant: {
              equals: tenant.id,
            },
          },
          {
            name: {
              equals: serviceName,
            },
          },
        ],
      },
    })

    let ssh: NodeSSH | null = null

    const sshDetails = extractSSHDetails({ server })

    try {
      ssh = await dynamicSSH(sshDetails)

      // Determine serviceType for resource check
      let serviceType: 'app' | 'docker' | 'database' = 'app'
      if (type === 'docker') {
        serviceType = 'docker'
      } else if (type === 'database' || databaseType) {
        serviceType = 'database'
      }

      // Resource check before proceeding
      const resourceCheck = await checkServerResources(ssh, { serviceType })

      if (!resourceCheck.capable) {
        console.log('Unable to create service')
        throw new Error(
          `Server is not capable of handling a new service: ${resourceCheck.reason}`,
        )
      }

      if (totalDocs > 0) {
        const uniqueSuffix = generateRandomString({ length: 4 })
        serviceName = `${serviceName}-${uniqueSuffix}`
      }

      if (type === 'app' || type === 'docker') {
        // Creating app in dokku
        const appsCreationResponse = await dokku.apps.create(ssh, serviceName)

        // If app created adding db entry
        if (appsCreationResponse) {
          const response = await payload.create({
            collection: 'services',
            data: {
              project: projectId,
              name: serviceName,
              description,
              type,
              databaseDetails: {
                type: databaseType,
              },
              tenant,
            },
            user,
          })

          // Apply default resource limits if configured on the server
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
            } catch (e) {
              console.error('Failed to apply default resource limits:', e)
              // Do not throw, allow service creation to succeed
            }
          }

          if (response?.id) {
            revalidatePath(`/${tenant.slug}/dashboard/project/${projectId}`)
            return {
              success: true,
              redirectUrl: `/${tenant.slug}/dashboard/project/${projectId}/service/${response.id}`,
            }
          }
        }
      } else if (databaseType) {
        const databaseList = await dokku.database.list(ssh, databaseType)

        // Throwing a error if database is already created
        if (databaseList.includes(serviceName)) {
          throw new Error('Name is already taken!')
        }

        const databaseResponse = await payload.create({
          collection: 'services',
          data: {
            project: projectId,
            name: serviceName,
            description,
            type,
            databaseDetails: {
              type: databaseType,
            },
            tenant,
          },
          user,
        })

        if (databaseResponse.id) {
          revalidatePath(`/${tenant.slug}/dashboard/project/${projectId}`)

          return {
            success: true,
            redirectUrl: `/${tenant.slug}/dashboard/project/${projectId}/service/${databaseResponse.id}`,
          }
        }
      }
    } catch (error) {
      let message = ''

      if (error instanceof Error) {
        message = error.message
      }

      throw new Error(message)
    } finally {
      // disposing ssh even on error cases
      if (ssh) {
        ssh.dispose()
      }
    }
  })

export const deleteServiceAction = protectedClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'deleteServiceAction',
  })
  .schema(deleteServiceSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id, deleteBackups, deleteFromServer } = clientInput
    const {
      userTenant: { tenant },
      payload,
    } = ctx

    const { project, type, ...serviceDetails } = await payload.findByID({
      collection: 'services',
      id,
      depth: 10,
    })

    if (typeof project === 'object') {
      const serverId =
        typeof project.server === 'object' ? project.server.id : project.server

      // Again fetching the server details because, it's coming as objectID
      const serverDetails = await payload.findByID({
        collection: 'servers',
        id: serverId,
      })

      // Only delete from server if the option is enabled
      if (deleteFromServer && serverDetails.id) {
        const sshDetails = extractSSHDetails({ server: serverDetails })

        let queueId: string | undefined = ''

        // handling database delete
        if (type === 'database' && serviceDetails.databaseDetails?.type) {
          const databaseDeletionQueueResponse = await addDestroyDatabaseQueue({
            databaseName: serviceDetails.name,
            databaseType: serviceDetails.databaseDetails?.type,
            sshDetails,
            serverDetails: {
              id: serverDetails.id,
            },
            serviceId: serviceDetails.id,
            deleteBackups,
            tenant: {
              slug: tenant.slug,
            },
          })

          queueId = databaseDeletionQueueResponse.id
        }

        // handling service delete
        if (type === 'app' || type === 'docker') {
          const appDeletionQueueResponse = await addDestroyApplicationQueue({
            sshDetails,
            serviceDetails: {
              name: serviceDetails.name,
            },
            serverDetails: {
              id: serverDetails.id,
            },
          })

          queueId = appDeletionQueueResponse.id
        }

        // If deleting of service is added to queue, update the service entry
        if (queueId) {
          await payload.update({
            collection: 'services',
            id,
            data: {
              deletedAt: new Date().toISOString(),
            },
          })
        }
      } else if (!deleteFromServer) {
        // If not deleting from server, just mark as deleted in database
        await payload.update({
          collection: 'services',
          id,
          data: {
            deletedAt: new Date().toISOString(),
          },
        })
      }

      // Always update the service in the database (if not already done above)
      const response = await payload.findByID({
        collection: 'services',
        id,
      })

      // Only update if not already marked as deleted
      if (!response.deletedAt) {
        await payload.update({
          collection: 'services',
          id,
          data: {
            deletedAt: new Date().toISOString(),
          },
        })
      }

      // Always delete associated deployments
      await payload.update({
        collection: 'deployments',
        data: {
          deletedAt: new Date().toISOString(),
        },
        where: {
          service: {
            equals: id,
          },
        },
      })

      const projectId = typeof project === 'object' ? project.id : project

      // Revalidate the parent project page and the service page
      revalidatePath(
        `/${tenant.slug}/dashboard/project/${projectId}/service/${id}`,
      )
      revalidatePath(`/${tenant.slug}/dashboard/project/${projectId}`)

      return {
        deleted: true,
        deletedFromServer: deleteFromServer,
      }
    } else {
      throw new Error('Failed to delete service: Project not found')
    }
  })

export const updateServiceAction = protectedClient
  .metadata({
    actionName: 'updateServiceAction',
  })
  .schema(updateServiceSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id, ...data } = clientInput
    const {
      userTenant: { tenant },
      payload,
    } = ctx

    const previousDetails = await payload.findByID({
      collection: 'services',
      id,
    })

    const response = await payload.update({
      collection: 'services',
      data: {
        ...data,
        provider: data?.provider ?? null,
      },
      id,
      depth: 10,
    })

    const environmentVariablesChange =
      data?.variables &&
      JSON.stringify(previousDetails.variables) !==
        JSON.stringify(data?.variables)

    // If env variables are added then adding it to queue to update env
    if (
      environmentVariablesChange &&
      typeof response?.project === 'object' &&
      typeof response?.project?.server === 'object'
    ) {
      const sshDetails = extractSSHDetails({ project: response.project })

      await addUpdateEnvironmentVariablesQueue({
        serviceDetails: {
          previousVariables: previousDetails?.variables ?? [],
          variables: response?.variables ?? [],
          name: response?.name,
          noRestart: data?.noRestart ?? true,
          id,
        },
        sshDetails,
        serverDetails: {
          id: response.project.server.id,
        },
        tenantDetails: {
          slug: tenant.slug,
        },
      })
    }

    if (response?.id) {
      const projectId =
        typeof response?.project === 'object'
          ? response?.project?.id
          : response?.project
      revalidatePath(
        `/${tenant.slug}/dashboard/project/${projectId}/service/${response?.id}`,
      )
      return { success: true }
    }
  })

export const restartServiceAction = protectedClient
  .metadata({
    actionName: 'restartServiceAction',
  })
  .schema(restartServiceSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id } = clientInput
    const { payload, userTenant } = ctx

    const { project, type, ...serviceDetails } = await payload.findByID({
      collection: 'services',
      depth: 10,
      id,
    })

    // A if check for getting all ssh keys & server details
    if (typeof project === 'object' && typeof project?.server === 'object') {
      const sshDetails = extractSSHDetails({ project })

      let queueId: string | undefined

      if (type === 'database' && serviceDetails.databaseDetails?.type) {
        const queueResponse = await addRestartDatabaseQueue({
          databaseName: serviceDetails.name,
          databaseType: serviceDetails.databaseDetails?.type,
          sshDetails,
          serviceDetails: {
            id: serviceDetails.id,
          },
          serverDetails: {
            id: serviceDetails.id,
          },
          tenant: {
            slug: userTenant.tenant.slug,
          },
        })

        queueId = queueResponse.id
      }

      if (type === 'docker' || type === 'app') {
        const queueResponse = await addRestartAppQueue({
          sshDetails,
          serviceDetails: {
            id: serviceDetails.id,
            name: serviceDetails.name,
          },
          serverDetails: {
            id: project.server.id,
          },
        })

        queueId = queueResponse.id
      }

      if (queueId) {
        return { success: true }
      }
    }
  })

export const stopServerAction = protectedClient
  .metadata({
    actionName: 'stopServerAction',
  })
  .schema(stopServiceSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id } = clientInput
    const { payload, userTenant } = ctx

    const { project, type, ...serviceDetails } = await payload.findByID({
      collection: 'services',
      depth: 10,
      id,
    })

    // A if check for getting all ssh keys & server details
    if (typeof project === 'object' && typeof project?.server === 'object') {
      const sshDetails = extractSSHDetails({ project })
      let queueId: string | undefined

      if (type === 'database' && serviceDetails.databaseDetails?.type) {
        const queueResponse = await addStopDatabaseQueue({
          databaseName: serviceDetails.name,
          databaseType: serviceDetails.databaseDetails?.type,
          sshDetails,
          serviceDetails: {
            id: serviceDetails.id,
          },
          serverDetails: {
            id: project.server.id,
          },
          tenant: {
            slug: userTenant.tenant.slug,
          },
        })

        queueId = queueResponse.id
      }

      if (type === 'docker' || type === 'app') {
        const queueResponse = await addStopAppQueue({
          sshDetails,
          serviceDetails: {
            id: serviceDetails.id,
            name: serviceDetails.name,
          },
          serverDetails: {
            id: project.server.id,
          },
        })

        queueId = queueResponse.id
      }

      if (queueId) {
        return { success: true }
      }
    }
  })

export const exposeDatabasePortAction = protectedClient
  .metadata({
    actionName: 'exposeDatabasePortAction',
  })
  .schema(exposeDatabasePortSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id, action } = clientInput
    const { payload, userTenant } = ctx

    const { project, type, ...serviceDetails } = await payload.findByID({
      collection: 'services',
      depth: 10,
      id,
    })

    // A if check for getting all ssh keys & server details
    if (typeof project === 'object' && typeof project?.server === 'object') {
      const sshDetails = extractSSHDetails({ project })

      if (type === 'database' && serviceDetails.databaseDetails?.type) {
        const { exposedPorts } = serviceDetails?.databaseDetails

        try {
          const queueResponse = await addExposeDatabasePortQueue({
            databaseName: serviceDetails.name,
            databaseType: serviceDetails.databaseDetails?.type,
            sshDetails,
            serviceDetails: {
              previousPorts: exposedPorts ?? [],
              id: serviceDetails.id,
              action,
            },
            serverDetails: {
              id: project.server.id,
            },
            tenant: {
              slug: userTenant.tenant.slug,
            },
          })

          if (queueResponse.id) {
            return { success: true }
          }
        } catch (error) {
          let message = error instanceof Error ? error.message : ''
          throw new Error(message)
        }
      }
    }
  })

export const updateServiceDomainAction = protectedClient
  .metadata({
    actionName: 'updateServiceDomainAction',
  })
  .schema(updateServiceDomainSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id, domain, operation } = clientInput
    const {
      userTenant: { tenant },
      payload,
    } = ctx

    // Fetching service-details for showing previous details
    const { domains: servicePreviousDomains, project } = await payload.findByID(
      {
        id,
        collection: 'services',
      },
    )

    let updatedDomains = servicePreviousDomains ?? []

    const proxyDomainExists = updatedDomains.find(({ domain }) =>
      domain.endsWith(env.NEXT_PUBLIC_PROXY_DOMAIN_URL ?? ' '),
    )

    const duplicateWildCardDomain =
      !!proxyDomainExists &&
      domain.hostname.endsWith(env.NEXT_PUBLIC_PROXY_DOMAIN_URL ?? ' ')

    // throwing error if duplicate domain was added again
    // throwing error when more that 1 proxy domain is added!
    if (operation === 'add') {
      const domainExists = updatedDomains.find(
        updatedDomain => updatedDomain.domain === domain.hostname,
      )

      if (domainExists || duplicateWildCardDomain) {
        throw new Error(
          duplicateWildCardDomain
            ? `Wildcard domain already attached`
            : `${domain.hostname} already exists!`,
        )
      }
    }

    if (operation === 'remove') {
      // In remove case removing that particular domain
      updatedDomains = updatedDomains.filter(
        domainDetails => domainDetails.domain !== domain.hostname,
      )
    } else if (operation === 'set') {
      updatedDomains = [
        {
          domain: domain.hostname,
          default: true,
          autoRegenerateSSL: domain.autoRegenerateSSL,
          certificateType: domain.certificateType,
          synced: false,
        },
      ]
    } else {
      // in ADD case directly adding domain
      updatedDomains = [
        ...updatedDomains.map(updatedDomain =>
          domain?.default
            ? { ...updatedDomain, default: false }
            : updatedDomain,
        ),
        {
          domain: domain.hostname,
          default: domain.default ?? false,
          autoRegenerateSSL: domain.autoRegenerateSSL,
          certificateType: domain.certificateType,
          synced: false,
        },
      ]
    }

    const updatedServiceDomainResponse = await payload.update({
      id,
      data: {
        domains: updatedDomains,
      },
      collection: 'services',
      depth: 10,
    })

    // for add operation we're not syncing domain as domain verification process not done!
    if (operation !== 'add') {
      if (
        typeof updatedServiceDomainResponse.project === 'object' &&
        typeof updatedServiceDomainResponse.project.server === 'object'
      ) {
        const sshDetails = extractSSHDetails({ project })
        const isProxyDomain = domain.hostname.endsWith(
          env.NEXT_PUBLIC_PROXY_DOMAIN_URL ?? ' ',
        )

        await addManageServiceDomainQueue({
          serviceDetails: {
            action: operation,
            domain: domain.hostname,
            name: updatedServiceDomainResponse.name,
            certificateType: isProxyDomain ? 'none' : domain.certificateType,
            autoRegenerateSSL: isProxyDomain ? false : domain.autoRegenerateSSL,
            id,
            variables: updatedServiceDomainResponse.variables ?? [],
          },
          sshDetails,
          serverDetails: {
            id: updatedServiceDomainResponse.project.server.id,
            hostname:
              updatedServiceDomainResponse.project.server.hostname ?? '',
            tailscalePrivateIp:
              updatedServiceDomainResponse.project.server.tailscalePrivateIp ??
              '',
          },
          tenantDetails: {
            slug: tenant.slug,
          },
          updateEnvironmentVariables: domain.default,
        })
      }
    }

    revalidatePath(
      `/${tenant.slug}/dashboard/project/${typeof project === 'object' ? project.id : project}/service/${id}`,
    )

    return { success: true }
  })

export const regenerateSSLAction = protectedClient
  .metadata({
    actionName: 'regenerateSSLAction',
  })
  .schema(regenerateSSLSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id, email } = clientInput
    const { payload } = ctx

    const { project, ...serviceDetails } = await payload.findByID({
      collection: 'services',
      depth: 10,
      id,
    })

    if (typeof project === 'object' && typeof project?.server === 'object') {
      const sshDetails = extractSSHDetails({ project })

      const response = await addLetsencryptRegenerateQueueQueue({
        sshDetails,
        serverDetails: {
          id: project?.server?.id,
          hostname: project.server.hostname ?? '',
        },
        serviceDetails: {
          name: serviceDetails.name,
          email,
        },
      })

      if (response.id) {
        return { success: true }
      }
    }
  })

export const syncServiceDomainAction = protectedClient
  .metadata({
    actionName: 'syncServiceDomainAction',
  })
  .schema(updateServiceDomainSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id, domain, operation } = clientInput
    const { payload, userTenant } = ctx

    const { project, variables, ...serviceDetails } = await payload.findByID({
      id,
      collection: 'services',
      depth: 10,
    })

    if (typeof project === 'object' && typeof project.server === 'object') {
      const sshDetails = extractSSHDetails({ project })
      const isProxyDomain = domain.hostname.endsWith(
        env.NEXT_PUBLIC_PROXY_DOMAIN_URL ?? ' ',
      )

      const queueResponse = await addManageServiceDomainQueue({
        serviceDetails: {
          action: operation,
          domain: domain.hostname,
          name: serviceDetails.name,
          certificateType: isProxyDomain ? 'none' : domain.certificateType,
          autoRegenerateSSL: isProxyDomain ? false : domain.autoRegenerateSSL,
          id,
          variables,
        },
        sshDetails,
        serverDetails: {
          id: project.server.id,
          hostname: project.server.hostname ?? '',
          tailscalePrivateIp: project.server.tailscalePrivateIp ?? '',
        },
        updateEnvironmentVariables: domain.default,
        tenantDetails: {
          slug: userTenant.tenant.slug,
        },
      })

      if (queueResponse.id) {
        return { success: true }
      }
    }
  })

export const updateVolumesAction = protectedClient
  .metadata({ actionName: 'updateVolumesAction' })
  .schema(updateVolumesSchema)
  .action(async ({ ctx, clientInput }) => {
    const {
      payload,
      userTenant: { tenant },
    } = ctx
    const { id, volumes } = clientInput

    const updatedService = await payload.update({
      collection: 'services',
      id: id,
      depth: 10,
      data: {
        volumes: volumes,
      },
    })

    const project = updatedService.project
    if (
      updatedService &&
      typeof project === 'object' &&
      typeof project?.server === 'object'
    ) {
      await updateVolumesQueue({
        restart: true,
        service: updatedService,
        serverDetails: {
          id: project.server.id,
        },
        project,
        tenantDetails: {
          slug: tenant.slug,
        },
      })
    }
  })

// Horizontal scaling: set process scale (replicas)
export const scaleServiceAction = protectedClient
  .metadata({ actionName: 'scaleServiceAction' })
  .schema(scaleServiceSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id, scaleArgs } = clientInput
    const { payload, userTenant } = ctx

    const { project, name } = await payload.findByID({
      collection: 'services',
      id,
      depth: 10,
    })

    const sshDetails = extractSSHDetails({ project })
    const serverId = getServerIdFromProject(project)
    const tenantSlug =
      typeof userTenant?.tenant?.slug === 'string' ? userTenant.tenant.slug : ''

    const queueResponse = await addScaleAppQueue({
      sshDetails,
      appName: name,
      scaleArgs,
      serverId,
      tenantSlug,
    })

    return { success: true, queued: true, jobId: queueResponse.id }
  })

// Fetch current process scale/status
export const fetchServiceScaleStatusAction = protectedClient
  .metadata({ actionName: 'fetchServiceScaleStatusAction' })
  .schema(fetchServiceScaleStatusSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id, parse = true } = clientInput
    const { payload } = ctx

    const { project, name } = await payload.findByID({
      collection: 'services',
      id,
      depth: 10,
    })

    const sshDetails = extractSSHDetails({ project })

    let ssh: NodeSSH | null = null

    try {
      ssh = await dynamicSSH(sshDetails)

      const result = await dokku.process.psScale(ssh, name, undefined, parse)

      if (parse) {
        return { success: true, scale: result.parsed }
      } else {
        return { success: true, output: result.stdout }
      }
    } finally {
      if (ssh) ssh.dispose()
    }
  })

// Vertical scaling: set resource limits
export const setServiceResourceLimitAction = protectedClient
  .metadata({ actionName: 'setServiceResourceLimitAction' })
  .schema(setServiceResourceLimitSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id, resourceArgs, processType } = clientInput
    const { payload, userTenant } = ctx

    const { project, name } = await payload.findByID({
      collection: 'services',
      id,
      depth: 10,
    })

    const sshDetails = extractSSHDetails({ project })
    const serverId = getServerIdFromProject(project)
    const tenantSlug =
      typeof userTenant?.tenant?.slug === 'string' ? userTenant.tenant.slug : ''

    const queueResponse = await addResourceAppQueue({
      sshDetails,
      appName: name,
      resourceArgs,
      processType,
      serverId,
      tenantSlug,
      action: 'limit',
    })

    return { success: true, queued: true, jobId: queueResponse.id }
  })

// Vertical scaling: set resource reservations
export const setServiceResourceReserveAction = protectedClient
  .metadata({ actionName: 'setServiceResourceReserveAction' })
  .schema(setServiceResourceReserveSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id, resourceArgs, processType } = clientInput
    const { payload, userTenant } = ctx

    const { project, name } = await payload.findByID({
      collection: 'services',
      id,
      depth: 10,
    })

    const sshDetails = extractSSHDetails({ project })
    const serverId = getServerIdFromProject(project)
    const tenantSlug =
      typeof userTenant?.tenant?.slug === 'string' ? userTenant.tenant.slug : ''

    const queueResponse = await addResourceAppQueue({
      sshDetails,
      appName: name,
      resourceArgs,
      processType,
      serverId,
      tenantSlug,
      action: 'reserve',
    })

    return { success: true, queued: true, jobId: queueResponse.id }
  })

// Fetch current resource status
export const fetchServiceResourceStatusAction = protectedClient
  .metadata({ actionName: 'fetchServiceResourceStatusAction' })
  .schema(fetchServiceResourceStatusSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id } = clientInput
    const { payload } = ctx

    const { project, name } = await payload.findByID({
      collection: 'services',
      id,
      depth: 10,
    })

    const sshDetails = extractSSHDetails({ project })

    let ssh: NodeSSH | null = null

    try {
      ssh = await dynamicSSH(sshDetails)

      const result = await dokku.resource.report(ssh, name)

      return { success: true, resource: result.parsed }
    } finally {
      if (ssh) ssh.dispose()
    }
  })

// Clear resource limits
export const clearServiceResourceLimitAction = protectedClient
  .metadata({ actionName: 'clearServiceResourceLimitAction' })
  .schema(clearServiceResourceLimitSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id, processType } = clientInput
    const { payload, userTenant } = ctx

    const { project, name } = await payload.findByID({
      collection: 'services',
      id,
      depth: 10,
    })

    const sshDetails = extractSSHDetails({ project })
    const serverId = getServerIdFromProject(project)
    const tenantSlug =
      typeof userTenant?.tenant?.slug === 'string' ? userTenant.tenant.slug : ''

    const queueResponse = await addResourceAppQueue({
      sshDetails,
      appName: name,
      resourceArgs: [],
      processType,
      serverId,
      tenantSlug,
      action: 'limitClear',
    })

    return { success: true, queued: true, jobId: queueResponse.id }
  })

// Clear resource reservations
export const clearServiceResourceReserveAction = protectedClient
  .metadata({ actionName: 'clearServiceResourceReserveAction' })
  .schema(clearServiceResourceReserveSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id, processType } = clientInput
    const { payload, userTenant } = ctx

    const { project, name } = await payload.findByID({
      collection: 'services',
      id,
      depth: 10,
    })

    const sshDetails = extractSSHDetails({ project })
    const serverId = getServerIdFromProject(project)
    const tenantSlug =
      typeof userTenant?.tenant?.slug === 'string' ? userTenant.tenant.slug : ''

    const queueResponse = await addResourceAppQueue({
      sshDetails,
      appName: name,
      resourceArgs: [],
      processType,
      serverId,
      tenantSlug,
      action: 'reserveClear',
    })

    return { success: true, queued: true, jobId: queueResponse.id }
  })

export const checkServerResourcesAction = protectedClient
  .metadata({ actionName: 'checkServerResourcesAction' })
  .schema(checkServerResourcesSchema)
  .action(async ({ ctx, clientInput }) => {
    const { payload } = ctx
    const { serverId, serviceType } = clientInput

    const server = await payload.findByID({
      collection: 'servers',
      id: serverId,
    })

    const sshDetails = extractSSHDetails({ server })
    const ssh = await dynamicSSH(sshDetails)

    const result = await checkServerResources(ssh, { serviceType })

    ssh.dispose()

    return result
  })
