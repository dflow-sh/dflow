'use server'

import configPromise from '@payload-config'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { createSession } from '@/lib/createSession'
import { protectedClient, publicClient, userClient } from '@/lib/safe-action'

import {
  forgotPasswordSchema,
  impersonateUserSchema,
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
