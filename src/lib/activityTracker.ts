import type { Payload } from 'payload'

export interface TrackActivityParams {
  payload: Payload
  userId: string
  eventType: string
  operation: string
  label: string
  status?: 'success' | 'failed' | 'pending'
  severity?: 'info' | 'warning' | 'error' | 'critical'
  category?: string
  collectionSlug?: string
  documentId?: string
  documentTitle?: string
  changes?: Record<string, { before: any; after: any }>
  changedFields?: string[]
  metadata?: Record<string, any>
  icon?: string
  req?: any
  error?: {
    message: string
    code?: string
    stack?: string
  }
}

export async function trackActivity({
  payload,
  userId,
  eventType,
  operation,
  label,
  status = 'success',
  severity = 'info',
  category,
  collectionSlug,
  documentId,
  documentTitle,
  changes,
  changedFields,
  metadata = {},
  icon,
  req,
  error,
}: TrackActivityParams): Promise<void> {
  try {
    const ipAddress =
      req?.ip ||
      req?.headers?.get?.('x-forwarded-for') ||
      req?.headers?.get?.('x-real-ip') ||
      'unknown'

    const userAgent = req?.headers?.get?.('user-agent') || 'unknown'

    await payload.create({
      collection: 'activity',
      data: {
        user: userId,
        eventType,
        operation,
        label,
        status,
        severity,
        category,
        collectionSlug,
        documentId,
        documentTitle,
        changes,
        changedFields: changedFields?.map(field => ({ field })) || [],
        metadata,
        icon,
        ipAddress,
        userAgent,
        requestMethod: req?.method,
        requestUrl: req?.url,
        ...(status === 'failed' && error && { error }),
      },
      overrideAccess: true,
    })
  } catch (err) {
    console.error('Failed to track activity:', err)
  }
}
