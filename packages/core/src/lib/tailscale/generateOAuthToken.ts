import { env } from '@dflow/core/env'

import tailscale from '@dflow/core/lib/axios/tailscale'

export const generateOAuthToken = async () => {
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
}
