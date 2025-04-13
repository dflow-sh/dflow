'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

interface SyncItem {
  id: string
  name: string
  type: 'SecurityGroup'
  status: 'pending' | 'failed' | 'outOfSync'
  lastModified: Date
}

export async function getUnsyncedItems(): Promise<SyncItem[]> {
  const payload = await getPayload({ config: configPromise })

  // Get security groups with versions or failed status
  const securityGroups = await payload.find({
    collection: 'securityGroups',
    where: {
      or: [
        { _status: { equals: 'draft' } },
        { syncStatus: { equals: 'failed' } },
        { updatedAt: { greater_than: 'lastSyncedAt' } },
      ],
    },
    pagination: false,
  })

  return [
    ...securityGroups.docs.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: 'SecurityGroup' as const,
      status: doc.syncStatus === 'failed' ? 'failed' : 'outOfSync',
      lastModified: doc.updatedAt,
    })),
  ]
}

export async function syncAllItems(): Promise<{
  success: boolean
  results: SyncItem[]
}> {
  const payload = await getPayload({ config: configPromise })
  const unsyncedItems = await getUnsyncedItems()
  const results: SyncItem[] = []

  for (const item of unsyncedItems) {
    try {
      if (item.type === 'SecurityGroup') {
        // Trigger the beforeChange hook by updating the document
        const result = await payload.update({
          collection: 'securityGroups',
          id: item.id,
          data: {
            syncStatus: 'in-sync',
            lastSyncedAt: new Date().toISOString(),
          },
        })
      } else if (item.type === 'SSHKey') {
        // Add similar sync logic for SSH keys
        const result = await payload.update({
          collection: 'sshKeys',
          id: item.id,
          data: {
            syncStatus: 'in-sync',
            lastSyncedAt: new Date().toISOString(),
          },
        })
      }

      results.push({ ...item, status: 'in-sync' })
    } catch (error) {
      console.error(`Failed to sync ${item.type} ${item.id}:`, error)
      results.push({ ...item, status: 'failed' })
    }
  }

  return {
    success: results.every(item => item.status === 'in-sync'),
    results,
  }
}
