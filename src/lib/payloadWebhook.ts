import { env } from 'env'

import { DatabaseUpdateSchemaType } from '@/payload/endpoints/validator'

type DatabaseUpdateType = Extract<
  DatabaseUpdateSchemaType,
  { type: 'database.update' }
>

type PluginUpdateType = Extract<
  DatabaseUpdateSchemaType,
  { type: 'plugin.update' }
>

type DomainUpdateType = Extract<
  DatabaseUpdateSchemaType,
  { type: 'domain.update' }
>

export const payloadWebhook = ({
  payloadToken,
  data,
}: {
  payloadToken: string
  data: DatabaseUpdateType | PluginUpdateType | DomainUpdateType
}) =>
  fetch(`${env.NEXT_PUBLIC_WEBSITE_URL}/api/databaseUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${payloadToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
