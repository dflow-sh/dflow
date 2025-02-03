import configPromise from '@payload-config'
import { createSafeActionClient } from 'next-safe-action'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import { z } from 'zod'

const payload = await getPayload({
  config: configPromise,
})

export const publicClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string({ message: 'actionName is required!' }),
    })
  },
  // Can also be an async function.
  handleServerError(error) {
    // Log to console.
    console.error('Action error:', error.message)
    // Returning the error message instead of throwing it
    return error.message
  },
})

export const protectedClient = publicClient.use(async ({ next, ctx }) => {
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    throw new Error('User not authenticated')
  }

  return next({
    ctx: {
      ...ctx,
      user,
    },
  })
})
