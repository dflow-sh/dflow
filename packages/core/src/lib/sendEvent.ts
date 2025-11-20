import type Redis from 'ioredis'

type SendEventType = {
  serverId: string
  serviceId?: string
  pub: Redis
  message: string
  channelId?: string // this channelId is used for lpush command
}

type SendActionEventType = {
  pub: Redis
  action: 'refresh' | 'redirect'
  url?: string
  tenantSlug: string
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

export const sendActionEvent = ({
  pub,
  action,
  url,
  tenantSlug,
}: SendActionEventType) => {
  // sending refresh event to the pub/sub channel so client can do router.refresh()
  if (action === 'refresh') {
    pub.publish(
      `refresh-channel-${tenantSlug}`,
      JSON.stringify({ refresh: true }),
    )
  }

  if (action === 'redirect') {
    pub.publish(`refresh-channel-${tenantSlug}`, JSON.stringify({ path: url }))
  }
}
