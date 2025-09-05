import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { updateRolePermissionsAction } from '@/actions/roles'
import {
  updatePermissionsSchema,
  updatePermissionsType,
} from '@/actions/roles/validator'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Role } from '@/payload-types'

import PermissionsTable from './PermissionsTable'

const RolePermissions = ({ role }: { role: Role }) => {
  const form = useForm<updatePermissionsType>({
    resolver: zodResolver(updatePermissionsSchema),
    defaultValues: {
      id: role.id,
      projects: role.projects,
      servers: role.servers,
      services: role.services,
      templates: role.templates,
      backups: role.backups,
      cloudProviderAccounts: role.cloudProviderAccounts,
      dockerRegistries: role.dockerRegistries,
      gitProviders: role.gitProviders,
      roles: role.roles,
      securityGroups: role.securityGroups,
      sshKeys: role.sshKeys,
      team: role.team,
    },
  })

  const {
    execute: updateRolePermissions,
    isPending: isUpdateRolePermissionsPending,
  } = useAction(updateRolePermissionsAction, {
    onSuccess: () => {
      toast.success('Role permissions updated successfully')
    },
    onError: ({ error }) => {
      toast.error(`Failed to update permissions ${error?.serverError}`)
      form.reset()
    },
  })

  const onSubmit = (data: updatePermissionsType) => {
    updateRolePermissions({
      ...data,
    })
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className='border-border overflow-hidden rounded-lg border'>
          <PermissionsTable form={form as any} />
          {/* !Todo: need proper type safety */}
        </div>
        <div className='mt-4 flex items-center justify-end'>
          <Button
            size={'sm'}
            type='submit'
            disabled={isUpdateRolePermissionsPending}
            isLoading={isUpdateRolePermissionsPending}>
            Update
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default RolePermissions
