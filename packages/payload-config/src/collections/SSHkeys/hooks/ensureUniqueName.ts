import type { FieldHook, Where } from 'payload'
import { ValidationError } from 'payload'

import { extractID } from '@/lib/extractID'
import { getUserTenantIDs } from '@/lib/getUserTenantIDs'

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
    collection: 'sshKeys',
    where: {
      and: constraints,
    },
  })

  if (findDuplicateSSHKeys.docs.length > 0 && req.user) {
    const tenantIDs = getUserTenantIDs(req.user)

    // if the user is an admin or has access to more than 1 tenant
    // provide a more specific error message
    if (req.user.role?.includes('admin') || tenantIDs.length > 1) {
      const attemptedTenantChange = await req.payload.findByID({
        id: tenantIDToMatch,
        collection: 'tenants',
      })

      throw new ValidationError({
        errors: [
          {
            message: `The "${attemptedTenantChange.name}" tenant already has a SSH-key with "${value}". name must be unique per tenant.`,
            path: 'name',
          },
        ],
      })
    }

    throw new ValidationError({
      errors: [
        {
          message: `SSH-key ${value} already exists. name must be unique.`,
          path: 'name',
        },
      ],
    })
  }

  return value
}
