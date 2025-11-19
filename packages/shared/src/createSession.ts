import { cookies } from 'next/headers'
import {
  BasePayload,
  getCookieExpiration,
  getFieldsToSign,
  jwtSign,
} from 'payload'

import { User } from '@/payload-types'

export type UserWithCollection = User & { collection: 'users' }

export const createSession = async ({
  user,
  payload,
}: {
  user: User
  payload: BasePayload
}) => {
  const cookieStore = await cookies()

  const tenants = user.tenants ?? []
  const userWithCollection: UserWithCollection = {
    ...user,
    tenants: tenants.map(({ id, role, tenant }) => ({
      id,
      tenant: typeof tenant === 'object' ? tenant.id : tenant,
      role: typeof role === 'object' ? role.id : role,
    })),
    collection: 'users',
  }

  const collectionConfig =
    payload.collections[userWithCollection.collection].config

  if (!collectionConfig.auth) {
    throw new Error('Collection is not used for authentication')
  }

  const secret = payload.secret
  const fieldsToSign = getFieldsToSign({
    collectionConfig,
    email: userWithCollection.email,
    user: userWithCollection,
  })

  const { token } = await jwtSign({
    fieldsToSign,
    secret,
    tokenExpiration: collectionConfig.auth.tokenExpiration,
  })

  const name = `${payload.config.cookiePrefix}-token`

  const expires = getCookieExpiration({
    seconds: collectionConfig.auth.tokenExpiration,
  })

  cookieStore.set({
    name,
    value: token,
    expires,
    httpOnly: true,
    domain: collectionConfig.auth.cookies.domain ?? undefined,
    secure: collectionConfig.auth.cookies.secure,
  })
}
