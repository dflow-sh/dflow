'use server'

import { env } from 'env'
import { revalidatePath } from 'next/cache'

import { TeamInvitation } from '@/emails/team-invitation'
import { protectedClient, userClient } from '@/lib/safe-action'
import { Tenant } from '@/payload-types'

import {
  joinTeamSchema,
  sendInvitationLinkSchema,
  updateTenantRolesSchema,
} from './validator'

export const getTeamMembersAction = protectedClient
  .metadata({ actionName: 'getTeamMembersAction' })
  .action(async ({ ctx }) => {
    const { payload, user } = ctx
    const { userTenant } = ctx

    const response = await payload.find({
      collection: 'users',
      pagination: false,
      depth: 10,
      where: {
        and: [
          {
            'tenants.tenant': {
              in: [userTenant.tenant.id],
            },
          },
        ],
      },
    })
    return response.docs
  })

export const updateUserTenantRoles = protectedClient
  .metadata({
    actionName: 'updateUserTenantRoles',
  })
  .schema(updateTenantRolesSchema)
  .action(async ({ ctx, clientInput }) => {
    const {
      payload,
      userTenant: { tenant },
    } = ctx
    const { roles, user } = clientInput
    const response = await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        tenants: [
          ...(user?.tenants || [])?.map((tenantData: any) => {
            if ((tenantData.tenant as Tenant).slug == tenant.slug) {
              return { ...tenantData, roles: roles }
            }
            return tenantData
          }),
        ],
      },
    })
    if (response) {
      revalidatePath(`/${tenant.slug}/team`)
    }

    return response
  })

export const removeUserFromTeamAction = protectedClient
  .metadata({
    actionName: 'removeUserFromTeamAction',
  })
  .schema(updateTenantRolesSchema)
  .action(async ({ ctx, clientInput }) => {
    const {
      payload,
      userTenant: { tenant },
    } = ctx
    const { user } = clientInput
    const updatedTenants = (user?.tenants || []).filter((tenantData: any) => {
      return (tenantData.tenant as Tenant).slug !== tenant.slug
    })
    const response = await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        tenants: updatedTenants,
      },
    })
    if (response) {
      revalidatePath(`/${tenant.slug}/team`)
    }

    return response
  })

export const joinTeamAction = userClient
  .metadata({
    actionName: 'joinTeamAction',
  })
  .schema(joinTeamSchema)
  .action(async ({ ctx, clientInput }) => {
    const { payload, user } = ctx
    const { roles, tenantId } = clientInput

    const tenant = await payload.findByID({
      collection: 'tenants',
      id: tenantId,
    })
    if (!tenant) {
      throw Error('Invalid Invitation Link')
    }

    const isInTeam = (user?.tenants || []).some(
      (tenantData: any) => (tenantData.tenant as Tenant).id === tenantId,
    )
    if (isInTeam) {
      throw Error('Your are already in team')
    }

    const result = await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        tenants: [
          ...(user?.tenants || []),
          {
            tenant: tenant,
            roles,
          },
        ],
      },
    })
    return result
  })

export const sendInvitationLinkAction = userClient
  .metadata({
    actionName: 'sendInvitationLinkAction',
  })
  .schema(sendInvitationLinkSchema)
  .action(async ({ ctx, clientInput }) => {
    const { email, link } = clientInput
    const { payload } = ctx

    await payload.sendEmail({
      to: email,
      from: `"Team dFlow" <${env.RESEND_SENDER_EMAIL}>`,
      subject: 'You have been invited',
      html: await TeamInvitation({
        actionLabel: 'Team Invitation',
        buttonText: 'Join Team',
        href: link,
      }),
    })
  })
