import { DialogTitle } from '@radix-ui/react-dialog'
import { useAction } from 'next-safe-action/hooks'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { updateRolePermissionsAction } from '@dflow/actions/roles'
import { UpdateRoleType } from '@dflow/actions/roles/validator'
import { Button } from '@dflow/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@dflow/components/ui/dialog'
import { Role } from '@dflow/types'

import RoleDetails from './RoleDetails'

const UpdateRoleDetails = ({
  role,
  open,
  setOpen,
}: {
  role: Role
  open: boolean
  setOpen: (open: boolean) => void
}) => {
  const form = useForm<UpdateRoleType>({
    defaultValues: {
      id: role.id,
      name: role.name,
      description: role.description || '',
      type: role?.type ?? 'engineering',
      tags: role.tags,
      projects: role.projects,
      services: role.services,
      servers: role.servers,
      roles: role.roles,
      templates: role.templates,
      backups: role.backups,
      cloudProviderAccounts: role.cloudProviderAccounts,
      dockerRegistries: role.dockerRegistries,
      gitProviders: role.gitProviders,
      sshKeys: role.sshKeys,
      securityGroups: role.securityGroups,
      team: role.team,
    },
  })

  const { name, description, type } = useWatch({ control: form.control })

  const { execute: updateRoleDetails, isPending } = useAction(
    updateRolePermissionsAction,
    {
      onSuccess: () => {
        toast.success(`Role details updated Successfully`)
        setOpen(false)
      },
      onError: ({ error }) => {
        toast.error(`Failed to update details:${error?.serverError}`)
      },
    },
  )

  const onSubmit = (data: UpdateRoleType) => {
    updateRoleDetails({ ...data, isAdminRole: Boolean(role?.isAdminRole) })
  }
  return (
    <Dialog defaultOpen open={open} onOpenChange={setOpen}>
      <DialogContent onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Edit role details</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <RoleDetails form={form as any} />
            <DialogFooter className='pt-4'>
              <Button
                disabled={
                  !name?.trim() || !description?.trim() || !type || isPending
                }
                isLoading={isPending}>
                Update
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateRoleDetails
