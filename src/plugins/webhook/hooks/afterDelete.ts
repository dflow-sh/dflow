import { triggerWebhooks } from '../services/webhookDelivery'
import type { CollectionAfterDeleteHook } from 'payload'

export const webhookAfterDelete: CollectionAfterDeleteHook = async ({
  doc,
  req,
  collection,
}) => {
  await triggerWebhooks(req.payload, 'delete', collection.slug, doc)

  return doc
}
