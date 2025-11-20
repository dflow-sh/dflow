import type { FieldHook, Where } from 'payload'
import { ValidationError } from 'payload'

import { extractID } from '@/lib/extractID'
import { getUserTenantIDs } from '@/lib/getUserTenantIDs'

export const ensureUniqueIP: FieldHook = async ({
  data,
  originalDoc,
  req,
  value,
}) => {
  // if value is unchanged, skip validation
  if (originalDoc?.ip === value) {
    return value
  }

  const constraints: Where[] = [
    {
      ip: {
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

  const findDuplicateServers = await req.payload.find({
    collection: 'servers',
    where: {
      and: constraints,
    },
  })

  if (findDuplicateServers.docs.length > 0 && req.user) {
    // if the user is an admin or has access to more than 1 tenant
    // provide a more specific error message
    const tenantIDs = getUserTenantIDs(req.user)

    if (req.user.role?.includes('admin') || tenantIDs.length > 1) {
      const attemptedTenantChange = await req.payload.findByID({
        id: tenantIDToMatch,
        collection: 'tenants',
      })

      throw new ValidationError({
        errors: [
          {
            message: `The "${attemptedTenantChange.name}" tenant already has a server with the IP "${value}". IP must be unique per tenant.`,
            path: 'ip',
          },
        ],
      })
    }

    throw new ValidationError({
      errors: [
        {
          message: `A server with IP ${value} already exists. IP must be unique.`,
          path: 'ip',
        },
      ],
    })
  }

  return value
}
