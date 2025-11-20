export interface WebhookPayload {
  event: 'create' | 'update' | 'delete'
  collection: string
  doc: any
  previousDoc?: any
  timestamp: string
}

export interface WebhookConfig {
  id: string
  url: string
  secret?: string | null
  headers?: Array<{ key: string; value: string }> | null
}

export interface Webhook {
  id: string
  name: string
  url: string
  events: Array<'create' | 'update' | 'delete'>
  collections: string[]
  isActive: boolean
  secret?: string | null
  headers?: Array<{ key: string; value: string; id?: string | null }> | null
}
