import { addTemplateDeployQueue } from '../template/deploy'
import configPromise from '@payload-config'
import { Job } from 'bullmq'
import { getPayload } from 'payload'

import { getQueue, getWorker } from '@/lib/bullmq'
import { jobOptions, pub, queueConnection } from '@/lib/redis'
import { sendActionEvent, sendEvent } from '@/lib/sendEvent'
import { generateRandomString } from '@/lib/utils'
import { Project, Server, Service, Template } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

interface QueueArgs {
  serverDetails: {
    id: string
  }
  tenant: {
    slug: string
    id: string
  }
}

export const addInstallMonitoringQueue = async (data: QueueArgs) => {
  const QUEUE_NAME = `server-${data.serverDetails.id}-install-monitoring`

  const installMonitoringQueue = getQueue({
    name: QUEUE_NAME,
    connection: queueConnection,
  })

  const worker = getWorker<QueueArgs>({
    name: QUEUE_NAME,
    processor: async job => {
      const { serverDetails, tenant } = job.data
      const payload = await getPayload({ config: configPromise })

      try {
        sendEvent({
          pub,
          message: `🔧 Starting monitoring tools installation...`,
          serverId: serverDetails.id,
        })

        let projectDetails: Project

        // Check if Dokku is installed
        const { version } = (await payload.findByID({
          collection: 'servers',
          id: serverDetails.id,
          context: {
            populateServerDetails: true,
          },
        })) as ServerType

        if (!version || version === 'not-installed') {
          throw new Error('Dokku is not installed!')
        }

        // Create project
        const slicedName = 'monitoring'
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
          const uniqueSuffix = generateRandomString({ length: 4 })
          uniqueName = `${slicedName}-${uniqueSuffix}`
        }

        const response = await payload.create({
          collection: 'projects',
          data: {
            name: uniqueName,
            description: 'Monitoring tools for server observability',
            server: serverDetails.id,
            tenant: tenant.id,
          },
          depth: 10,
        })

        projectDetails = response

        // TODO: Add the monitoring services here
        const res = await fetch(
          'https://dflow.sh/api/templates?where[and][0][name][equals]=Beszel%20Agent&where[and][1][type][equals]=official',
        )

        if (!res.ok) {
          throw new Error('Failed to fetch official templates')
        }

        const data = await res.json()
        const template = (data.docs.at(0) ?? []) as Template

        const services = template.services || []

        console.log({ services })

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

          const finalName = nameExists
            ? `${baseName}-${uniqueSuffix}`
            : baseName
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
                tenant: tenant.id,
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
                tenant: tenant.id,
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
                  tenant: tenant.id,
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
        const deployResponse = await addTemplateDeployQueue({
          services: lightweightServices,
          serverDetails: {
            id: (projectDetails.server as Server).id,
          },
          project: projectDetails,
          tenantDetails: {
            slug: tenant.slug,
          },
        })

        if (deployResponse.id) {
          sendEvent({
            pub,
            message: `✅ Monitoring tools installation initiated successfully`,
            serverId: serverDetails.id,
          })

          sendActionEvent({
            pub,
            action: 'refresh',
            tenantSlug: tenant.slug,
          })
        } else {
          throw new Error('Failed to trigger template deployment')
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        throw new Error(`❌ Failed to install monitoring tools: ${message}`)
      }
    },

    connection: queueConnection,
  })

  worker.on('failed', async (job: Job<QueueArgs> | undefined, err) => {
    if (job?.data) {
      sendEvent({
        pub,
        message: err.message,
        serverId: job.data.serverDetails.id,
      })
    }
  })

  const id = `install-monitoring:${new Date().getTime()}`

  return await installMonitoringQueue.add(id, data, {
    jobId: id,
    ...jobOptions,
  })
}
