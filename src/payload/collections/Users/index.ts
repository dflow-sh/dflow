import { tenantsArrayField } from '@payloadcms/plugin-multi-tenant/fields'
import type { CollectionConfig } from 'payload'

import { isDemoEnvironment } from '@/lib/constants'
import { isAdmin } from '@/payload/access/isAdmin'

import { beforeCreateHandleOnboarding } from './hooks/beforeCreateHandleOnboarding'

const defaultTenantArrayField = tenantsArrayField({
  tenantsArrayFieldName: 'tenants',
  tenantsArrayTenantFieldName: 'tenant',
  tenantsCollectionSlug: 'tenants',
  arrayFieldAccess: {
    //update access controls
    read: () => true,
    update: () => true,
    create: () => true,
  },
  tenantFieldAccess: {
    read: () => true,
    update: () => true,
    create: () => true,
  },
  rowFields: [
    {
      name: 'roles',
      type: 'select',
      defaultValue: ['tenant-user'],
      hasMany: true,
      options: ['tenant-admin', 'tenant-user'],
      label: 'Tenant Roles',
      required: true,
    },
  ],
})
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Users & Tenants',
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7,
    useAPIKey: true,
  },
  hooks: {
    beforeChange: [beforeCreateHandleOnboarding],
  },
  access: {
    admin: async ({ req }) => {
      const { user } = req

      if (user?.role?.includes('admin') && !Boolean(isDemoEnvironment)) {
        return true
      }

      return false
    },
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    unlock: isAdmin,
  },
  fields: [
    {
      name: 'username',
      label: 'Username',
      type: 'text',
      saveToJWT: true,
      unique: true,
    },
    {
      name: 'onboarded',
      type: 'checkbox',
      label: 'Onboarded',
      defaultValue: false,
    },
    {
      name: 'role',
      type: 'select',
      options: ['admin', 'user', 'demo'],
      hasMany: true,
      saveToJWT: true,
      defaultValue: 'user',
    },
    {
      ...defaultTenantArrayField,
      admin: {
        ...(defaultTenantArrayField?.admin || {}),
        position: 'sidebar',
      },
    },
    {
      name: 'discord',
      type: 'group',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      fields: [
        {
          name: 'discordId',
          type: 'text',
          label: 'Discord ID',
        },
        {
          name: 'discordUsername',
          type: 'text',
          label: 'Discord Username',
        },
        {
          name: 'discordGlobalName',
          type: 'text',
          label: 'Discord Global Name',
        },
        {
          name: 'discordDiscriminator',
          type: 'text',
          label: 'Discord Discriminator',
        },
        {
          name: 'discordAvatarUrl',
          type: 'text',
          label: 'Discord Avatar Url',
        },
      ],
    },
  ],
}
