import { CollectionAfterReadHook } from 'payload'

import { DFLOW_CONFIG } from '@/lib/constants'
import { dFlowRestSdk } from '@/lib/restSDK/utils'
import { Server } from '@/payload-types'

export const nextBillingDateAfterRead: CollectionAfterReadHook<
  Server
> = async ({ doc, req, context }) => {
  const { payload } = req
  const { checkDflowNextBillingDate } = context
  const instanceId = doc?.dflowVpsDetails?.instanceId

  if (doc.provider !== 'dflow' || !checkDflowNextBillingDate || !instanceId) {
    return doc
  }

  const existingBillingDate = doc?.dflowVpsDetails?.next_billing_date
    ? new Date(doc.dflowVpsDetails.next_billing_date)
    : null
  const now = new Date()

  const isMissing = !existingBillingDate
  const isExpired = existingBillingDate && existingBillingDate < now

  if (!isMissing && !isExpired) {
    return doc
  }

  let token: string | undefined

  try {
    if (typeof doc.cloudProviderAccount === 'object') {
      token = doc.cloudProviderAccount?.dFlowDetails?.accessToken
    } else {
      const { dFlowDetails } = await payload.findByID({
        collection: 'cloudProviderAccounts',
        id: doc.cloudProviderAccount ?? '',
      })

      token = dFlowDetails?.accessToken
    }

    const { next_billing_date } = await dFlowRestSdk.findByID(
      {
        collection: 'vpsOrders',
        id: instanceId,
      },
      {
        headers: {
          Authorization: `${DFLOW_CONFIG.AUTH_SLUG} API-Key ${token}`,
        },
      },
    )

    if (!next_billing_date) return doc
    const updatedNextBillingDate = new Date(next_billing_date).toISOString()

    // ✅ Use payload.update instead of calling payload
    await payload.update({
      collection: 'servers',
      id: doc.id,
      data: {
        dflowVpsDetails: {
          next_billing_date: updatedNextBillingDate,
        },
      },
    })

    if (!doc.dflowVpsDetails) {
      doc.dflowVpsDetails = {}
    }

    doc.dflowVpsDetails.next_billing_date = updatedNextBillingDate
  } catch (err) {
    console.error(
      `Error updating nextBillingDate for instanceId ${instanceId}:`,
      err,
    )
  }

  return doc
}
