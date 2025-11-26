import type { WebhookConfig, WebhookPayload } from "@core/plugins/webhook/types"
import axios from 'axios'
import crypto from 'crypto'
import type { Payload } from 'payload'

export async function deliverWebhook(
  webhook: WebhookConfig,
  payload: WebhookPayload,
): Promise<void> {
  try {
    const body = JSON.stringify(payload)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-dFlow-Event': payload.event,
      'X-dFlow-Collection': payload.collection,
      'X-dFlow-Delivery': crypto.randomUUID(),
    }

    if (webhook.secret) {
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(body)
        .digest('hex')
      headers['X-dFlow-Signature'] = signature
    }

    if (webhook.headers) {
      webhook.headers.forEach(({ key, value }) => {
        headers[key] = value
      })
    }

    await axios.post(webhook.url, payload, {
      headers,
      timeout: 10000,
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `Webhook delivery failed for ${webhook.url}:`,
        error.response?.status,
        error.message,
      )
    } else {
      console.error(`Webhook delivery failed for ${webhook.url}:`, error)
    }
  }
}

export async function triggerWebhooks(
  payload: Payload,
  event: 'create' | 'update' | 'delete',
  slug: string,
  doc: any,
  previousDoc?: any,
): Promise<void> {
  try {
    const webhooks = await payload.find({
      collection: 'webhooks',
      where: {
        and: [
          { isActive: { equals: true } },
          { events: { contains: event } },
          {
            or: [
              { collections: { contains: slug } },
              { globals: { contains: slug } },
            ],
          },
        ],
      },
    })

    const webhookPayload: WebhookPayload = {
      event,
      collection: slug,
      doc,
      previousDoc,
      timestamp: new Date().toISOString(),
    }

    await Promise.allSettled(
      webhooks.docs.map((webhook: any) => {
        const headers = webhook.headers
          ? webhook.headers
              .filter(
                (h: any): h is { key: string; value: string } =>
                  typeof h === 'object' && h !== null,
              )
              .map(({ key, value }: any) => ({ key, value }))
          : undefined

        return deliverWebhook(
          {
            id: webhook.id,
            url: webhook.url,
            secret: webhook.secret ?? undefined,
            headers,
          },
          webhookPayload,
        )
      }),
    )
  } catch (error) {
    console.error('Error triggering webhooks:', error)
  }
}
