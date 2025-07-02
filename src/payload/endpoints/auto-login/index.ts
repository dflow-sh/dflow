import { env } from 'env'
import jwt from 'jsonwebtoken'
import { APIError, PayloadHandler, PayloadRequest } from 'payload'

import { createSession } from '@/lib/createSession'

export const autoLogin: PayloadHandler = async (req: PayloadRequest) => {
  const { createRedisClient } = await import('@/lib/redis')

  const { payload, searchParams } = req
  const token = searchParams.get('token') ?? ''

  // if token is not provided, throwing an error
  if (!token) {
    throw new APIError('Forbidden', 403)
  }

  // verifying JWT token
  const decodedToken = jwt.verify(token, env.PAYLOAD_SECRET, {
    algorithms: ['HS256'],
  })

  if (!decodedToken || typeof decodedToken !== 'object') {
    throw new APIError('Invalid token', 401)
  }

  // Check if the token has expired
  if (
    typeof decodedToken.exp !== 'number' ||
    decodedToken.exp < Date.now() / 1000
  ) {
    throw new APIError('Forbidden', 403)
  }

  // Extracting user email and code from the decoded token
  const userEmail = decodedToken?.email
  const code = decodedToken?.code
  const redirectUrl = decodedToken?.redirectUrl

  // querying the user by email
  const { docs: usersList } = await payload.find({
    collection: 'users',
    req,
    where: {
      email: {
        equals: userEmail,
      },
    },
  })

  if (usersList.length === 0) {
    throw new APIError('User not found', 404)
  }

  const user = usersList[0]
  const redisClient = createRedisClient()

  // Check if the code matches the one stored in Redis
  const storedCode = await redisClient.get(`auto-login-code:${code}`)

  // If the stored code matches the provided code, throw an error
  // This prevents reusing the same code for auto-login
  if (storedCode === code) {
    throw new APIError('Forbidden', 403)
  }

  await createSession({ user, payload })

  // Store the code in Redis with a TTL of 5 minutes to prevent reuse
  await redisClient.set(`auto-login-code:${code}`, code, 'EX', 60 * 5)

  const finalRedirect = redirectUrl
    ? `/${user?.username}${redirectUrl.startsWith('/') ? redirectUrl : `/${redirectUrl}`}`
    : `/${user?.username}/dashboard`

  return Response.redirect(new URL(finalRedirect, env.NEXT_PUBLIC_WEBSITE_URL))
}
