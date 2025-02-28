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

        const updateResponse = await payload.update({
          collection: 'services',
          id: serviceId,
          data: {
            databaseDetails,
          },
        })

        break

      default:
        break
    }
  }

  return Response.json({
    message: 'Hello world!',
  })
}
