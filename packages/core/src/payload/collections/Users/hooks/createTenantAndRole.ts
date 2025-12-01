import { CollectionBeforeChangeHook } from 'payload'

import { User } from '@dflow/core/payload-types'

export const createTenantAndRole: CollectionBeforeChangeHook<User> = async ({
  collection,
  operation,
  data,
  req,
}) => {
  if (operation === 'create') {
    const { payload } = req

    try {
      const tenant = await payload.create({
        collection: 'tenants',
        data: {
          name: data.username!,
          slug: data?.username!,
          subdomain: data?.username!,
        },
      })

      const role = await payload.create({
        collection: 'roles',
        data: {
          name: 'Admin',
          isAdminRole: true,
          backups: {
            create: true,
            delete: true,
            read: true,
            update: true,
          },
          cloudProviderAccounts: {
            create: true,
            delete: true,
            read: true,
            update: true,
          },
          dockerRegistries: {
            create: true,
            delete: true,
            read: true,
            update: true,
          },
          gitProviders: {
            create: true,
            delete: true,
            read: true,
            update: true,
          },
          projects: {
            create: true,
            delete: true,
            read: true,
            update: true,
          },
          roles: {
            create: true,
            delete: true,
            read: true,
            update: true,
          },
          securityGroups: {
            create: true,
            delete: true,
            read: true,
            update: true,
          },
          servers: {
            create: true,
            delete: true,
            read: true,
            update: true,
          },
          services: {
            create: true,
            delete: true,
            read: true,
            update: true,
          },
          sshKeys: {
            create: true,
            delete: true,
            read: true,
            update: true,
          },
          team: {
            create: true,
            delete: true,
            read: true,
            update: true,
          },
          templates: {
            create: true,
            delete: true,
            read: true,
            update: true,
          },
          type: 'management',
          description:
            'Full access to manage projects, services, and all other features.',
          tags: ['Admin', 'Full Access'],
          tenant: tenant,
        },
      })

      return {
        ...data,
        tenants: [{ tenant: tenant.id, role: role.id }],
      }
    } catch (error) {
      console.log(`Failed to create role or tenant`, error)
      throw error
    }
  }
  return data
}
