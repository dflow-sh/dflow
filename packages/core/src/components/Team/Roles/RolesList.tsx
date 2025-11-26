'use client'

import {
  EllipsisVertical,
  LockKeyhole,
  Pencil,
  Trash2,
  Users,
} from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'sonner'

import { deleteRoleAction } from "@core/actions/roles"
import AccessDeniedAlert from "@core/components/AccessDeniedAlert"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@core/components/ui/accordion"
import { Avatar, AvatarFallback } from "@core/components/ui/avatar"
import { Badge } from "@core/components/ui/badge"
import { Button } from "@core/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@core/components/ui/dropdown-menu"
import { ScrollArea } from "@core/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/components/ui/tabs"
import { Role, User } from "@core/payload-types"

import CreateNewRole from "@core/components/Team/Roles/CreateNewRole"
import RolePermissions from "@core/components/Team/Roles/RolePermissions"
import RoleUsers from "@core/components/Team/Roles/RoleUsers"
import UpdateRoleDetails from "@core/components/Team/Roles/UpdateRoleDetails"

const RoleActions = ({
  role,
  assignedUsers,
}: {
  role: Role
  assignedUsers: User[] | undefined
}) => {
  const [open, setOpen] = useState(false)
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
        <DropdownMenuTrigger
          disabled={Boolean(role?.isAdminRole)}
          onClickCapture={e => {
            e.stopPropagation()
          }}
          className='hover:bg-muted top-2 right-2 rounded-md border p-2'>
          <EllipsisVertical className='text-muted-foreground size-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem
            onClick={e => {
              e.stopPropagation()
              setOpen(true)
            }}>
            <Pencil className='h-3 w-3' />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant='destructive'
            onClick={e => {
              e.stopPropagation(), setDeleteRoleOpen(true)
            }}>
            <Trash2 className='h-3 w-3' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Edit role details  */}
      <UpdateRoleDetails open={open} setOpen={setOpen} role={role} />
      {/* Delete role */}
      <Dialog open={deleteRoleOpen} onOpenChange={setDeleteRoleOpen}>
        <DialogContent
          onClick={e => {
            e.stopPropagation()
          }}>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              {assignedUsers && assignedUsers.length > 0
                ? 'In order to delete this role, you must first assign a different role to all users currently associated with it. Once no users are linked to this role, you can proceed with deletion'
                : 'Are you sure you want to delete this role? This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          {assignedUsers && assignedUsers?.length > 0 && (
            <ScrollArea className='h-52'>
              <div className='space-y-2 pt-2'>
                {assignedUsers.map(member => (
                  <div className='bg-foreground/5 flex items-center gap-x-2 rounded-md border p-2'>
                    <Avatar className='h-9 w-9 rounded-full'>
                      {member?.avatarUrl ? (
                        <Image
                          src={member.avatarUrl || ''}
                          alt='User avatar'
                          width={32}
                          height={32}
                          className='h-full w-full rounded-full object-cover'
                          loading='lazy'
                          unoptimized
                        />
                      ) : (
                        <AvatarFallback className='rounded-lg uppercase'>
                          {member.email.slice(0, 1)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h6 className='text-md font-medium capitalize'>
                        {member?.username}
                      </h6>
                      <p className='text-muted-foreground'>{member?.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button
              onClick={() =>
                deleteRole({
                  id: role.id,
                  isAdminRole: Boolean(role?.isAdminRole),
                })
              }
              variant={'destructive'}
              disabled={
                isDeleteRolePending ||
                (assignedUsers && assignedUsers.length > 0)
              }
              isLoading={isDeleteRolePending}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const getBadgeVariant = (type: Role['type']) => {
  switch (type) {
    case 'engineering':
      return 'info'
    case 'management':
      return 'warning'
    case 'marketing':
      return 'success'
    case 'finance':
      return 'destructive'
    case 'sales':
      return 'secondary'
    default:
      return 'default'
  }
}

const RoleDetails = ({
  role,
  teamMembers,
}: {
  role: Role
  teamMembers: User[] | undefined
}) => {
  const assignedUsers = teamMembers?.filter(teamMember =>
    (teamMember as User)?.tenants?.some(
      tenant => (tenant?.role as Role)?.id === role.id,
    ),
  )
  return (
    <AccordionItem
      className='border-border rounded-md border px-4'
      value={role.id}
      key={role.id}>
      <AccordionTrigger className='relative flex w-full cursor-pointer items-center justify-between hover:no-underline'>
        <div className='max-w-[60%]'>
          <h3 className='text-lg font-semibold'> {role?.name} </h3>
          <p className='text-muted-foreground line-clamp-1 text-sm break-all'>
            {role?.description}
          </p>
        </div>
        <div className='flex flex-1 justify-end gap-x-4 pr-2'>
          <div className='inline-flex items-center gap-x-2'>
            <Users className='size-5' /> {assignedUsers?.length ?? 0}
          </div>
          <Badge className='uppercase' variant={getBadgeVariant(role?.type)}>
            {role?.type}
          </Badge>
          <RoleActions role={role} assignedUsers={assignedUsers} />
        </div>
      </AccordionTrigger>
      <AccordionContent className='flex flex-col gap-4 text-balance'>
        <Tabs defaultValue='permissions'>
          <div
            className='flex w-full gap-x-2 overflow-x-auto'
            style={{ scrollbarWidth: 'none' }}>
            <TabsList className='flex w-full min-w-max justify-around'>
              {/* <TabsTrigger className='flex w-full gap-x-2' value='overview'>
                <Eye className='size-4' />
                Overview
              </TabsTrigger> */}
              <TabsTrigger className='flex w-full gap-x-2' value='permissions'>
                <LockKeyhole className='size-4' />
                Permissions
              </TabsTrigger>
              <TabsTrigger className='flex w-full gap-x-2' value='users'>
                <Users className='size-4' />
                Users
              </TabsTrigger>
            </TabsList>
          </div>
          {/* <TabsContent value='overview'>
            <RoleOverview role={role} usersCount={assignedUsers?.length ?? 0} />
          </TabsContent> */}
          <TabsContent value='permissions'>
            <RolePermissions role={role} />
          </TabsContent>
          <TabsContent value='users'>
            <RoleUsers assignedUsers={assignedUsers ?? []} />
          </TabsContent>
        </Tabs>
      </AccordionContent>
    </AccordionItem>
  )
}

const RolesList = ({
  roles,
  teamMembers,
  error,
}: {
  roles: Role[]
  teamMembers: User[] | undefined
  error: string | undefined
}) => {
  const [openItem, setOpenItem] = useState<string | undefined>(undefined)

  return (
    <Accordion
      type='single'
      value={openItem}
      onValueChange={setOpenItem}
      collapsible
      className='mt-8 w-full space-y-4'>
      <CreateNewRole setOpenItem={setOpenItem} />
      {error ? (
        <AccessDeniedAlert error={error} />
      ) : (
        roles?.map(role => (
          <RoleDetails key={role.id} role={role} teamMembers={teamMembers} />
        ))
      )}
    </Accordion>
  )
}

export default RolesList
