import { triggerWebhooks } from '../services/webhookDelivery'
import type { GlobalAfterChangeHook } from 'payload'

export const webhookGlobalAfterChange: GlobalAfterChangeHook = async ({
  doc,
  req,
  previousDoc,
  global,
}) => {
  // Globals only have 'update' operation (no create/delete)
  await triggerWebhooks(req.payload, 'update', global.slug, doc, previousDoc)
  return doc
}
