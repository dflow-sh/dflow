import { env } from 'env'
import {
  PayloadHandler,
  generatePayloadCookie,
  getFieldsToSign,
  headersWithCors,
  jwtSign,
} from 'payload'

export const autoLogin: PayloadHandler = async req => {
  const { payload, t, searchParams } = req

  // TODO: get token from searchParams, and extract userId from it

  let user = await payload.db.findOne<any>({
    collection: 'users',
    req,
    where: {
      id: {
        equals: '681dd95b18402af3dca75fd3', // TODO: replace with extracted userId
      },
    },
  })

  user.collection = 'users'
  user._strategy = 'local-jwt'
  const sanitizeInternalFields = <T extends Record<string, unknown>>(
    incomingDoc: T,
  ): T => {
    // Create a new object to hold the sanitized fields
    const newDoc: Record<string, unknown> = {}

    for (const key in incomingDoc) {
      const val = incomingDoc[key]
      if (key === '_id') {
        newDoc['id'] = val
      } else if (key !== '__v') {
        newDoc[key] = val
      }
    }

    return newDoc as T
  }

  user = sanitizeInternalFields(user)

  const fieldsToSign = getFieldsToSign({
    collectionConfig: req.payload.collections['users'].config,
    email: user.email,
    user,
  })

  const { exp, token } = await jwtSign({
    fieldsToSign,
    secret: env.PAYLOAD_SECRET,
    tokenExpiration:
      req.payload.collections['users'].config.auth.tokenExpiration,
  })

  req.user = user

  const cookie = generatePayloadCookie({
    collectionAuthConfig: req.payload.collections['users'].config.auth,
    cookiePrefix: req.payload.config.cookiePrefix,
    token,
  })

  return Response.json(
    {
      message: t('authentication:passed'),
    },
    {
      headers: headersWithCors({
        headers: new Headers({
          'Set-Cookie': cookie,
        }),
        req,
      }),
      status: 200,
    },
  )
}
