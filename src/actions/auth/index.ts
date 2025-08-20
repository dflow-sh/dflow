'use server'

import configPromise from '@payload-config'
import cuid from 'cuid'
import { env } from 'env'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { MagicLinkEmail } from '@/emails/MagicLinkEmailTemplate'
import { createSession } from '@/lib/createSession'
import { protectedClient, publicClient, userClient } from '@/lib/safe-action'

import {
  autoLoginSchema,
  forgotPasswordSchema,
  impersonateUserSchema,
  magicLinkSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from './validator'

// No need to handle try/catch that abstraction is taken care by next-safe-actions
export const signInAction = publicClient
  .metadata({
    actionName: 'signInAction',
  })
  .schema(signInSchema)
  .action(async ({ clientInput }) => {
    const payload = await getPayload({
      config: configPromise,
    })

    const { email, password } = clientInput

    const { user, token } = await payload.login({
      collection: 'users',
      data: {
        email,
        password,
      },
    })

    const cookieStore = await cookies()
    cookieStore.set('payload-token', token || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    if (user) {
      // finding user tenants and redirecting user to first tenant, last resort redirecting with there user-name
      const tenants = user?.tenants ?? []
      const tenantSlug =
        typeof tenants?.[0]?.tenant === 'object'
          ? tenants?.[0]?.tenant?.slug
          : ''

      redirect(`/${tenantSlug || user.username}/dashboard`)
    }
  })

export const signUpAction = publicClient
  .metadata({
    actionName: 'signUpAction',
  })
  .schema(signUpSchema)
  .action(async ({ clientInput }) => {
    const payload = await getPayload({
      config: configPromise,
    })

    const { email, password, username } = clientInput

    // Check if username already exists
    const usernameExists = await payload.find({
      collection: 'users',
      where: {
        username: {
          equals: username,
        },
      },
    })

    if (usernameExists.totalDocs > 0) {
      throw new Error('Username already exists')
    }

    const emailExists = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
    })

    if (emailExists.totalDocs > 0) {
      throw new Error('Email already exists')
    }

    const tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: username,
        slug: username,
        subdomain: username,
      },
    })

    const user = await payload.create({
      collection: 'users',
      data: {
        username,
        email,
        password,
        onboarded: false,
      },
    })

    const role = await payload.create({
      collection: 'roles',
      data: {
        name: 'Admin',
        backups: {
          create: true,
          delete: true,
          read: true,
          update: true,
        },
        cloudProviderAccounts: {
          create: true,
          delete: true,
          read: true,
          update: true,
        },
        dockerRegistries: {
          create: true,
          delete: true,
          read: true,
          update: true,
        },
        gitProviders: {
          create: true,
          delete: true,
          read: true,
          update: true,
        },
        projects: {
          create: true,
          delete: true,
          read: true,
          update: true,
        },
        roles: {
          create: true,
          delete: true,
          read: true,
          update: true,
        },
        securityGroups: {
          create: true,
          delete: true,
          read: true,
          update: true,
        },
        servers: {
          create: true,
          delete: true,
          read: true,
          update: true,
        },
        services: {
          create: true,
          delete: true,
          read: true,
          update: true,
        },
        sshKeys: {
          create: true,
          delete: true,
          read: true,
          update: true,
        },
        team: {
          create: true,
          delete: true,
          read: true,
          update: true,
        },
        templates: {
          create: true,
          delete: true,
          read: true,
          update: true,
        },
        type: 'management',
        description:
          'Full access to manage projects, services, and all other features.',
        tags: ['Admin', 'Full Access'],
        tenant: tenant,
        createdUser: user,
      },
    })

    const updatedUser = await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        tenants: [{ tenant: tenant, role }],
      },
    })

    return updatedUser
  })

// export const verifyEmailAction = publicClient
//   .metadata({
//     actionName: 'verifyEmailAction',
//   })
//   .schema(
//     z.object({
//       token: z.string({ message: 'Verification token is required!' }),
//       userId: z.string({ message: 'User id is required!' }),
//     }),
//   )
//   .action(async ({ clientInput }) => {
//     const { token, userId } = clientInput
//     const response = await payload.verifyEmail({
//       collection: 'users',
//       token,
//     })

//     if (response) {
//       await payload.update({
//         collection: 'users',
//         where: {
//           id: {
//             equals: userId,
//           },
//         },
//       })
//     }

//     return response
//   })

export const forgotPasswordAction = publicClient
  .metadata({
    actionName: 'resetPasswordAction',
  })
  .schema(forgotPasswordSchema)
  .action(async ({ clientInput }) => {
    const payload = await getPayload({
      config: configPromise,
    })

    const { email } = clientInput

    const response = await payload.forgotPassword({
      collection: 'users',
      data: {
        email,
      },
    })

    return response
  })

export const resetPasswordAction = publicClient
  .metadata({ actionName: 'resetPasswordAction' })
  .schema(resetPasswordSchema)
  .action(async ({ clientInput }) => {
    const payload = await getPayload({
      config: configPromise,
    })

    const { password, token } = clientInput

    const response = await payload.resetPassword({
      collection: 'users',
      data: {
        password,
        token,
      },
      overrideAccess: true,
    })

    return response?.user
  })

export const logoutAction = publicClient
  .metadata({ actionName: 'logoutAction' })
  .action(async () => {
    const cookieStore = await cookies()
    cookieStore.delete('payload-token')
    redirect('/sign-in')
  })

export const getUserAction = userClient
  .metadata({ actionName: 'getUserAction' })
  .action(async ({ ctx }) => {
    return ctx.user
  })

export const getTenantAction = protectedClient
  .metadata({ actionName: 'getTenantAction' })
  .action(async ({ ctx }) => {
    return ctx.userTenant
  })

export const impersonateUserAction = userClient
  .metadata({
    actionName: 'impersonateUserAction',
  })
  .schema(impersonateUserSchema)
  .action(async ({ ctx, clientInput }) => {
    const { user, payload } = ctx
    console.dir({ user }, { depth: Infinity })

    // only admin users can impersonate
    if (!user.role?.includes('admin')) {
      throw new Error('Forbidden')
    }

    const { userId } = clientInput

    const userDetails = await payload.findByID({
      collection: 'users',
      id: userId,
    })

    console.log({ impersonatedUser: userDetails }, { depth: null })

    await createSession({ user: userDetails, payload })
    redirect(`/${userDetails.username}/dashboard`)
  })

export const autoLoginAction = publicClient
  .metadata({ actionName: 'autoLoginAction' })
  .schema(autoLoginSchema)
  .action(async ({ clientInput }) => {
    const token = clientInput.token
    const payload = await getPayload({ config: configPromise })
    const cookieStore = await cookies()

    // JWT verification
    const decodedToken = jwt.verify(token, env.PAYLOAD_SECRET, {
      algorithms: ['HS256'],
    }) as {
      email?: string
      code?: string
      exp?: number
      redirectUrl?: string
    }

    // Validate essential token data
    if (
      !decodedToken?.email ||
      typeof decodedToken.exp !== 'number' ||
      decodedToken.exp < Math.floor(Date.now() / 1000)
    ) {
      throw new Error('Forbidden')
    }

    // Find user or auto-create if not found
    let user = (
      await payload.find({
        collection: 'users',
        where: { email: { equals: decodedToken.email } },
      })
    ).docs[0]

    if (!user) {
      user = await payload.create({
        collection: 'users',
        data: {
          email: decodedToken.email,
          username: decodedToken.email.split('@')[0] || cuid().slice(0, 8), // random username
          password: cuid().slice(0, 12), // random password
          role: ['user'],
        },
      })
    }

    // One-time code logic with Redis
    if (!decodedToken.code) throw new Error('Forbidden')

    const { createRedisClient } = await import('@/lib/redis')
    const redisClient = createRedisClient()

    // Prevent code reuse (one-time link)
    const code = decodedToken.code
    const storedCode = await redisClient.get(`auto-login-code:${code}`)
    if (storedCode === code) throw new Error('Forbidden')
    await redisClient.set(`auto-login-code:${code}`, code, 'EX', 60 * 5)

    // Issue session/cookie
    await createSession({ user, payload })

    cookieStore.set('payload-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    // Compute redirect URL (strong fallback)
    const finalRedirect =
      typeof decodedToken.redirectUrl === 'string' && decodedToken.redirectUrl
        ? `/${user.username}${
            decodedToken.redirectUrl.startsWith('/')
              ? decodedToken.redirectUrl
              : `/${decodedToken.redirectUrl}`
          }`
        : `/${user.username}/dashboard`

    redirect(finalRedirect)
  })

export const requestMagicLinkAction = publicClient
  .metadata({ actionName: 'requestMagicLinkAction' })
  .schema(magicLinkSchema)
  .action(async ({ clientInput }) => {
    const { email } = clientInput
    const payload = await getPayload({ config: configPromise })

    // Check if Magic Link is enabled in global config
    const authConfig = await payload.findGlobal({ slug: 'auth-config' })
    if (authConfig?.authMethod === 'email-password') {
      throw new Error('Magic Link authentication is disabled')
    }

    // Generate unique code and JWT token
    const code = cuid()
    const redirectUrl = '/dashboard'

    const token = jwt.sign(
      {
        email,
        code,
        redirectUrl,
        exp: Math.floor(Date.now() / 1000) + 60 * 10, // 10 minutes
      },
      env.PAYLOAD_SECRET,
      { algorithm: 'HS256' },
    )

    // Create magic link URL
    const magicLinkUrl = `${env.NEXT_PUBLIC_WEBSITE_URL}/api/auto-login?token=${token}`

    // Await the render function to get HTML string
    const emailHtml = await MagicLinkEmail({
      actionLabel: 'Sign in to dFlow',
      buttonText: 'Sign In',
      userName: email.split('@')[0],
      href: magicLinkUrl,
    })

    // Send email using Payload's email service
    await payload.sendEmail({
      to: email,
      subject: 'Sign in to dFlow',
      html: emailHtml,
    })

    return { success: true, message: 'Magic link sent to your email' }
  })
