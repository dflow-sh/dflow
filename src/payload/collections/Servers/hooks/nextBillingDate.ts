import { CollectionAfterReadHook } from 'payload'

import { DFLOW_CONFIG } from '@/lib/constants'
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
    const res = await fetch(
      `${DFLOW_CONFIG.URL}/api/vpsOrders?pagination=false&where[or][0][and][0][instanceId][equals]=${instanceId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `users API-Key ${token}`,
        },
      },
    )
    const data = await res.json()
    const externalOrder = Array.isArray(data) ? data[0] : data

    if (!externalOrder?.docs?.at(0)?.next_billing_date) return doc
    const updatedNextBillingDate = new Date(
      externalOrder?.docs?.at(0)?.next_billing_date,
    ).toISOString()

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
