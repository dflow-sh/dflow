'use server'

import { revalidatePath } from 'next/cache'

import { protectedClient } from '@dflow/shared/safe-action'

import {
  createRoleSchema,
  deleteRoleSchema,
  permissionsSchema,
  permissionsWithLimitSchema,
  updateRoleSchema,
} from './validator'

export const getRolesAction = protectedClient
  .metadata({
    actionName: 'getRolesAction',
  })
  .action(async ({ ctx }) => {
    const {
      userTenant: { tenant },
      payload,
    } = ctx

    const { docs: roles } = await payload.find({
      collection: 'roles',
      where: {
        and: [
          {
            'tenant.slug': {
              equals: tenant.slug,
            },
          },
        ],
      },
    })

    return roles
  })

export const updateRolePermissionsAction = protectedClient
  .metadata({
    actionName: 'updateRolePermissionsAction',
  })
  .inputSchema(updateRoleSchema)
  .action(async ({ ctx, clientInput }) => {
    const {
      userTenant: { tenant },
      payload,
    } = ctx

    const {
      id,
      description,
      name,
      tags,
      type,
      servers,
      templates,
      projects,
      services,
      backups,
      cloudProviderAccounts,
      dockerRegistries,
      gitProviders,
      roles,
      securityGroups,
      sshKeys,
      team,
      isAdminRole,
    } = clientInput

    if (isAdminRole) {
      throw new Error('Admin role updates are not allowed.')
    }

    const response = await payload.update({
      collection: 'roles',
      id: id,
      data: {
        name,
        description,
        type,
        tags,
        services,
        servers,
        projects,
        templates,
        backups,
        cloudProviderAccounts,
        roles,
        securityGroups,
        gitProviders,
        dockerRegistries,
        sshKeys,
        team,
      },
    })

    if (response) {
      revalidatePath(`/${tenant.slug}/team`)
    }
    return response
  })

export const createRoleAction = protectedClient
  .metadata({
    actionName: 'createRoleAction',
  })
  .inputSchema(createRoleSchema)
  .action(async ({ ctx, clientInput }) => {
    const {
      user,
      userTenant: { tenant },
      payload,
    } = ctx

    const {
      name,
      projects,
      services,
      servers,
      templates,
      roles,
      backups,
      securityGroups,
      gitProviders,
      cloudProviderAccounts,
      dockerRegistries,
      sshKeys,
      team,
      description,
      tags,
      type,
    } = clientInput

    const response = await payload.create({
      collection: 'roles',
      data: {
        name,
        description,
        projects: permissionsWithLimitSchema.parse(projects),
        servers: permissionsWithLimitSchema.parse(servers),
        services: permissionsSchema.parse(services),
        templates: permissionsSchema.parse(templates),
        roles: permissionsSchema.parse(roles),
        backups: permissionsSchema.parse(backups),
        gitProviders: permissionsSchema.parse(gitProviders),
        cloudProviderAccounts: permissionsSchema.parse(cloudProviderAccounts),
        dockerRegistries: permissionsSchema.parse(dockerRegistries),
        securityGroups: permissionsSchema.parse(securityGroups),
        sshKeys: permissionsSchema.parse(sshKeys),
        team: permissionsSchema.parse(team),
        tags,
        createdBy: user?.id,
        type,
        tenant: tenant,
      },
    })

    if (response) {
      revalidatePath(`/${tenant.slug}/team`)
    }
    return response
  })

export const deleteRoleAction = protectedClient
  .metadata({
    actionName: 'deleteRoleAction',
  })
  .inputSchema(deleteRoleSchema)
  .action(async ({ ctx, clientInput }) => {
    const {
      payload,
      userTenant: { tenant },
    } = ctx
    const { id, isAdminRole } = clientInput

    if (isAdminRole) {
      throw new Error('Admin role deletions are not allowed.')
    }

    const response = await payload.update({
      collection: 'roles',
      id,
      data: {
        deletedAt: new Date().toISOString(),
      },
    })

    if (response) {
      revalidatePath(`/${tenant.slug}/team`)
    }
    return response
  })
