import { FieldHook, Where } from 'payload'

import { extractID } from '@/lib/extractID'
import { generateRandomString } from '@/lib/utils'

export const ensureUniqueName: FieldHook = async ({
  data,
  req,
  originalDoc,
  value,
}) => {
  const { payload } = req

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

  const projectId =
    typeof data?.project === 'object' ? data?.project.id : data?.project

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

  const { docs: duplicateServices } = await req.payload.find({
    collection: 'services',
    where: {
      and: constraints,
    },
  })

  const projectDetails = await payload.findByID({
    id: projectId,
    collection: 'projects',
  })

  // add 10 character limit
  const slicedName = value.replace(`${projectDetails.name}-`, '').slice(0, 10)

  // in-case of duplicate service name change prefix
  if (duplicateServices.length > 0 && req.user) {
    // add a 4-random character generation
    const uniqueSuffix = generateRandomString({ length: 4 })
    return `${projectDetails.name}-${slicedName}-${uniqueSuffix}`
  }

  return `${projectDetails.name}-${slicedName}`
}
