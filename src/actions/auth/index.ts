'use server'

import configPromise from '@payload-config'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import qrcode from 'qrcode'
import speakeasy from 'speakeasy'
import { z } from 'zod'

import { protectedClient, publicClient } from '@/lib/safe-action'

import {
  forgotPasswordSchema,
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
    const response = await payload.create({
      collection: 'users',
      data: {
        username,
        email,
        password,
        onboarded: false,
        tenants: [{ tenant: tenant.id, roles: ['tenant-admin'] }],
      },
    })
    return response
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

export const getUserAction = protectedClient
  .metadata({ actionName: 'getUserAction' })
  .action(async ({ ctx }) => {
    return ctx.user
  })

export const getTenantAction = protectedClient
  .metadata({ actionName: 'getTenantAction' })
  .action(async ({ ctx }) => {
    return ctx.userTenant
  })

export const generate2FASetup = protectedClient
  .metadata({ actionName: 'generate2FASetup' })
  .action(async ({ ctx }) => {
    const { user } = ctx
    const payload = await getPayload({ config: configPromise })

    const secret = speakeasy.generateSecret({
      name: `dFlow (${user.email})`,
    })

    if (!secret.otpauth_url) {
      throw new Error('Failed to generate OTP Auth URL.')
    }

    const qrCode = await qrcode.toDataURL(secret.otpauth_url)

    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        twoFASecret: secret.base32,
        twoFAEnabled: false,
      },
    })

    return {
      qrCode,
      manualCode: secret.base32,
    }
  })

export const verify2FASetup = protectedClient
  .metadata({ actionName: 'verify2FASetup' })
  .schema(
    z.object({
      token: z.string().min(6, 'Code is required'),
    }),
  )
  .action(async ({ ctx, clientInput }) => {
    const { token } = clientInput
    const { user } = ctx
    const payload = await getPayload({ config: configPromise })
    const currentUser = await payload.findByID({
      collection: 'users',
      id: user.id,
    })

    const secret = currentUser.twoFASecret
    if (!secret) {
      throw new Error('Two-factor authentication has not been set up.')
    }

    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
    })
    if (!verified) {
      throw new Error('Invalid authentication code')
    }

    // Enable 2FA
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        twoFAEnabled: true,
      },
    })

    return { success: true }
  })

export const disable2FA = protectedClient
  .metadata({ actionName: 'disable2FA' })
  .action(async ({ ctx }) => {
    const { user } = ctx
    const payload = await getPayload({ config: configPromise })

    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        twoFAEnabled: false,
        twoFASecret: null,
      },
    })

    return { success: true }
  })
