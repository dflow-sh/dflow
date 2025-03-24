import type Redis from 'ioredis'

type SendEventType = {
  serverId: string
  serviceId?: string
  pub: Redis
  message: string
  channelId?: string // this channelId is used for lpush command
}

type PublishEventType = {
  pub: Redis
  message: string
  channelId: string
}

export const sendEvent = ({
  serverId,
  serviceId,
  message,
  pub,
  channelId,
}: SendEventType) => {
  const channel = `channel-${serverId}${serviceId ? `-${serviceId}` : ''}`

  void Promise.all([
    pub.publish(channel, message),
    channelId ? pub.lpush(channelId, message) : null,
  ]).catch(error => {
    console.error(`Failed to process event for ${channel}:`, error)
  })
}

export const storeEvent = async ({
  channelId,
  message,
  pub,
}: PublishEventType) => {
  try {
    pub.lpush(channelId, message)
  } catch (error) {
    let message = ''

    if (error instanceof Error) {
      message = error.message
    }

    console.log(`Failed to store log ${channelId}: ${message}`)
  }
}
