'use server'

import { revalidatePath } from 'next/cache'

import { protectedClient } from '@/lib/safe-action'

import {
  createRoleSchema,
  deleteRoleSchema,
  permissionsSchema,
  updatePermissionsSchema,
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
  .schema(updatePermissionsSchema)
  .action(async ({ ctx, clientInput }) => {
    const {
      userTenant: { tenant },
      payload,
    } = ctx

    const {
      id,
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
    } = clientInput

    const response = await payload.update({
      collection: 'roles',
      id: id,
      data: {
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
  .schema(createRoleSchema)
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

    // const parsedProjects = permissionsSchema.parse(projects)
    // const parsedServices = permissionsSchema.parse(services)
    // const parsedServers = permissionsSchema.parse(servers)
    // const parsedTemplates = permissionsSchema.parse(templates)

    const response = await payload.create({
      collection: 'roles',
      data: {
        name,
        description,
        projects: permissionsSchema.parse(projects),
        servers: permissionsSchema.parse(services),
        services: permissionsSchema.parse(servers),
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
        createdUser: user?.id,
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
  .schema(deleteRoleSchema)
  .action(async ({ ctx, clientInput }) => {
    const {
      payload,
      userTenant: { tenant },
    } = ctx
    const { id } = clientInput

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
