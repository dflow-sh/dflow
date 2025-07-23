import { format } from 'date-fns'
import { CalendarRange, EllipsisVertical, Settings } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'
import { toast } from 'sonner'

import { deleteRoleAction } from '@/actions/roles'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Role, User } from '@/payload-types'

import { getBadgeVariant } from './RolesList'

const RoleActions = ({ role }: { role: Role }) => {
  const [deleteRoleOpen, setDeleteRoleOpen] = useState<boolean>(false)
  const { execute: deleteRole, isPending: isDeleteRolePending } = useAction(
    deleteRoleAction,
    {
      onSuccess: () => {
        toast.success('Role deleted successfully')
        setDeleteRoleOpen(false)
      },
      onError: ({ error }) => {
        toast.error(`Failed to delete role ${error?.serverError}`)
      },
    },
  )

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className='rounded-md border p-2 hover:bg-muted'>
          <EllipsisVertical className='size-5 text-muted-foreground' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => setDeleteRoleOpen(true)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* delete role */}
      <Dialog open={deleteRoleOpen} onOpenChange={setDeleteRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this role? This action cannot be
              undone and may affect user access permissions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => deleteRole({ id: role.id })}
              variant={'destructive'}
              disabled={isDeleteRolePending}
              isLoading={isDeleteRolePending}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

const RoleOverview = ({
  role,
  usersCount,
}: {
  role: Role
  usersCount: number
}) => {
  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
      <div className='space-y-4 rounded-2xl border bg-muted/10 p-4 text-center shadow-md'>
        <div className='flex justify-between'>
          <div className='flex gap-x-2'>
            <Settings className='size-6' />
            <h3 className='text-xl font-medium'>Basic Information</h3>
          </div>
          {/* <RoleActions role={role} /> */}
        </div>
        <div className='flex justify-between gap-6'>
          <p className='text-muted-foreground'>Name:</p>
          <p className='text-md max-w-[70%]'>{role?.name}</p>
        </div>
        <div className='flex justify-between gap-6'>
          <p className='text-muted-foreground'>Users:</p>
          <p className='text-md max-w-[70%]'>{usersCount}</p>
        </div>

        <div className='flex justify-between gap-6'>
          <p className='text-muted-foreground'>Department:</p>
          <Badge className='max-w-[70%]' variant={getBadgeVariant(role.type)}>
            {role?.type}
          </Badge>
        </div>
        <div className='flex justify-between gap-6'>
          <p className='text-muted-foreground'>Tags:</p>
          <div className='flex max-w-[70%] flex-wrap gap-2'>
            {role.tags &&
              role.tags?.map((tag, index) => (
                <Badge key={index} className='capitalize' variant={'outline'}>
                  {tag}
                </Badge>
              ))}
          </div>
        </div>
      </div>
      <div className='space-y-4 rounded-2xl border bg-muted/10 p-4 text-center shadow-md'>
        <div className='flex gap-x-2'>
          <CalendarRange className='size-6' />
          <h3 className='text-xl font-medium'>Timeline</h3>
        </div>
        <div className='flex justify-between gap-6'>
          <p className='text-muted-foreground'>Created:</p>
          <p className='text-md max-w-[70%]'>
            {format(new Date(role?.createdAt), 'd MMM yy')}
          </p>
        </div>
        <div className='flex justify-between gap-6'>
          <p className='text-muted-foreground'>Updated:</p>
          <p className='text-md max-w-[70%]'>
            {format(new Date(role?.updatedAt), 'd MMM yy')}
          </p>
        </div>
        {role?.createdUser && (
          <div className='flex justify-between gap-6'>
            <p className='text-muted-foreground'>Created by:</p>
            <div className='flex items-center gap-x-2'>
              <Avatar className='size-6'>
                <AvatarFallback className='rounded-lg uppercase group-hover:text-accent'>
                  {(role?.createdUser as User).email.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <p className='text-md capitalize'>
                {(role?.createdUser as User)?.username}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RoleOverview
