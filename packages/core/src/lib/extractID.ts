import type { CollectionSlug } from 'payload'

import { Config } from '@dflow/core/payload-types'

export const extractID = <T extends Config['collections'][CollectionSlug]>(
  objectOrID: T | T['id'],
): T['id'] => {
  if (objectOrID && typeof objectOrID === 'object') return objectOrID.id

  return objectOrID
}
