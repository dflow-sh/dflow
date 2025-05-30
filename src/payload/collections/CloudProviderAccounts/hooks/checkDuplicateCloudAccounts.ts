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

  const baseQuery = {
    tenant: { equals: tenantId },
    ...(operation === 'update' && originalDoc?.id
      ? { id: { not_equals: originalDoc.id } }
      : {}),
  }

  // 1. Check for duplicate names within the same tenant AND same account type
  if (data?.name && data?.type) {
    const nameQuery = {
      ...baseQuery,
      name: { equals: data.name },
      type: { equals: data.type }, // Added type filter
    }

    const existingByName = await payload.find({
      collection: 'cloudProviderAccounts',
      where: nameQuery,
      limit: 1,
    })

    if (existingByName.docs.length > 0) {
      validationErrors.push(
        `Account name "${data.name}" is already in use for ${data.type} accounts in this tenant`,
      )
    }
  }

  // 2. Check for duplicate account credentials/tokens based on provider type
  if (data?.type) {
    const providerBaseQuery = {
      ...baseQuery,
      type: { equals: data.type },
    }

    switch (data.type) {
      case 'dFlow':
        if (data.dFlowDetails?.accessToken) {
          const allDflowAccounts = await payload.find({
            collection: 'cloudProviderAccounts',
            where: providerBaseQuery,
            limit: 0,
          })

          // Check if any existing account has the same access token
          const duplicateAccount = allDflowAccounts.docs.find(
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
          const allAwsAccounts = await payload.find({
            collection: 'cloudProviderAccounts',
            where: providerBaseQuery,
            limit: 0,
          })

          const duplicateAccount = allAwsAccounts.docs.find(
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
          const allAzureAccounts = await payload.find({
            collection: 'cloudProviderAccounts',
            where: providerBaseQuery,
            limit: 0,
          })

          const duplicateAccount = allAzureAccounts.docs.find(
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
          const allGcpAccounts = await payload.find({
            collection: 'cloudProviderAccounts',
            where: providerBaseQuery,
            limit: 0,
          })

          const duplicateAccount = allGcpAccounts.docs.find(
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
          const allDoAccounts = await payload.find({
            collection: 'cloudProviderAccounts',
            where: providerBaseQuery,
            limit: 0,
          })

          const duplicateAccount = allDoAccounts.docs.find(
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
