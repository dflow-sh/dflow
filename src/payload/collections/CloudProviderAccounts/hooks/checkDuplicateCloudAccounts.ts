import { CollectionBeforeValidateHook } from 'payload'

import { CloudProviderAccount } from '@/payload-types'

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

export const checkDuplicateCloudAccounts: CollectionBeforeValidateHook<
  CloudProviderAccount
> = async ({ data, req, operation, originalDoc }) => {
  const { payload } = req

  let tenantId: string
  try {
    tenantId = getTenantId(data, req)
  } catch (error) {
    throw new Error(
      'Tenant information is required to create or update cloud provider accounts',
    )
  }

  const validationErrors: string[] = []

  // Get all cloud provider accounts for the tenant
  const baseQuery = {
    tenant: { equals: tenantId },
  }

  const allAccounts = await payload.find({
    collection: 'cloudProviderAccounts',
    where: baseQuery,
    limit: 0,
  })

  // Filter out the current document if updating
  const existingAccounts = allAccounts.docs.filter(account => {
    if (operation === 'update' && originalDoc?.id) {
      return account.id !== originalDoc.id
    }
    return true
  })

  // 1. Check for duplicate names within the same tenant AND same account type
  if (data?.name && data?.type) {
    const duplicateByName = existingAccounts.find(
      account => account.name === data.name && account.type === data.type,
    )

    if (duplicateByName) {
      validationErrors.push(
        `Account name "${data.name}" is already in use for ${data.type} accounts in this tenant`,
      )
    }
  }

  // 2. Check for duplicate account credentials/tokens based on provider type
  if (data?.type) {
    // Filter existing accounts by the same provider type
    const existingAccountsOfSameType = existingAccounts.filter(
      account => account.type === data.type,
    )

    switch (data.type) {
      case 'dFlow':
        if (data.dFlowDetails?.accessToken) {
          const duplicateAccount = existingAccountsOfSameType.find(
            account =>
              account.dFlowDetails?.accessToken ===
              data.dFlowDetails?.accessToken,
          )

          if (duplicateAccount) {
            validationErrors.push(
              `This dFlow account is already connected as "${duplicateAccount.name}". Each account can only be connected once per tenant.`,
            )
          }
        }
        break

      case 'aws':
        if (data.awsDetails?.accessKeyId && data.awsDetails?.secretAccessKey) {
          const duplicateAccount = existingAccountsOfSameType.find(
            account =>
              account.awsDetails?.accessKeyId ===
                data.awsDetails?.accessKeyId &&
              account.awsDetails?.secretAccessKey ===
                data.awsDetails?.secretAccessKey,
          )

          if (duplicateAccount) {
            validationErrors.push(
              `This AWS account is already connected as "${duplicateAccount.name}". Each account can only be connected once per tenant.`,
            )
          }
        }
        break

      case 'azure':
        if (
          data.azureDetails?.clientId &&
          data.azureDetails?.tenantId &&
          data.azureDetails?.subscriptionId
        ) {
          const duplicateAccount = existingAccountsOfSameType.find(
            account =>
              account.azureDetails?.clientId === data.azureDetails?.clientId &&
              account.azureDetails?.tenantId === data.azureDetails?.tenantId &&
              account.azureDetails?.subscriptionId ===
                data.azureDetails?.subscriptionId,
          )

          if (duplicateAccount) {
            validationErrors.push(
              `This Azure account is already connected as "${duplicateAccount.name}". Each account can only be connected once per tenant.`,
            )
          }
        }
        break

      case 'gcp':
        if (data.gcpDetails?.serviceAccountKey) {
          const duplicateAccount = existingAccountsOfSameType.find(
            account =>
              account.gcpDetails?.serviceAccountKey ===
              data.gcpDetails?.serviceAccountKey,
          )

          if (duplicateAccount) {
            validationErrors.push(
              `This GCP service account is already connected as "${duplicateAccount.name}". Each service account can only be connected once per tenant.`,
            )
          }
        }
        break

      case 'digitalocean':
        if (data.digitaloceanDetails?.accessToken) {
          const duplicateAccount = existingAccountsOfSameType.find(
            account =>
              account.digitaloceanDetails?.accessToken ===
              data.digitaloceanDetails?.accessToken,
          )

          if (duplicateAccount) {
            validationErrors.push(
              `This DigitalOcean account is already connected as "${duplicateAccount.name}". Each account can only be connected once per tenant.`,
            )
          }
        }
        break
    }
  }

  // Throw error with all validation issues
  if (validationErrors.length > 0) {
    throw new Error(`Validation failed: ${validationErrors.join('; ')}`)
  }

  return data
}
