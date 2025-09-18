import { env } from 'env'
import type { BasePayload } from 'payload'

import tailscale from '@/lib/axios/tailscale'

import { generateOAuthToken } from './generateOAuthToken'

export const deleteMachine = async ({
  payload,
  serverId,
}: {
  serverId: string
  payload: BasePayload
}) => {
  const { data } = await generateOAuthToken()
  const token = data?.data?.access_token

  if (token) {
    const listResponse = await tailscale.get(
      `/tailnet/${env.TAILSCALE_TAILNET}/devices?fields=id,hostname`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    console.dir({ listResponse: listResponse.data }, { depth: null })

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

    console.log({ deletionResponse: deletionResponse?.data }, { depth: null })

    if (deletionResponse.status === 200) {
      return { success: true }
    }
  }
}
