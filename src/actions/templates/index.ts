'use server'

import { revalidatePath } from 'next/cache'
import {
  Config,
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from 'unique-names-generator'

import { TEMPLATE_EXPR } from '@/lib/constants'
import { protectedClient } from '@/lib/safe-action'
import { Service, Template } from '@/payload-types'
import { addTemplateDeployQueue } from '@/queues/template/deploy'

import {
  DeleteTemplateSchema,
  createTemplateSchema,
  deployTemplateFromArchitectureSchema,
  deployTemplateSchema,
  getAllTemplatesSchema,
  updateTemplateSchema,
} from './validator'

const handleGenerateName = (): string => {
  const nameConfig: Config = {
    dictionaries: [adjectives, animals, colors],
    separator: '-',
    length: 3,
    style: 'lowerCase',
  }

  return uniqueNamesGenerator(nameConfig)
}

export const createTemplate = protectedClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'createTemplate',
  })
  .schema(createTemplateSchema)
  .action(async ({ clientInput, ctx }) => {
    const { userTenant, payload } = ctx
    const { name, description, services } = clientInput

    const response = await payload.create({
      collection: 'templates',
      data: {
        name,
        description,
        services,
        tenant: userTenant.tenant,
      },
    })
    return response
  })

export const deleteTemplate = protectedClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'deleteTemplate',
  })
  .schema(DeleteTemplateSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id } = clientInput
    const { userTenant, payload } = ctx

    const response = await payload.delete({
      collection: 'templates',
      id,
    })

    if (response) {
      revalidatePath(`${userTenant.tenant.slug}/templates`)
      return { deleted: true }
    }
  })

export const getTemplateById = protectedClient
  .metadata({ actionName: 'getTemplateById' })
  .schema(DeleteTemplateSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id } = clientInput
    const { userTenant, payload } = ctx

    const response = await payload.find({
      collection: 'templates',
      where: {
        and: [
          {
            id: {
              equals: id,
            },
          },
          {
            'tenant.slug': {
              equals: userTenant.tenant.slug,
            },
          },
        ],
      },
    })
    return response?.docs[0]
  })

export const deployTemplateAction = protectedClient
  .metadata({
    actionName: 'deployTemplateAction',
  })
  .schema(deployTemplateSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id, projectId } = clientInput
    const {
      userTenant: { tenant },
      payload,
    } = ctx

    const projectDetails = await payload.findByID({
      collection: 'projects',
      id: projectId,
    })

    const templateDetails = await payload.findByID({
      collection: 'templates',
      id,
    })

    const services = templateDetails?.services ?? []

    if (!services.length) {
      throw new Error('Please attach services to deploy the template')
    }

    const serviceNames = {} as Record<string, string>

    services.forEach(service => {
      const serviceName = handleGenerateName()

      if (service?.name) {
        serviceNames[service?.name] = `${projectDetails.name}-${serviceName}`
      }
    })

    // Step 1: update service names & reference variables name to unique
    const updatedServices = services.map(service => {
      const serviceName = serviceNames[`${service?.name}`]

      let variables = [] as Array<{
        key: string
        value: string
        id?: string | null
      }>

      service?.variables?.forEach(variable => {
        const extractedVariable = variable.value
          .match(TEMPLATE_EXPR)?.[0]
          ?.match(/\{\{\s*(.*?)\s*\}\}/)?.[1]
          ?.trim()

        if (extractedVariable) {
          const refMatch = extractedVariable.match(
            /^([a-zA-Z_][\w-]*)\.([a-zA-Z_][\w]*)$/,
          )

          if (refMatch) {
            const [, serviceName, variableName] = refMatch
            const newServiceName = serviceNames[serviceName]

            if (newServiceName) {
              variables.push({
                ...variable,
                value: `{{ ${newServiceName}.${variableName} }}`,
              })
            } else {
              variables?.push(variable)
            }
          } else {
            variables?.push(variable)
          }
        } else {
          variables?.push(variable)
        }
      })

      return { ...service, name: serviceName, variables }
    })

    let createdServices: Service[] = []

    // Step 2: map through services and create services in database
    for await (const service of updatedServices) {
      const { type, name } = service

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
            tenant,
          },
          depth: 10,
        })

        createdServices.push(serviceResponse)
      } else if (type === 'docker' && service?.dockerDetails) {
        const serviceResponse = await payload.create({
          collection: 'services',
          data: {
            name: `${name}`,
            type,
            dockerDetails: service?.dockerDetails,
            project: projectDetails?.id,
            variables: service?.variables,
            tenant,
          },
          depth: 10,
        })

        createdServices.push(serviceResponse)
      } else if (type === 'app') {
        // todo: handle all git-providers cases
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
              tenant,
            },
            depth: 10,
          })

          createdServices.push(serviceResponse)
        }
      }
    }

    // Step 3: trigger template-deploy queue with services
    const response = await addTemplateDeployQueue({
      services: createdServices,
      serverDetails: {
        id:
          typeof projectDetails?.server === 'object'
            ? projectDetails?.server?.id
            : projectDetails?.server,
      },
      tenantDetails: {
        slug: tenant.slug,
      },
    })

    if (response.id) {
      revalidatePath(`/${tenant.slug}/dashboard/project/${projectDetails.id}`)
      return { success: true }
    }
  })

export const updateTemplate = protectedClient
  .metadata({
    actionName: 'updateTemplate',
  })
  .schema(updateTemplateSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id, name, services, description } = clientInput
    const { payload } = ctx

    const response = await payload.update({
      collection: 'templates',
      where: {
        id: {
          equals: id,
        },
      },
      data: {
        name,
        description,
        services,
      },
    })
    return response
  })

export const getAllTemplatesAction = protectedClient
  .metadata({ actionName: 'getAllTemplatesAction' })
  .schema(getAllTemplatesSchema)
  .action(async ({ ctx, clientInput }) => {
    const { type } = clientInput
    const { userTenant, payload } = ctx

    if (type === 'official') {
      const res = await fetch('https://dflow.sh/api/templates')

      if (!res.ok) {
        throw new Error('Failed to fetch official templates')
      }

      const data = await res.json()
      return (data.docs ?? []) as Template[]
    }

    const { docs } = await payload.find({
      collection: 'templates',
      where: {
        'tenant.slug': {
          equals: userTenant.tenant.slug,
        },
      },
      pagination: false,
    })

    return docs
  })

export const deployTemplateFromArchitectureAction = protectedClient
  .metadata({
    actionName: 'deployTemplateFromArchitectureAction',
  })
  .schema(deployTemplateFromArchitectureSchema)
  .action(async ({ clientInput, ctx }) => {
    const {
      userTenant: { tenant },
      payload,
    } = ctx
    const { projectId, services = [] } = clientInput

    const projectDetails = await payload.findByID({
      collection: 'projects',
      id: projectId,
    })

    if (!services.length) {
      throw new Error('Please attach services to deploy the template')
    }

    const serviceNames = {} as Record<string, string>

    services.forEach(service => {
      if (service?.name) {
        serviceNames[service?.name] = `${projectDetails.name}-${service.name}`
      }
    })

    // Step 1: update service names & reference variables name to unique
    const updatedServices = services.map(service => {
      const serviceName = serviceNames[`${service?.name}`]
      let variables = [] as Array<{
        key: string
        value: string
        id?: string | null
      }>

      // todo: check if variable is of reference type
      // change the service name if exists
      service?.variables?.forEach(variable => {
        const extractedVariable = variable.value
          .match(TEMPLATE_EXPR)?.[0]
          ?.match(/\{\{\s*(.*?)\s*\}\}/)?.[1]
          ?.trim()

        if (extractedVariable) {
          const refMatch = extractedVariable.match(
            /^([a-zA-Z_][\w-]*)\.([a-zA-Z_][\w]*)$/,
          )

          if (refMatch) {
            const [, serviceName, variableName] = refMatch
            const newServiceName = serviceNames[serviceName]

            if (newServiceName) {
              variables.push({
                ...variable,
                value: `{{ ${newServiceName}.${variableName} }}`,
              })
            } else {
              variables?.push(variable)
            }
          } else {
            variables?.push(variable)
          }
        } else {
          variables?.push(variable)
        }
      })

      return { ...service, name: serviceName, variables }
    })

    let createdServices: Service[] = []

    // Step 2: map through services and create services in database
    for await (const service of updatedServices) {
      const { type, name } = service

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
            tenant,
          },
          depth: 10,
        })

        createdServices.push(serviceResponse)
      } else if (type === 'docker' && service?.dockerDetails) {
        const serviceResponse = await payload.create({
          collection: 'services',
          data: {
            name: `${name}`,
            type,
            dockerDetails: service?.dockerDetails,
            project: projectDetails?.id,
            variables: service?.variables,
            tenant,
          },
          depth: 10,
        })

        createdServices.push(serviceResponse)
      } else if (type === 'app') {
        // todo: handle all git-providers cases
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
              tenant,
            },
            depth: 10,
          })

          createdServices.push(serviceResponse)
        }
      }
    }

    // Step 3: trigger template-deploy queue with services
    const response = await addTemplateDeployQueue({
      services: createdServices,
      serverDetails: {
        id:
          typeof projectDetails?.server === 'object'
            ? projectDetails?.server?.id
            : projectDetails?.server,
      },
      tenantDetails: {
        slug: tenant.slug,
      },
    })

    if (response.id) {
      revalidatePath(`/${tenant.slug}/dashboard/project/${projectDetails.id}`)
      return { success: true }
    }
  })
