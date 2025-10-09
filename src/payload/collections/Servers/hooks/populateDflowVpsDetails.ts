import { CollectionAfterReadHook } from 'payload'

import { DFLOW_CONFIG } from '@/lib/constants'
import { dFlowRestSdk } from '@/lib/restSDK/utils'
import { Server } from '@/payload-types'

export const populateDflowVpsDetails: CollectionAfterReadHook<Server> = async ({
  doc,
  req,
  context,
}) => {
  const { payload } = req

  console.log({
    Provider: doc.provider,
    dflowVpsDetails: doc.dflowVpsDetails,
    hostname: doc.hostname,
  })

  // Only proceed if provider is dflow and dflowVpsDetails are empty
  if (
    doc.provider !== 'dflow' ||
    (doc.dflowVpsDetails?.instanceId &&
      doc.dflowVpsDetails?.status &&
      doc.dflowVpsDetails.orderId) ||
    !doc.hostname
  ) {
    return doc
  }

  console.log('Populating dflowVpsDetails for server', doc.id)

  try {
    // Get the access token from the cloud provider account
    let token: string | undefined
    if (typeof doc.cloudProviderAccount === 'object') {
      token = doc.cloudProviderAccount?.dFlowDetails?.accessToken
    } else {
      const { dFlowDetails } = await payload.findByID({
        collection: 'cloudProviderAccounts',
        id: doc.cloudProviderAccount ?? '',
      })
      token = dFlowDetails?.accessToken
    }

    if (!token) {
      console.warn(`No access token found for server ${doc.id}`)
      return doc
    }

    // Fetch instance status using hostname (nested in instanceResponse.name)
    const instanceStatusRes = await dFlowRestSdk.find(
      {
        collection: 'vpsOrders',
        limit: 1,
        where: {
          'instanceResponse.name': {
            equals: doc.hostname,
          },
        },
      },
      {
        headers: {
          Authorization: `${DFLOW_CONFIG.AUTH_SLUG} API-Key ${token}`,
        },
      },
    )

    // Check if we got a valid response with data
    if (
      !instanceStatusRes?.docs ||
      !Array.isArray(instanceStatusRes.docs) ||
      instanceStatusRes.docs.length === 0
    ) {
      console.warn(`No instance found for hostname ${doc.hostname}`)
      return doc
    }

    const instanceData = instanceStatusRes.docs[0]

    console.log(instanceData)

    // Extract relevant data from the instance based on the actual response structure
    const dflowVpsDetails = {
      orderId: instanceData.id || null, // The order ID is the document ID
      instanceId: instanceData.instanceId || null,
      status: (instanceData.instanceResponse as any)?.status || 'unknown', // Status is nested in instanceResponse
      next_billing_date: instanceData.next_billing_date
        ? new Date(instanceData.next_billing_date).toISOString()
        : null,
    }

    console.log({ dflowVpsDetails })

    // Update the server with the dflowVpsDetails
    await payload.update({
      collection: 'servers',
      id: doc.id,
      data: {
        dflowVpsDetails,
      },
    })

    // Update the doc object to reflect the changes
    doc.dflowVpsDetails = dflowVpsDetails

    console.log(
      `Successfully populated dflowVpsDetails for server ${doc.id} with hostname ${doc.hostname}`,
    )
  } catch (error) {
    console.error(
      `Error populating dflowVpsDetails for server ${doc.id} with hostname ${doc.hostname}:`,
      error,
    )
  }

  return doc
}
