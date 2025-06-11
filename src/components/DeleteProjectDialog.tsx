'use client'

import { HardDrive, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { Dispatch, SetStateAction, useState } from 'react'
import { toast } from 'sonner'

import { deleteProjectAction } from '@/actions/project'
import { Project, Server, Service } from '@/payload-types'

import ServiceIcon, { StatusType } from './ServiceIcon'
import { Button } from './ui/button'
import { Checkbox } from './ui/check-box'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

const DeleteProjectDialog = ({
  project,
  open,
  setOpen,
  services = [],
}: {
  project: Project
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  services?: Service[]
}) => {
  const { name } = project
  const [deleteBackups, setDeleteBackups] = useState<boolean>(false)
  const [deleteFromServer, setDeleteFromServer] = useState<boolean>(true)

  const hasServices = services.length > 0
  const serverName = (project.server as Server)?.name

  const { execute, isPending } = useAction(deleteProjectAction, {
    onSuccess: ({ data }) => {
      if (data?.deleted) {
        setOpen(false)
        toast.success('Successfully deleted project')
      }
    },
    onError: ({ error }) => {
      setOpen(false)
      toast.error(`Failed to delete project: ${error.serverError}`)
    },
  })

  const handleDelete = () => {
    execute({
      id: project.id,
      deleteBackups,
      deleteFromServer,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-lg'>
            <Trash2 className='h-5 w-5 text-destructive' />
            Delete Project
          </DialogTitle>

          <DialogDescription>
            Are you sure you want to delete the project{' '}
            <span className='font-medium text-foreground'>{name}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Project Info */}
          <div className='rounded-md border bg-muted/50 p-3'>
            <div className='flex items-center gap-2 text-sm'>
              <HardDrive className='h-4 w-4 text-muted-foreground' />
              <span className='font-medium'>Server:</span>
              <span>{serverName || 'Unknown server'}</span>
            </div>

            {hasServices && (
              <ul className='mt-2 space-y-2'>
                {services.map(service => (
                  <li
                    key={service.id}
                    className='flex items-center gap-2 text-sm'>
                    <ServiceIcon
                      type={
                        service.type === 'database' &&
                        service.databaseDetails?.type
                          ? (service.databaseDetails.type as StatusType)
                          : (service.type as StatusType)
                      }
                    />

                    <span>{service.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Deletion Options */}
          <div className='space-y-3'>
            <div className='space-y-3 rounded-md border p-3 text-sm'>
              <div className='flex items-start space-x-3'>
                <Checkbox
                  id='delete-from-server'
                  checked={deleteFromServer}
                  onCheckedChange={checked => setDeleteFromServer(!!checked)}
                  className='mt-0.5'
                />

                <div className='space-y-1'>
                  <label
                    htmlFor='delete-from-server'
                    className='cursor-pointer font-medium'>
                    Delete Services
                  </label>

                  <p className='text-muted-foreground'>
                    All services of this project will be permanently deleted
                    from your {serverName}
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-3'>
                <Checkbox
                  id='delete-backups'
                  checked={deleteBackups}
                  onCheckedChange={checked => setDeleteBackups(!!checked)}
                  className='mt-0.5'
                />

                <div className='space-y-1'>
                  <label
                    htmlFor='delete-backups'
                    className='cursor-pointer font-medium'>
                    Delete Backups
                  </label>

                  <p className='text-muted-foreground'>
                    All backups of this project will be permanently deleted from
                    your {serverName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className='mt-6 space-x-2'>
          <Button
            variant='outline'
            disabled={isPending}
            onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            disabled={isPending}
            onClick={handleDelete}
            className='gap-2'>
            {isPending ? (
              <>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete Project
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteProjectDialog
