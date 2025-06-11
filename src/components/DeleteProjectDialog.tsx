'use client'

import { AlertCircle, HardDrive, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { Dispatch, SetStateAction, useState } from 'react'
import { toast } from 'sonner'

import { deleteProjectAction } from '@/actions/project'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Project, Server, Service } from '@/payload-types'

import { Badge } from './ui/badge'
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
  const serverId =
    typeof project.server === 'string' ? project.server : project.server?.id

  const { execute, isPending } = useAction(deleteProjectAction, {
    onSuccess: ({ data }) => {
      if (data?.queued) {
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
      serverId,
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
          <DialogDescription className='pt-2'>
            Are you sure you want to delete the project{' '}
            <span className='font-medium'>{name}</span>?
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
              <div className='mt-1 flex items-center gap-2 text-sm'>
                <div className='h-4 w-4' /> {/* Spacer */}
                <span className='font-medium'>Services:</span>
                <span>
                  {services.length} service{services.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Services List */}
          {hasServices && (
            <Alert variant='warning'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Warning: Connected Services</AlertTitle>
              <AlertDescription>
                <p className='mb-2'>
                  This project contains the following services:
                </p>
                <ul className='space-y-2'>
                  {services.slice(0, 3).map(service => (
                    <li
                      key={service.id}
                      className='flex items-center gap-2 text-sm'>
                      <div className='h-2 w-2 rounded-full bg-primary' />
                      <span>{service.name}</span>
                      <Badge variant='secondary' className='text-xs'>
                        {service.type || 'Service'}
                      </Badge>
                    </li>
                  ))}
                  {services.length > 3 && (
                    <li className='text-xs text-muted-foreground'>
                      ... and {services.length - 3} more service
                      {services.length - 3 > 1 ? 's' : ''}
                    </li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Deletion Options */}
          <div className='space-y-3'>
            <p className='text-sm font-medium'>Deletion Options:</p>

            <div className='space-y-3 rounded-md border p-3'>
              <div className='flex items-start space-x-3'>
                <Checkbox
                  id='delete-from-server'
                  checked={deleteFromServer}
                  onCheckedChange={checked =>
                    setDeleteFromServer(Boolean(checked))
                  }
                  className='mt-0.5'
                />
                <div className='space-y-1'>
                  <label
                    htmlFor='delete-from-server'
                    className='cursor-pointer text-sm font-medium leading-none'>
                    Delete project files from server
                  </label>
                  <p className='text-xs text-muted-foreground'>
                    Remove Docker containers, volumes, and project files from{' '}
                    {serverName}
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-3'>
                <Checkbox
                  id='delete-backups'
                  checked={deleteBackups}
                  onCheckedChange={checked =>
                    setDeleteBackups(Boolean(checked))
                  }
                  className='mt-0.5'
                />
                <div className='space-y-1'>
                  <label
                    htmlFor='delete-backups'
                    className='cursor-pointer text-sm font-medium leading-none'>
                    Delete all associated backups
                  </label>
                  <p className='text-xs text-muted-foreground'>
                    Permanently remove all backup data for this project
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Warning Messages */}
          {!deleteFromServer && (
            <Alert variant='warning'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Files will remain on server</AlertTitle>
              <AlertDescription>
                Project files and containers will continue running on{' '}
                {serverName}. You&apos;ll need to manually stop and remove them
                if desired.
              </AlertDescription>
            </Alert>
          )}

          {deleteFromServer && hasServices && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Permanent Action</AlertTitle>
              <AlertDescription>
                All {services.length} service{services.length > 1 ? 's' : ''}{' '}
                will be stopped and removed from the server. This action cannot
                be undone.
              </AlertDescription>
            </Alert>
          )}
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
