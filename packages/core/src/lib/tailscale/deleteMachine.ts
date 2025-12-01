import { env } from '@dflow/core/env'
import type { BasePayload } from 'payload'

import tailscale from '@dflow/core/lib/axios/tailscale'

import { generateOAuthToken } from './generateOAuthToken'

export const deleteMachine = async ({
  payload,
  serverId,
}: {
  serverId: string
  payload: BasePayload
}) => {
  const { data } = await generateOAuthToken()
  const token = data?.access_token

  if (token) {
    const listResponse = await tailscale.get(
      `/tailnet/${env.TAILSCALE_TAILNET}/devices?fields=id,hostname`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (listResponse?.status > 200) {
      throw new Error('Failed to retrieve tailscale devices')
    }

    const server = await payload.findByID({
      collection: 'servers',
      id: serverId,
      trash: true,
    })

    const devices = listResponse?.data?.devices
    const device = devices.find(
      (device: any) => device.hostname === server.hostname,
    )

    const deletionResponse = await tailscale.delete(`/device/${device.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (listResponse?.status > 200) {
      throw new Error(`Failed to delete server ${server.name}`)
    }

    if (deletionResponse.status === 200) {
      return { success: true }
    }
  }
}
