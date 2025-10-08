'use server'

import axios from 'axios'
import { revalidatePath } from 'next/cache'

import { DFLOW_CONFIG } from '@/lib/constants'
import { dFlowRestSdk } from '@/lib/restSDK/utils'
import { protectedClient, publicClient } from '@/lib/safe-action'
import { CloudProviderAccount } from '@/payload-types'

import {
  checkConnectionSchema,
  checkPaymentMethodSchema,
  connectDFlowAccountSchema,
  createVPSOrderActionSchema,
  deleteDFlowAccountSchema,
  updateDFlowAccountSchema,
} from './validator'

export const connectDFlowAccountAction = protectedClient
  .metadata({
    actionName: 'connectDFlowAccountAction',
  })
  .inputSchema(connectDFlowAccountSchema)
  .action(async ({ clientInput, ctx }) => {
    const { accessToken, name } = clientInput

    const { userTenant, payload } = ctx
    let response: CloudProviderAccount

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

    revalidatePath(`${userTenant.tenant.slug}/servers/add-new-server`)
    console.log(response)
    return response
  })

export const updateDFlowAccountAction = protectedClient
  .metadata({
    actionName: 'updateDFlowAccountAction',
  })
  .inputSchema(updateDFlowAccountSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id, accessToken, name } = clientInput

    const { userTenant, payload } = ctx
    let response: CloudProviderAccount

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

    revalidatePath(`${userTenant.tenant.slug}/servers/add-new-server`)
    console.log(response)
    return response
  })

export const getDFlowPlansAction = publicClient
  .metadata({
    actionName: 'getDFlowPlansAction',
  })
  .action(async () => {
    const { docs: vpsPlans } = await dFlowRestSdk.find({
      collection: 'vpsPlans',
      pagination: false,
    })

    return vpsPlans
  })

export const createVPSOrderAction = protectedClient
  .metadata({
    actionName: 'createVPSOrderAction',
  })
  .inputSchema(createVPSOrderActionSchema)
  .action(async ({ clientInput, ctx }) => {
    const { accountId, sshKeyIds = [], vps } = clientInput
    const { userTenant, payload, user } = ctx
    const { addCreateVpsQueue } = await import(
      '@/queues/dFlow/addCreateVpsQueue'
    )

    if (Number(userTenant.role?.servers?.createLimit) > 0) {
      const { totalDocs } = await payload.count({
        collection: 'servers',
        where: {
          and: [
            {
              tenant: {
                equals: userTenant.tenant.id,
              },
            },
            {
              createdBy: {
                equals: user?.id,
              },
            },
          ],
        },
      })

      if (totalDocs >= Number(userTenant.role?.servers?.createLimit)) {
        throw new Error(
          `You have reached your server creation limit. Please contact your administrator.`,
        )
      }
    }

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
    const paymentCheck = await checkPaymentMethodAction({ token })

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

    const createVPSresponse = await addCreateVpsQueue({
      sshKeys,
      vps,
      accountDetails: {
        id: dFlowAccount.id,
        accessToken: token,
      },
      userId: user.id,
      tenant: userTenant.tenant,
      preferConnectionType: 'tailscale',
    })

    if (createVPSresponse.id) {
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
    }
  })

export const checkPaymentMethodAction = protectedClient
  .metadata({
    actionName: 'checkPaymentMethodAction',
  })
  .inputSchema(checkPaymentMethodSchema)
  .action(async ({ clientInput }) => {
    const { token } = clientInput

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
    const validCardCount = cardsData.totalDocs || 0

    return {
      walletBalance,
      validCardCount,
    }
  })

export const checkAccountConnection = protectedClient
  .metadata({
    actionName: 'checkAccountConnection',
  })
  .inputSchema(checkConnectionSchema)
  .action(async ({ clientInput }) => {
    const { token } = clientInput

    try {
      // Validate token format
      if (!token || typeof token !== 'string' || token.trim() === '') {
        return {
          isConnected: false,
          user: null,
          error: 'Invalid or missing access token',
        }
      }

      const userResponse = await axios.get(`${DFLOW_CONFIG.URL}/api/users`, {
        headers: {
          Authorization: `${DFLOW_CONFIG.AUTH_SLUG} API-Key ${token}`,
        },
        timeout: 10000, // 10 second timeout
      })

      const usersData = userResponse?.data?.docs?.at(0)

      if (!usersData || !usersData.id) {
        return {
          isConnected: false,
          user: null,
          error: 'No user data found or invalid response from dFlow API',
        }
      }

      // Additional validation for active user
      if (usersData.status && usersData.status !== 'active') {
        return {
          isConnected: false,
          user: usersData,
          error: `Account status is ${usersData.status}. Please ensure your dFlow account is active.`,
        }
      }

      return {
        isConnected: true,
        user: usersData,
        error: null,
      }
    } catch (error) {
      console.error('dFlow account connection check failed:', error)

      // Handle specific error types
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          const status = error.response.status
          const statusText = error.response.statusText

          switch (status) {
            case 401:
              return {
                isConnected: false,
                user: null,
                error: 'Invalid access token. Please check your dFlow API key.',
              }
            case 403:
              return {
                isConnected: false,
                user: null,
                error:
                  'Access denied. Please ensure your API key has the necessary permissions.',
              }
            case 404:
              return {
                isConnected: false,
                user: null,
                error: 'dFlow API endpoint not found. Please try again later.',
              }
            case 429:
              return {
                isConnected: false,
                user: null,
                error: 'Too many requests. Please wait a moment and try again.',
              }
            case 500:
            case 502:
            case 503:
            case 504:
              return {
                isConnected: false,
                user: null,
                error:
                  'dFlow service is temporarily unavailable. Please try again later.',
              }
            default:
              return {
                isConnected: false,
                user: null,
                error: `Connection failed with status ${status}: ${statusText}`,
              }
          }
        } else if (error.request) {
          // Network error
          return {
            isConnected: false,
            user: null,
            error:
              'Network error. Please check your internet connection and try again.',
          }
        } else if (error.code === 'ECONNABORTED') {
          // Timeout error
          return {
            isConnected: false,
            user: null,
            error:
              'Connection timeout. The dFlow service may be slow or unavailable.',
          }
        }
      }

      // Generic error fallback
      return {
        isConnected: false,
        user: null,
        error:
          'Failed to connect to dFlow. Please check your account details and try again.',
      }
    }
  })

export const deleteDFlowAccountAction = protectedClient
  .metadata({
    actionName: 'deleteDFlowAccountAction',
  })
  .inputSchema(deleteDFlowAccountSchema)
  .action(async ({ clientInput, ctx }) => {
    const { id } = clientInput
    const { payload } = ctx

    const response = await payload.update({
      collection: 'cloudProviderAccounts',
      id,
      data: {
        deletedAt: new Date().toISOString(),
      },
    })

    return response
  })

export const getDflowUser = protectedClient
  .metadata({
    actionName: 'getDflowUser',
  })
  .action(async ({ ctx }) => {
    const { payload, userTenant } = ctx

    const { docs: dflowAccounts } = await payload.find({
      collection: 'cloudProviderAccounts',
      pagination: false,
      where: {
        and: [
          { type: { equals: 'dFlow' } },
          { 'tenant.slug': { equals: userTenant.tenant?.slug } },
        ],
      },
    })

    if (!dflowAccounts || dflowAccounts.length === 0) {
      throw new Error('No connected dFlow accounts found')
    }

    const dflowAccount = dflowAccounts?.[0]
    const token = dflowAccount.dFlowDetails?.accessToken

    let user = null

    try {
      const response = await axios.get(`${DFLOW_CONFIG.URL}/api/users`, {
        headers: {
          Authorization: `${DFLOW_CONFIG.AUTH_SLUG} API-Key ${token}`,
        },
        timeout: 10000,
      })

      user = response?.data?.docs?.[0]
    } catch (error) {
      console.log(
        `Failed to fetch user details with account: ${dflowAccount.id}`,
      )
    }

    return { user, account: dflowAccount }
  })
