'use server'

import { generateUniqueServiceName } from '../beszel/utils'
import { createProjectAction, createProjectAdminAction } from '../project'
import { env } from 'env'
import { BasePayload } from 'payload'

import { pub } from '@/lib/redis'
import { adminClient, protectedClient } from '@/lib/safe-action'
import { sendEvent } from '@/lib/sendEvent'
import { fetchOfficialTemplateByName } from '@/lib/utils/templates'
import { Service } from '@/payload-types'
import { addTemplateDeployQueue } from '@/queues/template/deploy'

import { dokkuBackupSchema } from './validator'

const serverBackupMethod = async ({
  payload,
  serverId,
  useAdminProcedure = false,
}: {
  payload: BasePayload
  serverId: string
  useAdminProcedure?: boolean
}) => {
  const s3Enabled =
    env.S3_ENDPOINT &&
    env.S3_REGION &&
    env.S3_ACCESS_KEY_ID &&
    env.S3_SECRET_ACCESS_KEY

  if (!s3Enabled) {
    throw new Error(
      'S3 configuration not provided for backup!, please add all S3 environment variables',
    )
  }

  const server = await payload.findByID({
    collection: 'servers',
    id: serverId,
    depth: 1,
  })

  const tenant =
    server.tenant && typeof server.tenant === 'object'
      ? { id: server.tenant.id, slug: server.tenant.slug }
      : { id: '', slug: '' }

  // 2. install the official-restic-template
  //     2.1 check for backups project
  //     2.2 fetch restic-template
  //     2.3 deploy services if there's any change!

  const { docs } = await payload.find({
    collection: 'projects',
    pagination: false,
    depth: 2,
    where: {
      and: [
        { server: { equals: serverId } },
        { tenant: { equals: tenant.id } },
        { name: { contains: 'backups' } },
        { hidden: { equals: true } },
      ],
    },
  })

  let project = docs?.[0]

  // Get or create backups project
  if (!project) {
    if (useAdminProcedure) {
      const projectResponse = await createProjectAdminAction({
        name: 'backups',
        serverId,
        revalidate: false,
        hidden: true,
        tenantId: tenant.id,
      })

      if (projectResponse?.data) {
        project = projectResponse?.data
      }
    } else {
      const projectResponse = await createProjectAction({
        name: 'backups',
        serverId,
        revalidate: false,
        hidden: true,
      })

      if (projectResponse?.data) {
        project = projectResponse?.data
      }
    }
  }

  const template = await fetchOfficialTemplateByName({
    name: 'Restic Backups',
  })

  const existingServices = project?.services?.docs ?? []
  const updatedServices = template?.services?.map(service => {
    if (service.name === 'app') {
      return {
        ...service,
        variables: service.variables?.map(variable => {
          switch (variable.key) {
            case 'RESTIC_REPOSITORY':
              return {
                ...variable,
                value: `s3:${env.S3_ENDPOINT}/dflow/prod/servers/${serverId}`,
              }
            case 'RESTIC_PASSWORD':
              return { ...variable, value: serverId }
            case 'AWS_ACCESS_KEY_ID':
              return { ...variable, value: env.S3_ACCESS_KEY_ID }
            case 'AWS_SECRET_ACCESS_KEY':
              return { ...variable, value: env.S3_SECRET_ACCESS_KEY }
            case 'AWS_DEFAULT_REGION':
              return { ...variable, value: env.S3_REGION }
            default:
              return variable
          }
        }),
      } as Service
    }

    return service
  })

  const newServices: Service[] = []
  const modifiedServices: Service[] = []
  const deployServices: Service[] = []

  // Update services
  for await (const service of updatedServices ?? []) {
    const existingService = existingServices.find(
      s => typeof s === 'object' && s.name?.includes(service.name),
    )

    // check for service existence create/update based on that
    if (existingService && typeof existingService === 'object') {
      // Check if existing service needs updates
      const needsUpdate = service.variables?.some(
        tv =>
          !existingService.variables?.find(
            ev => ev.key === tv.key && ev.value === tv.value,
          ),
      )

      if (needsUpdate) {
        const updated = await payload.update({
          collection: 'services',
          id: existingService.id,
          data: { variables: service.variables },
          depth: 3,
        })

        modifiedServices.push(updated)
        deployServices.push(updated)

        sendEvent({
          pub,
          message: `🔄 Updated service: ${existingService.name}`,
          serverId,
        })
      }

      deployServices.push(service)
    } else {
      // todo: update other-service environment-variables according to updated service-name
      const serviceName = await generateUniqueServiceName(
        payload,
        project.name,
        service.name,
        tenant.id,
      )

      const createdService = await payload.create({
        collection: 'services',
        data: {
          ...service,
          name: serviceName,
          tenant: tenant.id,
          project: project.id,
        },
      })

      newServices.push(createdService)
      deployServices.push(createdService)
    }
  }

  if (newServices.length || deployServices.length) {
    const response = await addTemplateDeployQueue({
      services: deployServices,
      serverDetails: {
        id: serverId,
      },
      project,
      tenantDetails: { slug: tenant.slug },
      showEnvironmentVariableLogs: false,
    })

    if (response.id) {
      sendEvent({
        pub,
        message: `Triggered backup tools installation`,
        serverId,
      })

      return {
        installation: false,
        message: `Triggered backup tools installation`,
      }
    }
  } else {
    return {
      installation: true,
      message: `Backup tools already installed!`,
    }
  }
}

export const serverBackupAction = protectedClient
  .metadata({
    actionName: 'serverBackupAction',
  })
  .inputSchema(dokkuBackupSchema)
  .action(async ({ ctx, clientInput }) => {
    const { payload } = ctx
    const { serverId } = clientInput

    const response = await serverBackupMethod({ payload, serverId })
    return response
  })

export const serverBackupAdminAction = adminClient
  .metadata({
    actionName: 'serverBackupAdminAction',
  })
  .inputSchema(dokkuBackupSchema)
  .action(async ({ ctx, clientInput }) => {
    const { payload } = ctx
    const { serverId } = clientInput

    const response = await serverBackupMethod({ payload, serverId })
    return response
  })
