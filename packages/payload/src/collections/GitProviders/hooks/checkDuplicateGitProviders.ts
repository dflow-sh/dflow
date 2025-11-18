import { CollectionBeforeValidateHook } from 'payload'

import { GitProvider } from '@/payload-types'

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

export const checkDuplicateGitProviders: CollectionBeforeValidateHook<
  GitProvider
> = async ({ data, req, operation, originalDoc }) => {
  const { payload } = req

  let tenantId: string
  try {
    tenantId = getTenantId(data, req)
  } catch (error) {
    throw new Error(
      'Tenant information is required to create or update git providers',
    )
  }

  const validationErrors: string[] = []

  // Get all git providers for the tenant
  const baseQuery = {
    tenant: { equals: tenantId },
  }

  const allProviders = await payload.find({
    collection: 'gitProviders',
    where: baseQuery,
    limit: 0, // Get all records
  })

  // Filter out the current document if updating
  const existingProviders = allProviders.docs.filter(provider => {
    if (operation === 'update' && originalDoc?.id) {
      return provider.id !== originalDoc.id
    }
    return true
  })

  // Check for duplicate provider credentials based on provider type
  if (data?.type === 'github' && data?.github) {
    const githubProviders = existingProviders.filter(
      provider => provider.type === 'github',
    )

    // Check for duplicate app configurations
    if (data.github.appId) {
      const duplicateByAppId = githubProviders.find(
        provider => provider.github?.appId === data.github?.appId,
      )

      if (duplicateByAppId) {
        validationErrors.push(
          `This GitHub App ID (${data.github.appId}) is already configured in this tenant.`,
        )
      }
    }

    if (data.github.clientId) {
      const duplicateByClientId = githubProviders.find(
        provider => provider.github?.clientId === data.github?.clientId,
      )

      if (duplicateByClientId) {
        validationErrors.push(
          `This GitHub Client ID is already configured in this tenant.`,
        )
      }
    }

    if (data.github.installationId) {
      const duplicateByInstallationId = githubProviders.find(
        provider =>
          provider.github?.installationId === data.github?.installationId,
      )

      if (duplicateByInstallationId) {
        validationErrors.push(
          `This GitHub Installation ID is already configured in this tenant.`,
        )
      }
    }
  }

  // Throw error with all validation issues
  if (validationErrors.length > 0) {
    throw new Error(`Validation failed: ${validationErrors.join('; ')}`)
  }

  return data
}
