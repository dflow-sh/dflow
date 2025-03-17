import type Redis from 'ioredis'

type SendEventType = {
  serverId: string
  serviceId?: string
  pub: Redis
  message: string
}

export const sendEvent = async ({
  serverId,
  serviceId,
  message,
  pub,
}: SendEventType) => {
  const channel = `channel-${serverId}${serviceId ? `-${serviceId}` : ''}`

  try {
    pub.publish(channel, message)
  } catch (error) {
    let message = ''

    if (error instanceof Error) {
      message = error.message
    }

    console.log(`Failed to publish event in channel ${channel}: ${message}`)
  }
}
