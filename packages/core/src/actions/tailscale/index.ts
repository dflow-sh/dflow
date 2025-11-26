'use server'

import { keys as env } from '@core/keys';

import tailscale from "@core/lib/axios/tailscale"
import { protectedClient } from "@core/lib/safe-action"
import { generateOAuthToken } from "@core/lib/tailscale/generateOAuthToken"

import { generateAuthKeySchema } from "@core/actions/tailscale/validator"

export const generateOAuthTokenAction = protectedClient
  .metadata({
    actionName: 'generateOAuthTokenAction',
  })
  .action(async () => {
    const response = await generateOAuthToken()
    return response
  })

export const generateAuthKeyAction = protectedClient
  .metadata({
    actionName: 'generateAuthKeyAction',
  })
  .inputSchema(generateAuthKeySchema)
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

      console.log('Generated OAuth Client Secret')

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
