'use server'

import axios from 'axios'

import { DFLOW_CONFIG } from '@/lib/constants'
import { protectedClient } from '@/lib/safe-action'
import { CloudProviderAccount } from '@/payload-types'

import { VpsPlan } from './types'
import {
  checkPaymentMethodSchema,
  connectDFlowAccountSchema,
  createSshKeysAndVpsActionSchema,
} from './validator'

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

export const getDFlowPlansAction = protectedClient
  .metadata({
    actionName: 'getDFlowPlansAction',
  })
  .action(async () => {
    let vpsPlans: VpsPlan[] = []

    if (DFLOW_CONFIG.URL) {
      const response = await axios.get(`${DFLOW_CONFIG.URL}/api/vpsPlans`, {})

      vpsPlans = response?.data?.docs ?? []
    }

    return vpsPlans
  })

export const createSshKeysAndVpsAction = protectedClient
  .metadata({
    actionName: 'createSshKeysAndVpsAction',
  })
  .schema(createSshKeysAndVpsActionSchema)
  .action(async ({ clientInput, ctx }) => {
    const { accountId, sshKeyIds, vps } = clientInput
    const { userTenant, payload, user } = ctx
    const { addCreateVpsQueue } = await import(
      '@/queues/dFlow/addCreateVpsQueue'
    )

    console.log('Starting VPS creation process...')

    // 1. Verify dFlow account
    const { docs: dFlowAccounts } = await payload.find({
      collection: 'cloudProviderAccounts',
      pagination: false,
      where: {
        and: [
          { id: { equals: accountId } },
          { type: { equals: 'dFlow' } },
          { 'tenant.slug': { equals: userTenant.tenant?.slug } },
        ],
      },
    })

    console.dir({ dFlowAccounts }, { depth: Infinity })

    if (!dFlowAccounts?.length) {
      throw new Error('No dFlow account found with the specified ID')
    }

    const dFlowAccount = dFlowAccounts[0]
    const token = dFlowAccount.dFlowDetails?.accessToken

    if (!token) {
      throw new Error('Invalid dFlow account: No access token found')
    }

    // 2. Check payment method and balance
    console.log('Checking payment method...')
    const paymentCheck = await checkPaymentMethodAction({ accountId })

    if (!paymentCheck?.data) {
      throw new Error('Failed to verify payment methods')
    }

    const { walletBalance, validCardCount } = paymentCheck.data
    const hasSufficientFunds = walletBalance >= vps.estimatedCost
    const hasPaymentMethod = validCardCount > 0 || hasSufficientFunds

    if (!hasPaymentMethod) {
      throw new Error(
        `Insufficient funds ($${walletBalance.toFixed(2)}) and no valid payment cards. ` +
          `Required: $${vps.estimatedCost.toFixed(2)}`,
      )
    }

    const { docs: sshKeys } = await payload.find({
      collection: 'sshKeys',
      pagination: false,
      where: {
        and: [
          { id: { in: sshKeyIds } },
          { 'tenant.slug': { equals: userTenant.tenant?.slug } },
        ],
      },
    })

    // 3. Proceed with VPS creation
    console.log('Payment verified. Triggering VPS creation queue...')
    await addCreateVpsQueue({
      sshKeys,
      vps,
      accountDetails: {
        id: dFlowAccount.id,
        accessToken: token,
      },
      tenant: userTenant.tenant,
    })

    console.log('VPS creation process initiated successfully')
    return {
      success: true,
      data: {
        accountId: dFlowAccount.id,
        vpsName: vps.displayName,
        estimatedCost: vps.estimatedCost,
      },
      message:
        'VPS creation process started. You will receive updates on the progress.',
    }
  })

export const checkPaymentMethodAction = protectedClient
  .metadata({
    actionName: 'checkPaymentMethodAction',
  })
  .schema(checkPaymentMethodSchema)
  .action(async ({ clientInput, ctx }) => {
    const { accountId } = clientInput
    const { userTenant, payload, user } = ctx

    // Find the specific dFlow account
    const { docs: dFlowAccounts } = await payload.find({
      collection: 'cloudProviderAccounts',
      pagination: false,
      where: {
        and: [
          {
            id: {
              equals: accountId,
            },
          },
          {
            type: {
              equals: 'dFlow',
            },
          },
          {
            'tenant.slug': {
              equals: userTenant.tenant?.slug,
            },
          },
        ],
      },
    })

    if (!dFlowAccounts || dFlowAccounts.length === 0) {
      throw new Error('dFlow account not found or not accessible')
    }

    const dFlowAccount = dFlowAccounts[0]
    const token = dFlowAccount.dFlowDetails?.accessToken

    if (!token) {
      throw new Error('Invalid dFlow account: No access token found')
    }

    // Fetch user wallet balance
    const userResponse = await axios.get(`${DFLOW_CONFIG.URL}/api/users`, {
      headers: {
        Authorization: `${DFLOW_CONFIG.AUTH_SLUG} API-Key ${token}`,
      },
    })

    const usersData = userResponse.data
    const userData = usersData.docs.at(0) || {}
    const walletBalance = userData.wallet || 0

    // Fetch user's payment cards
    const cardsResponse = await axios.get(
      `${DFLOW_CONFIG.URL}/api/cards/count`,
      {
        headers: {
          Authorization: `${DFLOW_CONFIG.AUTH_SLUG} API-Key ${token}`,
        },
      },
    )

    const cardsData = cardsResponse.data
    const validCardCount = cardsData.totalDocs || []

    return {
      walletBalance,
      validCardCount,
    }
  })
