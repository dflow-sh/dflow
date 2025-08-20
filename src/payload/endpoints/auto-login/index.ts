import cuid from 'cuid'
import { env } from 'env'
import jwt from 'jsonwebtoken'
import { APIError, PayloadHandler, PayloadRequest } from 'payload'

import { createSession } from '@/lib/createSession'

export const autoLogin: PayloadHandler = async (req: PayloadRequest) => {
  const { createRedisClient } = await import('@/lib/redis')
  const { payload, searchParams } = req
  const token = searchParams.get('token') ?? ''

  // If token is not provided, throw an error
  if (!token) {
    throw new APIError('Forbidden', 403)
  }

  try {
    // Verify JWT token
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
      throw new APIError('Token expired', 403)
    }

    // Extract user email and code from the decoded token
    const userEmail = decodedToken?.email as string
    const code = decodedToken?.code as string
    const redirectUrl = decodedToken?.redirectUrl as string

    if (!userEmail || !code) {
      throw new APIError('Invalid token payload', 401)
    }

    // Check Redis for one-time code usage
    const redisClient = createRedisClient()
    const storedCode = await redisClient.get(`auto-login-code:${code}`)

    // If the stored code matches the provided code, throw an error
    // This prevents reusing the same code for auto-login
    if (storedCode === code) {
      throw new APIError('Token already used', 403)
    }

    // Query the user by email
    const { docs: usersList } = await payload.find({
      collection: 'users',
      req,
      where: {
        email: {
          equals: userEmail,
        },
      },
    })

    let user

    if (usersList.length === 0) {
      // Auto-create user if not found (Magic Link auto-onboarding)
      const newUser = await payload.create({
        collection: 'users',
        req,
        data: {
          email: userEmail,
          username: userEmail.split('@')[0] || cuid().slice(0, 8),
          password: cuid().slice(0, 12), // Random password
          role: ['user'],
        },
      })

      // Extract single user from create result (could be User | User[])
      user = Array.isArray(newUser) ? newUser[0] : newUser
    } else {
      // Extract the first user from docs array
      user = usersList[0]
    }

    // Create session with properly typed user
    await createSession({ user, payload })

    // Store the code in Redis with a TTL of 5 minutes to prevent reuse
    await redisClient.set(`auto-login-code:${code}`, code, 'EX', 60 * 5)

    // Compute final redirect URL with proper user typing
    const finalRedirect = redirectUrl
      ? `/${user.username}${redirectUrl.startsWith('/') ? redirectUrl : `/${redirectUrl}`}`
      : `/${user.username}/dashboard`

    // Redirect user to dashboard or intended page
    return Response.redirect(
      new URL(finalRedirect, env.NEXT_PUBLIC_WEBSITE_URL),
    )
  } catch (error: unknown) {
    console.error('Auto-login error:', error)

    // Proper error type handling with type guards
    if (error instanceof APIError) {
      throw error
    }

    if (error instanceof Error) {
      if (error.name === 'JsonWebTokenError') {
        throw new APIError('Invalid token', 401)
      }

      if (error.name === 'TokenExpiredError') {
        throw new APIError('Token expired', 403)
      }

      console.error('Unexpected error:', error.message)
    }

    throw new APIError('Authentication failed', 500)
  }
}
