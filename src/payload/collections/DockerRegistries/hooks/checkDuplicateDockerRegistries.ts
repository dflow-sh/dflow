import { CollectionBeforeValidateHook } from 'payload'

import { DockerRegistry } from '@/payload-types'

const getTenantId = (data: any, req: any): string => {
  if (data?.tenant) {
    return typeof data.tenant === 'string' ? data.tenant : data.tenant.id
  }

  if (req.tenant) {
    return typeof req.tenant === 'string' ? req.tenant : req.tenant.id
  }

  if (req.user?.tenants && req.user.tenants.length > 0) {
    const adminTenant = req.user.tenants.find(
      (t: any) => t.roles && t.roles.includes('tenant-admin'),
    )
    const selectedTenant = adminTenant || req.user.tenants[0]
    return typeof selectedTenant.tenant === 'string'
      ? selectedTenant.tenant
      : selectedTenant.tenant.id
  }

  throw new Error('No tenant context available')
}

export const checkDuplicateDockerRegistries: CollectionBeforeValidateHook<
  DockerRegistry
> = async ({ data, req, operation, originalDoc }) => {
  const { payload } = req

  let tenantId: string
  try {
    tenantId = getTenantId(data, req)
  } catch (error) {
    throw new Error(
      'Tenant information is required to create or update docker registries',
    )
  }

  const validationErrors: string[] = []

  // Get all docker registries for the tenant
  const baseQuery = {
    tenant: { equals: tenantId },
  }

  const allRegistries = await payload.find({
    collection: 'dockerRegistries',
    where: baseQuery,
    limit: 0,
  })

  // Filter out the current document if updating
  const existingRegistries = allRegistries.docs.filter(registry => {
    if (operation === 'update' && originalDoc?.id) {
      return registry.id !== originalDoc.id
    }
    return true
  })

  // 1. Check for duplicate names within the same tenant AND same registry type
  if (data?.name && data?.type) {
    const duplicateByName = existingRegistries.find(
      registry => registry.name === data.name && registry.type === data.type,
    )

    if (duplicateByName) {
      validationErrors.push(
        `Registry name "${data.name}" is already in use for ${data.type} registries in this tenant`,
      )
    }
  }

  // 2. Check for duplicate registry credentials based on registry type and username
  if (data?.type && data?.username) {
    const duplicateByCredentials = existingRegistries.find(
      registry =>
        registry.type === data.type && registry.username === data.username,
    )

    if (duplicateByCredentials) {
      validationErrors.push(
        `This ${data.type} registry with username "${data.username}" is already connected as "${duplicateByCredentials.name}". Each registry account can only be connected once per tenant.`,
      )
    }
  }

  // Throw error with all validation issues
  if (validationErrors.length > 0) {
    throw new Error(`Validation failed: ${validationErrors.join('; ')}`)
  }

  return data
}
