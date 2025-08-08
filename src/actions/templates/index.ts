'use server'

import axios from 'axios'
import { revalidatePath } from 'next/cache'

import { DFLOW_CONFIG, TEMPLATE_EXPR } from '@/lib/constants'
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
  .schema(createTemplateSchema)
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
  .schema(DeleteTemplateSchema)
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

    if (response.isPublished) {
      await axios.delete(
        `${DFLOW_CONFIG.URL}/api/templates/${response.publishedTemplateId}`,
        {
          headers: {
            Authorization: `${DFLOW_CONFIG.AUTH_SLUG} API-Key ${token}`,
          },
          timeout: 10000,
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
  .schema(getPersonalTemplateByIdSchema)
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
  .schema(updateTemplateSchema)
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
  .schema(getAllTemplatesSchema)
  .action(async ({ clientInput }) => {
    const { type } = clientInput

    if (type === 'official') {
      const res = await fetch(
        'https://dflow.sh/api/templates?where[type][equals]=official',
      )

      if (!res.ok) {
        throw new Error('Failed to fetch official templates')
      }

      const data = await res.json()
      return (data.docs ?? []) as Template[]
    }

    if (type === 'community') {
      const res = await fetch(
        'https://dflow.sh/api/templates?where[type][equals]=community',
      )

      if (!res.ok) {
        throw new Error('Failed to fetch official templates')
      }

      const data = await res.json()
      return (data.docs ?? []) as Template[]
    }
  })

export const getPersonalTemplatesAction = protectedClient
  .metadata({ actionName: 'getPersonalTemplatesAction' })
  .schema(getAllTemplatesSchema)
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
  .schema(getTemplateByIdSchema)
  .action(async ({ clientInput }) => {
    const { templateId } = clientInput

    const res = await fetch(`https://dflow.sh/api/templates/${templateId}`)

    if (!res.ok) {
      throw new Error('Failed to fetch template details')
    }

    const templateDetails = await res.json()
    return templateDetails as Omit<Template, 'tenant'>
  })

export const publishTemplateAction = protectedClient
  .metadata({
    actionName: 'publishTemplateAction',
  })
  .schema(publicTemplateSchema)
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
    const response = await axios.post(
      `${DFLOW_CONFIG.URL}/api/templates`,
      {
        name: template.name,
        description: template.description,
        imageUrl: template.imageUrl,
        services: template.services,
      },
      {
        headers: {
          Authorization: `${DFLOW_CONFIG.AUTH_SLUG} API-Key ${token}`,
        },
        timeout: 10000,
      },
    )
    if (response.data.doc) {
      try {
        await payload.update({
          collection: 'templates',
          id: templateId,
          data: {
            isPublished: true,
            publishedTemplateId: response.data.doc.id,
          },
        })
      } catch (err) {
        await axios.delete(
          `${DFLOW_CONFIG.URL}/api/templates/${response.data.doc.id}`,
          {
            headers: {
              Authorization: `${DFLOW_CONFIG.AUTH_SLUG} API-Key ${token}`,
            },
            timeout: 10000,
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
  .schema(publicTemplateSchema)
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
    if (templateData) {
      await axios.delete(
        `${DFLOW_CONFIG.URL}/api/templates/${template.publishedTemplateId}`,
        {
          headers: {
            Authorization: `${DFLOW_CONFIG.AUTH_SLUG} API-Key ${token}`,
          },
          timeout: 10000,
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
  .schema(publicTemplateSchema)
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

    await axios.patch(
      `${DFLOW_CONFIG.URL}/api/templates/${template.publishedTemplateId}`,
      {
        name: template.name,
        description: template.description,
        imageUrl: template.imageUrl,
        services: template.services,
      },
      {
        headers: {
          Authorization: `${DFLOW_CONFIG.AUTH_SLUG} API-Key ${token}`,
        },
        timeout: 10000,
      },
    )

    revalidatePath(`/${tenant.slug}/templates`)
    return { success: true }
  })

export const templateDeployAction = protectedClient
  .metadata({
    actionName: 'templateDeployAction',
  })
  .schema(deployTemplateWithProjectCreateSchema)
  .action(async ({ clientInput, ctx }) => {
    const {
      userTenant: { tenant },
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
          tenant,
        },
        depth: 10,
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

    // Step 1: update service names & reference variables name to unique
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
