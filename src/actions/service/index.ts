'use server'

import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'

import { protectedClient, publicClient } from '@/lib/safe-action'
import { server } from '@/lib/server'
import { dynamicSSH } from '@/lib/ssh'
import { addRestartAppQueue } from '@/queues/app/restart'
import { addStopAppQueue } from '@/queues/app/stop'
import { addExposeDatabasePortQueue } from '@/queues/database/expose'
import { addRestartDatabaseQueue } from '@/queues/database/restart'
import { addStopDatabaseQueue } from '@/queues/database/stop'
import { addManageServiceDomainQueue } from '@/queues/domain/manage'
import { addUpdateEnvironmentVariablesQueue } from '@/queues/environment/update'

import {
  createServiceSchema,
  deleteServiceSchema,
  exposeDatabasePortSchema,
  updateServiceDomainSchema,
  updateServiceEnvironmentsSchema,
  updateServiceSchema,
} from './validator'

const payload = await getPayload({ config: configPromise })

// No need to handle try/catch that abstraction is taken care by next-safe-actions
export const createServiceAction = publicClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'createServiceAction',
  })
  .schema(createServiceSchema)
  .action(async ({ clientInput }) => {
    const { name, description, projectId, type, databaseType } = clientInput

    const response = await payload.create({
      collection: 'services',
      data: {
        project: projectId,
        name,
        description,
        type,
        databaseDetails: {
          type: databaseType,
        },
      },
    })

    if (response) {
      revalidatePath(`/dashboard/project/${projectId}`)
    }

    return response
  })

export const deleteServiceAction = publicClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'deleteServiceAction',
  })
  .schema(deleteServiceSchema)
  .action(async ({ clientInput }) => {
    const { id } = clientInput

    const response = await payload.delete({
      collection: 'services',
      id,
    })

    if (response) {
      const projectId =
        typeof response.project === 'object'
          ? response.project.id
          : response.project

      // Revalidate the parent project page and the service page
      revalidatePath(`/dashboard/project/${projectId}/service/${id}`)
      revalidatePath(`/dashboard/project/${projectId}`)
      return { deleted: true }
    }
  })

export const updateServiceAction = protectedClient
  .metadata({
    actionName: 'updateServerAction',
  })
  .schema(updateServiceSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id, ...data } = clientInput

    const filteredObject = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined),
    )

    const response = await payload.update({
      collection: 'services',
      data: filteredObject,
      id,
      depth: 10,
    })

    const projectId =
      typeof response?.project === 'object' ? response.project.id : ''

    if (projectId) {
      revalidatePath(`/dashboard/project/${projectId}/service/${id}`)
    }

    // If env variables are added then adding it to queue to update env
    if (
      data?.environmentVariables &&
      typeof response?.project === 'object' &&
      typeof response?.project?.server === 'object' &&
      typeof response?.project?.server?.sshKey === 'object'
    ) {
      await addUpdateEnvironmentVariablesQueue({
        serviceDetails: {
          environmentVariables: data?.environmentVariables,
          name: response?.name,
          noRestart: data?.noRestart ?? true,
        },
        sshDetails: {
          host: response?.project?.server?.ip,
          port: response?.project?.server?.port,
          username: response?.project?.server?.username,
          privateKey: response?.project?.server?.sshKey?.privateKey,
        },
      })
    }

    if (response?.id) {
      return { success: true }
    }
  })

export const restartServiceAction = protectedClient
  .metadata({
    actionName: 'restartServiceAction',
  })
  .schema(deleteServiceSchema)
  .action(async ({ clientInput, ctx }) => {
    const cookieStore = await cookies()
    const payloadToken = cookieStore.get('payload-token')

    const { id } = clientInput
    const {
      project,
      type,
      providerType,
      githubSettings,
      provider,
      ...serviceDetails
    } = await payload.findByID({
      collection: 'services',
      depth: 10,
      id,
    })

    // A if check for getting all ssh keys & server details
    if (
      typeof project === 'object' &&
      typeof project?.server === 'object' &&
      typeof project?.server?.sshKey === 'object'
    ) {
      const sshDetails = {
        privateKey: project?.server?.sshKey?.privateKey,
        host: project?.server?.ip,
        username: project?.server?.username,
        port: project?.server?.port,
      }

      let queueId: string | undefined

      if (type === 'database' && serviceDetails.databaseDetails?.type) {
        const queueResponse = await addRestartDatabaseQueue({
          databaseName: serviceDetails.name,
          databaseType: serviceDetails.databaseDetails?.type,
          sshDetails,
          payloadToken: payloadToken?.value,
          serviceDetails: {
            id: serviceDetails.id,
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
  .schema(deleteServiceSchema)
  .action(async ({ clientInput, ctx }) => {
    const cookieStore = await cookies()
    const payloadToken = cookieStore.get('payload-token')

    const { id } = clientInput
    const {
      project,
      type,
      providerType,
      githubSettings,
      provider,
      ...serviceDetails
    } = await payload.findByID({
      collection: 'services',
      depth: 10,
      id,
    })

    // A if check for getting all ssh keys & server details
    if (
      typeof project === 'object' &&
      typeof project?.server === 'object' &&
      typeof project?.server?.sshKey === 'object'
    ) {
      const sshDetails = {
        privateKey: project?.server?.sshKey?.privateKey,
        host: project?.server?.ip,
        username: project?.server?.username,
        port: project?.server?.port,
      }

      let queueId: string | undefined

      if (type === 'database' && serviceDetails.databaseDetails?.type) {
        const queueResponse = await addStopDatabaseQueue({
          databaseName: serviceDetails.name,
          databaseType: serviceDetails.databaseDetails?.type,
          sshDetails,
          payloadToken: payloadToken?.value,
          serviceDetails: {
            id: serviceDetails.id,
          },
        })

        queueId = queueResponse.id
      }

      if (type === 'docker') {
        const queueResponse = await addStopAppQueue({
          sshDetails,
          serviceDetails: {
            id: serviceDetails.id,
            name: serviceDetails.name,
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
  .action(async ({ clientInput }) => {
    const { id, ports } = clientInput

    const {
      project,
      type,
      providerType,
      githubSettings,
      provider,
      ...serviceDetails
    } = await payload.findByID({
      collection: 'services',
      depth: 10,
      id,
    })

    // A if check for getting all ssh keys & server details
    if (
      typeof project === 'object' &&
      typeof project?.server === 'object' &&
      typeof project?.server?.sshKey === 'object'
    ) {
      const sshDetails = {
        privateKey: project?.server?.sshKey?.privateKey,
        host: project?.server?.ip,
        username: project?.server?.username,
        port: project?.server?.port,
      }

      if (type === 'database' && serviceDetails.databaseDetails?.type) {
        const ssh = await dynamicSSH(sshDetails)

        console.log("I'm inside", { ssh })

        const portsResponse = await server.ports.available({
          ssh,
          ports,
        })

        // If port response failed throw exception
        if (!portsResponse) {
          throw new Error('port-status unavailable, please try again!')
        }

        const unavailablePorts = portsResponse.filter(
          ({ available }) => !available,
        )

        // If any port is in use throwing an error
        if (unavailablePorts.length) {
          throw new Error(
            `${unavailablePorts.map(({ port }) => port).join(', ')} are already in use!`,
          )
        }

        // Updating the exposed ports in payload
        await payload.update({
          collection: 'services',
          data: {
            databaseDetails: {
              exposedPorts: ports,
            },
          },
          id,
        })

        const queueResponse = await addExposeDatabasePortQueue({
          databaseName: serviceDetails.name,
          databaseType: serviceDetails.databaseDetails?.type,
          sshDetails,

          serviceDetails: {
            id,
            ports,
            previousPorts: serviceDetails.databaseDetails?.exposedPorts ?? [],
          },
        })

        ssh.dispose()

        if (queueResponse.id) {
          return { success: true }
        }
      }
    }
  })

export const updateServiceEnvironmentVariablesAction = protectedClient
  .metadata({
    actionName: 'updateServiceEnvironmentVariablesAction',
  })
  .schema(updateServiceEnvironmentsSchema)
  .action(async ({ clientInput }) => {
    const { id, environmentVariables, projectId } = clientInput

    const updatedService = await payload.update({
      collection: 'services',
      id,
      data: {
        environmentVariables,
      },
    })

    if (updatedService.id) {
      revalidatePath(`/dashboard/project/${projectId}/service/${id}`)
      return { success: true }
    }
  })

export const updateServiceDomainAction = protectedClient
  .metadata({
    actionName: 'updateServiceDomainAction',
  })
  .schema(updateServiceDomainSchema)
  .action(async ({ clientInput }) => {
    const { id, domain, operation } = clientInput

    // Fetching service-details for showing previous details
    const { domains: servicePreviousDomains } = await payload.findByID({
      id,
      collection: 'services',
    })

    let updatedDomains = servicePreviousDomains ?? []

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
        },
      ]
    } else {
      // in add case directly adding domain
      updatedDomains = [
        ...updatedDomains,
        {
          domain: domain.hostname,
          default: false,
          autoRegenerateSSL: domain.autoRegenerateSSL,
          certificateType: domain.certificateType,
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

    if (
      typeof updatedServiceDomainResponse.project === 'object' &&
      typeof updatedServiceDomainResponse.project.server === 'object' &&
      typeof updatedServiceDomainResponse.project.server.sshKey === 'object'
    ) {
      const { ip, port, username } = updatedServiceDomainResponse.project.server
      const privateKey =
        updatedServiceDomainResponse.project.server.sshKey.privateKey

      const queueResponse = await addManageServiceDomainQueue({
        serviceDetails: {
          action: operation,
          domain: domain.hostname,
          name: updatedServiceDomainResponse.name,
          certificateType: domain.certificateType,
          autoRegenerateSSL: domain.autoRegenerateSSL,
        },
        sshDetails: {
          privateKey,
          host: ip,
          port,
          username,
        },
      })

      if (queueResponse.id) {
        revalidatePath(
          `/dashboard/project/${updatedServiceDomainResponse.project.id}/service/${id}`,
        )
        return { success: true }
      }
    }
  })
