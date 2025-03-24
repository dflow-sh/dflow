import { APIError, PayloadHandler } from 'payload'

import { databaseUpdateSchema } from './validator'

export const databaseUpdate: PayloadHandler = async ({
  headers,
  payload,
  json,
}) => {
  const auth = await payload.auth({ headers })

  // Throwing 401 if now user is present
  if (!auth.user) {
    throw new APIError('Unauthenticated', 401)
  }

  const data = json ? await json() : {}

  // Doing zod validation
  const { data: validatedData, success } = databaseUpdateSchema.safeParse(data)

  if (success) {
    switch (validatedData.type) {
      // Updating the database details after database creation
      case 'database.update':
        const { serviceId: dbServiceId, ...databaseDetails } =
          validatedData.data

        const databaseUpdateResponse = await payload.update({
          collection: 'services',
          id: dbServiceId,
          data: {
            databaseDetails,
          },
        })

        return Response.json({
          data: databaseUpdateResponse,
        })

      // Updating the plugins details of a server
      case 'plugin.update':
        const { serverId, plugins } = validatedData.data

        const pluginUpdateResponse = await payload.update({
          collection: 'servers',
          id: serverId,
          data: {
            plugins,
          },
        })

        return Response.json({
          data: pluginUpdateResponse,
        })

      case 'domain.update':
        const { serviceId: domainServiceId, domain } = validatedData.data
        const { operation } = domain

        // Fetching all domains of particular domain
        const { domains: servicePreviousDomains } = await payload.findByID({
          id: domainServiceId,
          collection: 'services',
        })

        let updatedDomains = servicePreviousDomains ?? []

        if (operation === 'remove') {
          // In remove case removing that particular domain
          updatedDomains = updatedDomains.filter(
            domainDetails => domainDetails.domain !== domain.domain,
          )
        } else if (operation === 'set') {
          updatedDomains = [
            {
              domain: domain.domain,
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
              domain: domain.domain,
              default: false,
              autoRegenerateSSL: domain.autoRegenerateSSL,
              certificateType: domain.certificateType,
            },
          ]
        }

        const updatedServiceDomainResponse = await payload.update({
          id: domainServiceId,
          data: {
            domains: updatedDomains,
          },
          collection: 'services',
          depth: 10,
        })

        return Response.json({
          data: updatedServiceDomainResponse,
        })

      case 'deployment.update':
        const { deployment } = validatedData.data

        const deploymentResponse = await payload.update({
          collection: 'deployments',
          data: {
            status: deployment.status,
            logs: deployment.logs,
          },
          id: deployment.id,
        })

        return Response.json({
          data: deploymentResponse,
        })
    }
  }

  return Response.json({
    message: 'event not found!',
  })
}
