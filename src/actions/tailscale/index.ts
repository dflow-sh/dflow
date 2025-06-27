'use server'

import { env } from 'env'
import { z } from 'zod'

import tailscale from '@/lib/axios/tailscale'
import { protectedClient } from '@/lib/safe-action'

export const getOAuthClientSecretAction = protectedClient
  .metadata({
    actionName: 'getOAuthClientSecretAction',
  })
  .action(async () => {
    try {
      const response = await tailscale.post(
        `/oauth/token`,
        {},
        {
          headers: {
            Authorization: `Bearer ${env.TAILSCALE_OAUTH_CLIENT_SECRET}`,
          },
        },
      )

      return {
        success: true,
        data: response.data,
      }
    } catch (error: any) {
      console.error('Error fetching OAuth Client Secret:', error)
      console.error('Error response:', error.response?.data)
      console.error('Request config:', error.config)

      // More specific error messages
      if (error.response?.status === 401) {
        throw new Error('Unauthorized: Please check your Tailscale API key')
      } else if (error.response?.status === 403) {
        throw new Error(
          'Forbidden: API key does not have permission to create auth keys',
        )
      } else if (error.response?.status === 404) {
        throw new Error(
          `Tailnet "${env.TAILSCALE_TAILNET}" not found. Please check your tailnet configuration.`,
        )
      } else {
        throw new Error(
          `Failed to fetch OAuth Client Secret: ${error.message || 'Unknown error'}`,
        )
      }
    }
  })

export const generateOAuthClientSecretAction = protectedClient
  .metadata({
    actionName: 'generateOAuthClientSecretAction',
  })
  .schema(
    z.object({
      access_token: z.string(),
    }),
  )
  .action(async ({ ctx, clientInput }) => {
    const { access_token } = clientInput

    try {
      const authSecret = tailscale.post(
        `/tailnet/${env.TAILSCALE_TAILNET}/keys`,
        {
          capabilities: {
            devices: {
              create: {
                reusable: false,
                tags: ['tag:customer-machine'],
              },
            },
          },
          expirySeconds: 86400,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      )

      const { data } = await authSecret

      console.log('Generated OAuth Client Secret:', data)

      return {
        success: true,
        data: data,
      }
    } catch (error: any) {
      console.error('Error generating OAuth Client Secret:', error)
      console.error('Error response:', error.response?.data)
      console.error('Request config:', error.config)

      // More specific error messages
      if (error.response?.status === 401) {
        throw new Error('Unauthorized: Please check your Tailscale API key')
      } else if (error.response?.status === 403) {
        throw new Error(
          'Forbidden: API key does not have permission to create auth keys',
        )
      } else if (error.response?.status === 404) {
        throw new Error(
          `Tailnet "${env.TAILSCALE_TAILNET}" not found. Please check your tailnet configuration.`,
        )
      } else {
        throw new Error(
          `Failed to generate OAuth Client Secret: ${error.message || 'Unknown error'}`,
        )
      }
    }
  })
