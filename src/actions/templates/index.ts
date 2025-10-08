'use server'

import { revalidatePath } from 'next/cache'

import { DFLOW_CONFIG, TEMPLATE_EXPR } from '@/lib/constants'
import { dFlowRestSdk } from '@/lib/restSDK/utils'
import { protectedClient, publicClient } from '@/lib/safe-action'
import { generateRandomString } from '@/lib/utils'
import { Project, Server, Service, Template } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'
import { addTemplateDeployQueue } from '@/queues/template/deploy'

import {
  DeleteTemplateSchema,
  createTemplateSchema,
  deployTemplateWithProjectCreateSchema,
  getAllTemplatesSchema,
  getPersonalTemplateByIdSchema,
  getTemplateByIdSchema,
  publicTemplateSchema,
  updateTemplateSchema,
} from './validator'

// This function specify the variable-type
function classifyVariableType(value: string) {
  const matches = [...value.matchAll(TEMPLATE_EXPR)]

  if (matches.length === 0) return 'static'
  if (matches.length > 1 || !value.trim().startsWith('{{')) return 'combo'

  const expr = matches[0][1].trim()

  // function call like secret(...)
  if (/^secret\(\s*\d+,\s*['"][^'"]+['"]\s*\)$/.test(expr)) return 'function'

  // reference var: only dot notation (service.MONGO_URI)
  if (/^[a-zA-Z_][\w-]*\.[a-zA-Z_][\w]*$/.test(expr)) return 'reference'

  return 'unknown'
}

// extracts reference variables from combination variables ex: postgres://{{ database.username }}:{{ database.password }} -> [{{ database.username }}, {{ database.password }}]
function extractTemplateRefs(str: string) {
  const matches = str.match(/\{\{\s*[^}]+\s*\}\}/g)
  return matches ?? []
}

type PublicTemplate = Omit<
  Template,
  'tenant' | 'isPublished' | 'publishedTemplateId'
> & {
  type: 'community' | 'official'
}

export const createTemplateAction = protectedClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'createTemplateAction',
  })
  .inputSchema(createTemplateSchema)
  .action(async ({ clientInput, ctx }) => {
    const { userTenant, payload } = ctx
    const { name, description, services, imageUrl } = clientInput

    const response = await payload.create({
      collection: 'templates',
      data: {
        name,
        description,
        services: services as Template['services'],
        imageUrl,
        tenant: userTenant.tenant,
      },
    })
    return response
  })

export const deleteTemplateAction = protectedClient
  .metadata({
    // This action name can be used for sentry tracking
    actionName: 'deleteTemplateAction',
  })
  .inputSchema(DeleteTemplateSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id, accountId } = clientInput
    const {
      userTenant: { tenant },
      payload,
    } = ctx
    const { docs: dFlowAccounts } = await payload.find({
      collection: 'cloudProviderAccounts',
      pagination: false,
      where: {
        and: [
          { id: { equals: accountId } },
          { type: { equals: 'dFlow' } },
          { 'tenant.slug': { equals: tenant?.slug } },
        ],
      },
    })

    if (!dFlowAccounts?.length) {
      throw new Error('No dFlow account found with the specified ID')
    }

    const dFlowAccount = dFlowAccounts[0]
    const token = dFlowAccount.dFlowDetails?.accessToken

    if (!token) {
      throw new Error('Invalid dFlow account: No access token found')
    }
    const response = await payload.update({
      collection: 'templates',
      id,
      data: {
        deletedAt: new Date().toISOString(),
      },
    })

    if (response.isPublished && response.publishedTemplateId) {
      await dFlowRestSdk.delete(
        {
          collection: 'templates',
          id: response.publishedTemplateId,
        },
        {
          headers: {
            Authorization: `${DFLOW_CONFIG.AUTH_SLUG} API-Key ${token}`,
          },
        },
      )
    }
    if (response) {
      revalidatePath(`${tenant.slug}/templates`)
      return { deleted: true }
    }
  })

export const getTemplateByIdAction = protectedClient
  .metadata({ actionName: 'getTemplateByIdAction' })
  .inputSchema(getPersonalTemplateByIdSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id } = clientInput
    const { userTenant, payload } = ctx

    const response = await payload.find({
      collection: 'templates',
      depth: 3,
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

export const updateTemplateAction = protectedClient
  .metadata({
    actionName: 'updateTemplateAction',
  })
  .inputSchema(updateTemplateSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id, name, services, description, imageUrl } = clientInput
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
        imageUrl,
        services,
      },
    })
    return response
  })

export const getAllOfficialTemplatesAction = publicClient
  .metadata({ actionName: 'getAllOfficialTemplatesAction' })
  .inputSchema(getAllTemplatesSchema)
  .action(async ({ clientInput }) => {
    const { type } = clientInput

    const res = await dFlowRestSdk.find({
      collection: 'templates',
      limit: 1000,
      where: {
        type: {
          equals: type,
        },
      },
    })
    return res.docs
  })

export const getPersonalTemplatesAction = protectedClient
  .metadata({ actionName: 'getPersonalTemplatesAction' })
  .inputSchema(getAllTemplatesSchema)
  .action(async ({ ctx }) => {
    const {
      payload,
      userTenant: { tenant },
    } = ctx
    const { docs: templates } = await payload.find({
      collection: 'templates',
      pagination: false,
      sort: '-isPublished',
      where: {
        'tenant.slug': {
          equals: tenant.slug,
        },
      },
    })
    return templates
  })

export const getOfficialTemplateByIdAction = publicClient
  .metadata({
    actionName: 'getOfficialTemplateByIdAction',
  })
  .inputSchema(getTemplateByIdSchema)
  .action(async ({ clientInput }) => {
    const { templateId } = clientInput

    const templateDetails = await dFlowRestSdk.findByID({
      collection: 'templates',
      id: templateId,
    })

    return templateDetails
  })

export const publishTemplateAction = protectedClient
  .metadata({
    actionName: 'publishTemplateAction',
  })
  .inputSchema(publicTemplateSchema)
  .action(async ({ ctx, clientInput }) => {
    const {
      userTenant: { tenant },
      payload,
    } = ctx

    const { accountId, templateId } = clientInput

    const { docs: dFlowAccounts } = await payload.find({
      collection: 'cloudProviderAccounts',
      pagination: false,
      where: {
        and: [
          { id: { equals: accountId } },
          { type: { equals: 'dFlow' } },
          { 'tenant.slug': { equals: tenant?.slug } },
        ],
      },
    })

    if (!dFlowAccounts?.length) {
      throw new Error('No dFlow account found with the specified ID')
    }

    const dFlowAccount = dFlowAccounts[0]
    const token = dFlowAccount.dFlowDetails?.accessToken

    if (!token) {
      throw new Error('Invalid dFlow account: No access token found')
    }

    const { docs: templates } = await payload.find({
      collection: 'templates',
      where: {
        and: [
          { id: { equals: templateId } },
          { 'tenant.slug': { equals: tenant?.slug } },
        ],
      },
    })

    const template = templates.at(0)
    if (!template) {
      throw new Error('Invalid templateId: No access template.')
    }

    const response = await dFlowRestSdk.create(
      {
        collection: 'templates',
        data: {
          name: template.name,
          description: template.description,
          imageUrl: template.imageUrl,
          services: template.services,
        },
      },
      {
        headers: {
          Authorization: `${DFLOW_CONFIG.AUTH_SLUG} API-Key ${token}`,
        },
      },
    )

    if (response) {
      try {
        await payload.update({
          collection: 'templates',
          id: templateId,
          data: {
            isPublished: true,
            publishedTemplateId: response.id,
          },
        })
      } catch (err) {
        await dFlowRestSdk.delete(
          {
            collection: 'templates',
            id: response.id,
          },
          {
            headers: {
              Authorization: `${DFLOW_CONFIG.AUTH_SLUG} API-Key ${token}`,
            },
          },
        )
        throw new Error('Failed to update template')
      }
    }
    revalidatePath(`/${tenant.slug}/templates`)
    return { success: true }
  })

export const unPublishTemplateAction = protectedClient
  .metadata({
    actionName: 'unPublishTemplateAction',
  })
  .inputSchema(publicTemplateSchema)
  .action(async ({ ctx, clientInput }) => {
    const {
      userTenant: { tenant },
      payload,
    } = ctx

    const { accountId, templateId } = clientInput

    const { docs: dFlowAccounts } = await payload.find({
      collection: 'cloudProviderAccounts',
      pagination: false,
      where: {
        and: [
          { id: { equals: accountId } },
          { type: { equals: 'dFlow' } },
          { 'tenant.slug': { equals: tenant?.slug } },
        ],
      },
    })

    if (!dFlowAccounts?.length) {
      throw new Error('No dFlow account found with the specified ID')
    }

    const dFlowAccount = dFlowAccounts[0]
    const token = dFlowAccount.dFlowDetails?.accessToken

    if (!token) {
      throw new Error('Invalid dFlow account: No access token found')
    }
    const { docs: templates } = await payload.find({
      collection: 'templates',
      where: {
        and: [
          { id: { equals: templateId } },
          { 'tenant.slug': { equals: tenant?.slug } },
        ],
      },
    })
    const template = templates.at(0)
    if (!template) {
      throw new Error('Invalid templateId: No access template.')
    }
    const templateData = await payload.update({
      collection: 'templates',
      id: templateId,
      data: {
        isPublished: false,
        publishedTemplateId: '',
      },
    })
    if (templateData && template.publishedTemplateId) {
      await dFlowRestSdk.delete(
        {
          collection: 'templates',
          id: template.publishedTemplateId,
        },
        {
          headers: {
            Authorization: `${DFLOW_CONFIG.AUTH_SLUG} API-Key ${token}`,
          },
        },
      )
    }
    revalidatePath(`/${tenant.slug}/templates`)
    return { success: true }
  })

export const syncWithPublicTemplateAction = protectedClient
  .metadata({
    actionName: 'syncWithPublicTemplateAction',
  })
  .inputSchema(publicTemplateSchema)
  .action(async ({ ctx, clientInput }) => {
    const {
      userTenant: { tenant },
      payload,
    } = ctx

    const { accountId, templateId } = clientInput

    const { docs: dFlowAccounts } = await payload.find({
      collection: 'cloudProviderAccounts',
      pagination: false,
      where: {
        and: [
          { id: { equals: accountId } },
          { type: { equals: 'dFlow' } },
          { 'tenant.slug': { equals: tenant?.slug } },
        ],
      },
    })

    if (!dFlowAccounts?.length) {
      throw new Error('No dFlow account found with the specified ID')
    }

    const dFlowAccount = dFlowAccounts[0]
    const token = dFlowAccount.dFlowDetails?.accessToken

    if (!token) {
      throw new Error('Invalid dFlow account: No access token found')
    }
    const { docs: templates } = await payload.find({
      collection: 'templates',
      where: {
        and: [
          { id: { equals: templateId } },
          { 'tenant.slug': { equals: tenant?.slug } },
        ],
      },
    })
    const template = templates.at(0)
    if (!template) {
      throw new Error('Invalid templateId: No access to template.')
    }

    try {
      await dFlowRestSdk.update(
        {
          collection: 'templates',
          id: template.publishedTemplateId!,
          data: {
            name: template.name,
            description: template.description,
            imageUrl: template.imageUrl,
            services: template.services,
          },
        },
        {
          headers: {
            Authorization: `${DFLOW_CONFIG.AUTH_SLUG} API-Key ${token}`,
          },
        },
      )
      revalidatePath(`/${tenant.slug}/templates`)
      return { success: true }
    } catch (error) {
      console.error('Error syncing with public template:', error)
      throw new Error('Failed to sync with public template')
    }
  })

export const templateDeployAction = protectedClient
  .metadata({
    actionName: 'templateDeployAction',
  })
  .inputSchema(deployTemplateWithProjectCreateSchema)
  .action(async ({ clientInput, ctx }) => {
    const {
      user,
      userTenant: { tenant, role },
      payload,
    } = ctx
    let projectDetails: Project

    const {
      services,
      isCreateNewProject,
      projectDetails: projectData,
      projectId,
    } = clientInput

    if (isCreateNewProject) {
      if (Number(role?.projects?.createLimit) > 0) {
        const { totalDocs } = await payload.count({
          collection: 'projects',
          where: {
            and: [
              {
                tenant: {
                  equals: tenant.id,
                },
              },
              {
                createdBy: {
                  equals: user?.id,
                },
              },
            ],
          },
        })

        if (totalDocs >= Number(role?.projects?.createLimit)) {
          throw new Error(
            `You have reached your project creation limit. Please contact your administrator.`,
          )
        }
      }

      const { version } = (await payload.findByID({
        collection: 'servers',
        id: projectData?.serverId!,
        context: {
          populateServerDetails: true,
        },
      })) as ServerType

      if (!version || version === 'not-installed') {
        throw new Error('Dokku is not installed!')
      }

      const slicedName = projectData?.name?.slice(0, 10) ?? 'project'

      let uniqueName = slicedName

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
                equals: tenant.id,
              },
            },
          ],
        },
      })

      if (duplicateProjects.length > 0) {
        // add a 4-random character generation
        const uniqueSuffix = generateRandomString({ length: 4 })
        uniqueName = `${slicedName}-${uniqueSuffix}`
      }

      const response = await payload.create({
        collection: 'projects',
        data: {
          name: uniqueName,
          description: projectData?.description,
          server: projectData?.serverId!,
          createdBy: user.id,
          tenant,
        },
      })

      projectDetails = response
    } else {
      const project = await payload.findByID({
        collection: 'projects',
        id: projectId!,
        joins: {
          services: {
            limit: 1000,
          },
        },
      })
      projectDetails = project
    }

    if (!services.length) {
      throw new Error('Please attach services to deploy the template')
    }

    const serviceNames = {} as Record<string, string>

    const projectServices = projectDetails?.services?.docs ?? []

    services.forEach(service => {
      const uniqueSuffix = generateRandomString({ length: 4 })

      let baseServiceName = service.name

      // Special case for database services: slice to 10 characters
      if (service?.type === 'database') {
        baseServiceName = service.name.slice(0, 10)
      }

      const baseName = `${projectDetails.name}-${baseServiceName}`

      const nameExists = projectServices?.some(
        serviceDetails =>
          typeof serviceDetails === 'object' &&
          serviceDetails?.name === baseName,
      )

      const finalName = nameExists ? `${baseName}-${uniqueSuffix}` : baseName

      serviceNames[service.name] = finalName
    })

    // Step 1: update reference variables, volume paths to unique service names
    const updatedServices = services.map(service => {
      const serviceName = serviceNames[`${service?.name}`]

      let variables = [] as Array<{
        key: string
        value: string
        id?: string | null
      }>

      service?.variables?.forEach(variable => {
        // check for environment variables type
        const type = classifyVariableType(variable.value)

        if (type === 'combo') {
          // for combination variables extract and replace variables
          const referenceVariablesList = extractTemplateRefs(variable.value)
          let populatedValue = variable.value

          for (const variable of referenceVariablesList) {
            const extractedVariable = variable
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

                populatedValue = populatedValue.replace(
                  `{{ ${serviceName}.${variableName} }}`,
                  `{{ ${newServiceName}.${variableName} }}`,
                )
              }
            }
          }

          variables.push({
            ...variable,
            value: populatedValue,
          })

          return
        } else if (type === 'reference') {
          // replace directly the values
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

                return
              }
            }
          }
        }

        variables?.push(variable)
      })

      const volumes = service?.volumes
        ? service.volumes?.map(volume => {
            if (volume.hostPath.startsWith('/var/lib/dokku/data/storage/')) {
              const newHostPath = volume.hostPath.replace(
                service.name,
                serviceName,
              )

              return { ...volume, hostPath: newHostPath }
            }

            return volume
          })
        : []

      return { ...service, name: serviceName, variables, volumes }
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
          depth: 3,
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
            volumes: service?.volumes,
            tenant,
          },
          depth: 3,
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
              volumes: service?.volumes,
              tenant,
            },
            depth: 3,
          })

          createdServices.push(serviceResponse)
        }
      }
    }

    const lightweightServices = createdServices.map(
      ({ project, ...rest }) => rest,
    )

    // Step 3: trigger template-deploy queue with services
    const response = await addTemplateDeployQueue({
      services: lightweightServices,
      serverDetails: {
        id: (projectDetails.server as Server).id,
      },
      project: projectDetails,
      tenantDetails: {
        slug: tenant.slug,
      },
    })

    if (response.id) {
      revalidatePath(`/${tenant.slug}/dashboard/project/${projectDetails.id}`)
      return {
        success: true,
        projectId: projectDetails.id,
        tenantSlug: tenant.slug,
      }
    }
  })
