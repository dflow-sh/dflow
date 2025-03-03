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
        const { serviceId, ...databaseDetails } = validatedData.data

        const databaseUpdateResponse = await payload.update({
          collection: 'services',
          id: serviceId,
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

      default:
        break
    }
  }

  return Response.json({
    message: 'Hello world!',
  })
}
