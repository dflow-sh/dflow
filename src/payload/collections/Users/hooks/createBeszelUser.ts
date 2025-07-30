import { CollectionAfterChangeHook } from 'payload'

import { BeszelClient } from '@/lib/beszel/client/BeszelClient'
import { TypedBeszelHelpers } from '@/lib/beszel/client/typedHelpers'
import { User } from '@/payload-types'

export const createBeszelUser: CollectionAfterChangeHook<User> = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc

  try {
    const monitoringUrl = 'https://monitoring.up.dflow.sh' // or process.env.BESZEL_MONITORING_URL
    const superuserEmail = 'dev@resonateaes.com' // process.env.BESZEL_SUPERUSER_EMAIL!
    const superuserPassword = 'ContentQL@123' // process.env.BESZEL_SUPERUSER_PASSWORD!

    if (!monitoringUrl || !superuserEmail || !superuserPassword) {
      console.warn(
        'Beszel credentials not configured, skipping beszel user creation',
      )
      return doc
    }

    // Create client with guaranteed superuser authentication
    const client = await BeszelClient.createWithSuperuserAuth(
      monitoringUrl,
      superuserEmail,
      superuserPassword,
    )
    const helpers = new TypedBeszelHelpers(client)

    const data = {
      email: doc.email,
      password: doc.password || 'tempPassword123!',
      passwordConfirm: doc.password || 'tempPassword123!',
      emailVisibility: true,
      verified: true,
      username: doc.username || doc.email.split('@')[0],
      role: 'user',
      name: doc.username || doc.email.split('@')[0],
    }

    console.log({ data })

    const res = await helpers.createUser(data)

    console.log({ res })

    console.log(`Created beszel user for: ${doc.email}`)
  } catch (error) {
    console.error('Failed to create beszel user:', error)
  }

  return doc
}
