'use server'

import { protectedClient } from '@/lib/safe-action'
import { CloudProviderAccount } from '@/payload-types'

import { connectDFlowAccountSchema } from './validator'

export const connectDFlowAccountAction = protectedClient
  .metadata({
    actionName: 'connectAWSAccountAction',
  })
  .schema(connectDFlowAccountSchema)
  .action(async ({ clientInput, ctx }) => {
    const { accessToken, name, id } = clientInput

    const { userTenant, payload } = ctx
    let response: CloudProviderAccount

    if (id) {
      response = await payload.update({
        collection: 'cloudProviderAccounts',
        id,
        data: {
          type: 'dFlow',
          dFlowDetails: {
            accessToken,
          },
          name,
        },
      })
    } else {
      response = await payload.create({
        collection: 'cloudProviderAccounts',
        data: {
          type: 'dFlow',
          dFlowDetails: {
            accessToken,
          },
          tenant: userTenant.tenant,
          name,
        },
      })
    }

    return response
  })
