import type { FieldHook, Where } from 'payload'
import {
  Config,
  adjectives,
  animals,
  uniqueNamesGenerator,
} from 'unique-names-generator'

import { extractID } from '@/lib/extractID'

export const ensureUniqueName: FieldHook = async ({
  data,
  originalDoc,
  req,
  value,
}) => {
  // if value is unchanged, skip validation
  if (originalDoc?.name === value) {
    return value
  }

  const constraints: Where[] = [
    {
      name: {
        equals: value,
      },
    },
  ]

  const incomingTenantID = extractID(data?.tenant)
  const currentTenantID = extractID(originalDoc?.tenant)
  const tenantIDToMatch = incomingTenantID || currentTenantID

  if (tenantIDToMatch) {
    constraints.push({
      tenant: {
        equals: tenantIDToMatch,
      },
    })
  }

  const findDuplicateSSHKeys = await req.payload.find({
    collection: 'projects',
    where: {
      and: constraints,
    },
  })

  if (findDuplicateSSHKeys.docs.length > 0 && req.user) {
    const nameConfig: Config = {
      dictionaries: [adjectives, animals],
      separator: '-',
      length: 2,
      style: 'lowerCase',
    }

    const uniqueName = uniqueNamesGenerator(nameConfig)

    return `${value}-${uniqueName}`
  }

  return value
}
