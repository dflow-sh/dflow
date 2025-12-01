'use client'

import { Avatar, AvatarFallback } from '../ui/avatar'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { EllipsisVertical } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  removeUserFromTeamAction,
  updateUserTenantRolesAction,
} from '@dflow/core/actions/team'
import {
  updateTenantRolesSchema,
  updateTenantRolesType,
} from '@dflow/core/actions/team/validator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@dflow/core/components/ui/table'
import { Role, Tenant, User } from '@dflow/core/payload-types'

const TeamMembers = ({
  teamMembers,
  roles,
}: {
  teamMembers: User[] | undefined
  roles: Role[]
}) => {
  const { organisation } = useParams()

  return (
    <div>
      <h3 className='mb-1 text-lg font-medium'>Workspace Members</h3>
      <p className='text-muted-foreground mb-2'>
        Invite and manage team members with specific roles. Control access by
        assigning Admin or Member permissions.
      </p>
      <div className='border-border overflow-hidden rounded-lg border'>
        <Table className='w-full'>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers && teamMembers?.length > 0 ? (
              teamMembers?.map((teamMember, index) => (
                <TeamMember
                  availableRoles={roles}
                  key={teamMember.id}
                  organisation={organisation as string}
                  teamMember={teamMember}
                />
              ))
            ) : (
              <TableRow>
                <TableCell>Invite your first team member</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default TeamMembers

const TeamMember = ({
  teamMember,
  organisation,
  availableRoles,
}: {
  teamMember: User
  organisation: string
  availableRoles: Role[]
}) => {
  const role = teamMember.tenants?.find(
    tenant => (tenant.tenant as Tenant)?.slug === organisation,
  )?.role

  const form = useForm<updateTenantRolesType>({
    resolver: zodResolver(updateTenantRolesSchema),
    defaultValues: {
      role: (role as Role)?.id,
      user: teamMember,
    },
  })

  const { execute: updateTenantRoles, isPending: isUpdateTenantRolesPending } =
    useAction(updateUserTenantRolesAction, {
      onSuccess: () => {
        toast.success('Role updated successfully')
      },
      onError: ({ error }) => {
        toast.error(`Failed to updated role ${error?.serverError}`)
        form.reset()
      },
    })

  const {
    execute: removeUserFromTeam,
    isPending: isRemoveUserFromTeamPending,
  } = useAction(removeUserFromTeamAction, {
    onSuccess: () => {
      toast.success('Team member removed successfully')
    },
    onError: ({ error }) => {
      toast.error(`Failed to remove team member ${error?.serverError}`)
    },
  })

  const onSubmit = (data: updateTenantRolesType) => {
    updateTenantRoles({
      role: data.role,
      user: data.user,
    })
  }
  const isTeamOwner = teamMember.username === organisation
  return (
    <TableRow>
      <TableCell className='font-medium'>
        <div className='flex items-center gap-x-2'>
          <Avatar className='size-10'>
            <AvatarFallback className='group-hover:text-accent rounded-lg uppercase'>
              {teamMember.email.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h6 className='text-md font-medium capitalize'>
              {teamMember?.username}{' '}
              {isTeamOwner && (
                <span className='text-muted-foreground text-xs'>(you)</span>
              )}
            </h6>
            <p className='text-muted-foreground'>{teamMember?.email}</p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <Select
                    disabled={isUpdateTenantRolesPending}
                    onValueChange={(value: string) => {
                      form.setValue('role', value)
                      form.handleSubmit(onSubmit)()
                    }}
                    {...field}>
                    <FormControl>
                      <SelectTrigger className='w-56'>
                        <SelectValue placeholder='Select role' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRoles.length > 0 ? (
                        availableRoles.map(role => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value={form.getValues('role')}>
                          {(role as Role)?.name}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className='my-0 py-0' />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </TableCell>

      <TableCell>
        {!isTeamOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={isRemoveUserFromTeamPending || isTeamOwner}>
              <Button variant='ghost' size='icon'>
                <EllipsisVertical className='text-muted-foreground size-6' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant='destructive'
                  onSelect={e => e.preventDefault()}
                  onClick={() =>
                    removeUserFromTeam({
                      user: teamMember,
                      role: (role as Role)?.id,
                    })
                  }>
                  {isRemoveUserFromTeamPending
                    ? ' Removing from team'
                    : ' Remove from team'}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>
    </TableRow>
  )
}
