import { triggerWebhooks } from '../services/webhookDelivery'
import type { CollectionAfterChangeHook } from 'payload'

export const webhookAfterChange: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
  previousDoc,
  collection,
}) => {
  if (operation === 'create' || operation === 'update') {
    await triggerWebhooks(
      req.payload,
      operation,
      collection.slug,
      doc,
      previousDoc,
    )
  }

  return doc
}
