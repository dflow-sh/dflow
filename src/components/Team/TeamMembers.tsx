'use client'

import { Avatar, AvatarFallback } from '../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Form, FormField, FormItem, FormMessage } from '../ui/form'
import { MultiSelect } from '../ui/multi-select'
import { zodResolver } from '@hookform/resolvers/zod'
import { EllipsisVertical } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { removeUserFromTeamAction, updateUserTenantRoles } from '@/actions/team'
import {
  updateTenantRolesSchema,
  updateTenantRolesType,
} from '@/actions/team/validator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tenant, User } from '@/payload-types'

const TeamMembers = ({ teamMembers }: { teamMembers: User[] | undefined }) => {
  const { organisation } = useParams()

  return (
    <div>
      <h3 className='mb-1 text-lg font-medium'>Workspace Members</h3>
      <p className='mb-2 text-muted-foreground'>
        Invite and manage team members with specific roles. Control access by
        assigning Admin or Member permissions.
      </p>
      <div className='overflow-hidden rounded-lg border border-border'>
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
                  key={index}
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
}: {
  teamMember: User
  organisation: string
}) => {
  const { execute: updateTenantRoles, isPending: isUpdateTenantRolesPending } =
    useAction(updateUserTenantRoles, {
      onSuccess: () => {
        toast.success('Roles updated successfully')
      },
      onError: () => {
        toast.error('Failed to updated roles')
      },
    })
  const {
    execute: removeUserFromTeam,
    isPending: isRemoveUserFromTeamPending,
  } = useAction(removeUserFromTeamAction, {
    onSuccess: () => {
      toast.success('Team member removed successfully')
    },
    onError: () => {
      toast.error('Failed to remove team member')
    },
  })
  const roles = teamMember.tenants?.find(
    tenant => (tenant.tenant as Tenant)?.slug === organisation,
  )?.roles

  const form = useForm<updateTenantRolesType>({
    resolver: zodResolver(updateTenantRolesSchema),
    defaultValues: {
      roles: roles,
      user: teamMember,
    },
  })

  const onSubmit = (data: updateTenantRolesType) => {
    updateTenantRoles({
      roles: data.roles,
      user: data.user,
    })
  }
  return (
    <TableRow>
      <TableCell className='font-medium'>
        <div className='flex items-center gap-x-2'>
          <Avatar className='size-10'>
            <AvatarFallback className='rounded-lg uppercase group-hover:text-accent'>
              {teamMember.email.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h6 className='text-md font-medium capitalize'>
              {teamMember?.username}
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
              name='roles'
              render={({ field }) => (
                <FormItem>
                  <MultiSelect
                    options={[
                      {
                        label: 'Member',
                        value: 'tenant-user',
                      },
                      {
                        label: 'Admin',
                        value: 'tenant-admin',
                      },
                    ]}
                    disabled={isUpdateTenantRolesPending}
                    onValueChange={(value: string[]) => {
                      form.setValue(
                        'roles',
                        value as ('tenant-user' | 'tenant-admin')[],
                      )
                      form.handleSubmit(onSubmit)()
                    }}
                    defaultValue={field.value || []}
                    placeholder='Select Roles'
                    variant='inverted'
                    maxCount={3}
                    className='w-72'
                  />
                  <FormMessage className='my-0 py-0' />
                </FormItem>
              )}
            />
            {/* <MultiSelect
          options={[
            {
              label: 'Member',
              value: 'tenant-user',
            },
            {
              label: 'Admin',
              value: 'tenant-admin',
            },
          ]}
          onValueChange={() => {}}
          defaultValue={roles}
          placeholder='Select Roles'
          variant='inverted'
          maxCount={1}
          className='w-72'
        /> */}
          </form>
        </Form>
      </TableCell>

      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={
              isRemoveUserFromTeamPending ||
              teamMember.username === organisation
            }>
            <EllipsisVertical className='text-muted-foreground' />
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() =>
                  removeUserFromTeam({ user: teamMember, roles: roles! })
                }>
                {isRemoveUserFromTeamPending
                  ? ' Removing'
                  : ' Remove from team'}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
