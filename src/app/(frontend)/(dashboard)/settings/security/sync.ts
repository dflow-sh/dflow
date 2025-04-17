'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { SecurityGroup } from '@/payload-types'

interface SyncItem {
  id: string
  name: string
  type: 'SecurityGroup'
  status: 'pending' | 'failed' | 'outOfSync'
  lastModified: Date
}

export async function getUnsyncedItems(): Promise<SecurityGroup[]> {
  const payload = await getPayload({ config: configPromise })

  // Get security groups with versions or failed status
  const { docs: securityGroups } = await payload.find({
    collection: 'securityGroups',
    where: {
      syncStatus: {
        not_equals: 'in-sync',
      },
    },
    pagination: false,
  })

  return securityGroups
}

export async function syncAllItems(): Promise<SecurityGroup[]> {
  const payload = await getPayload({ config: configPromise })
  const unsyncedItems = await getUnsyncedItems()

  const response = await Promise.allSettled(
    unsyncedItems.map(item =>
      payload.update({
        collection: 'securityGroups',
        id: item.id,
        data: {
          syncStatus: 'in-sync',
          lastSyncedAt: new Date().toISOString(),
        },
      }),
    ),
  )

  // Filter out successfully updated items and map to SecurityGroup
  const syncedItems: SecurityGroup[] = response
    .filter(
      (r): r is PromiseFulfilledResult<SecurityGroup> =>
        r.status === 'fulfilled',
    )
    .map(r => r.value)

  return syncedItems
}
