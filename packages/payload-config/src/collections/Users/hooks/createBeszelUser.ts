import { env } from 'env'
import { CollectionAfterChangeHook } from 'payload'

import { BeszelClient } from '@/lib/beszel/client/BeszelClient'
import { TypedBeszelHelpers } from '@/lib/beszel/client/typedHelpers'
import { generateDeterministicPassword } from '@/lib/utils/generateDeterministicPassword'
import { User } from '@/payload-types'

export const createBeszelUser: CollectionAfterChangeHook<User> = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc

  try {
    const monitoringUrl = env.BESZEL_MONITORING_URL
    const superuserEmail = env.BESZEL_SUPERUSER_EMAIL
    const superuserPassword = env.BESZEL_SUPERUSER_PASSWORD

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

    // TODO: Generate the password using email and token
    const generatedPassword = generateDeterministicPassword(
      doc.email,
      env.PAYLOAD_SECRET,
    )

    const data = {
      email: doc.email,
      password: generatedPassword,
      passwordConfirm: generatedPassword,
      emailVisibility: true,
      verified: true,
      username: doc.username || doc.email.split('@')[0],
      role: 'user',
      name: doc.username || doc.email.split('@')[0],
    }

    const res = await helpers.createUser(data)

    console.log(`Created beszel user for: ${doc.email}`)
  } catch (error) {
    console.error('Failed to create beszel user:', error)
  }

  return doc
}
