'use server'

import { env } from '@dflow/core/env'
import jwt from 'jsonwebtoken'
import { revalidatePath } from 'next/cache'

import { TeamInvitation } from '@dflow/core/emails/team-invitation'
import { protectedClient, userClient } from '@dflow/core/lib/safe-action'
import { Tenant } from '@dflow/core/payload-types'

import {
  generateInviteLinkSchema,
  joinTeamSchema,
  sendInvitationLinkSchema,
  updateTenantRolesSchema,
} from './validator'

export const getTeamMembersAction = protectedClient
  .metadata({ actionName: 'getTeamMembersAction' })
  .action(async ({ ctx }) => {
    const { payload } = ctx
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

export const updateUserTenantRolesAction = protectedClient
  .metadata({
    actionName: 'updateUserTenantRolesAction',
  })
  .inputSchema(updateTenantRolesSchema)
  .action(async ({ ctx, clientInput }) => {
    const {
      payload,
      userTenant: { tenant },
    } = ctx
    const { role, user } = clientInput
    const response = await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        tenants: [
          ...(user?.tenants || [])?.map((tenantData: any) => {
            if ((tenantData.tenant as Tenant).slug == tenant.slug) {
              return { ...tenantData, role: role }
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
  .inputSchema(updateTenantRolesSchema)
  .action(async ({ ctx, clientInput }) => {
    const {
      payload,
      userTenant: { tenant },
    } = ctx
    const { user } = clientInput
    const updatedTenants = (user?.tenants || []).filter((tenantData: any) => {
      return (tenantData.tenant as Tenant).slug !== tenant.slug
    })
    console.dir(user?.tenants, 10)
    console.log(updatedTenants?.at(0)?.tenant)
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
  .inputSchema(joinTeamSchema)
  .action(async ({ ctx, clientInput }) => {
    const { payload, user } = ctx
    const { role, tenantId } = clientInput

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
            role,
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
  .inputSchema(sendInvitationLinkSchema)
  .action(async ({ ctx, clientInput }) => {
    const { email, link } = clientInput
    const { payload } = ctx

    console.log({ email, link })

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

export const generateInviteLinkAction = protectedClient
  .metadata({
    actionName: 'generateInviteLinkAction',
  })
  .inputSchema(generateInviteLinkSchema)
  .action(async ({ clientInput }) => {
    const { tenantId, role } = clientInput

    const token = jwt.sign({ tenantId, role }, env.PAYLOAD_SECRET, {
      expiresIn: '1d',
    })

    const inviteLink = `${env.NEXT_PUBLIC_WEBSITE_URL}/invite?token=${token}`

    return { inviteLink }
  })
