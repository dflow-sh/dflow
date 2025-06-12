'use client'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/check-box'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { ScrollArea } from '../ui/scroll-area'
import { AlertCircle, HardDrive, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { Dispatch, SetStateAction, useState } from 'react'
import { toast } from 'sonner'

import { deleteServiceAction } from '@/actions/service'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Server, Service } from '@/payload-types'

const DeleteServiceDialog = ({
  service,
  project,
  open,
  setOpen,
}: {
  service: Service & { displayName?: string }
  project: {
    id: string
    name: string
    description?: string | null | undefined
    server: string | Server
  }
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}) => {
  const { name, type } = service
  const [deleteBackups, setDeleteBackups] = useState<boolean>(false)
  const [deleteFromServer, setDeleteFromServer] = useState<boolean>(true)

  const serverName = (project.server as Server)?.name

  const { execute, isPending } = useAction(deleteServiceAction, {
    onSuccess: ({ data }) => {
      if (data?.deleted) {
        setOpen(false)
        toast.info('Added to queue', {
          description: 'Added deleting service to queue',
        })
      }
    },
    onError: ({ error }) => {
      setOpen(false)
      toast.error(`Failed to delete service: ${error.serverError}`)
    },
  })

  const handleDelete = () => {
    execute({
      id: service.id,
      deleteBackups,
      deleteFromServer,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='flex max-h-[90vh] w-full max-w-2xl flex-col'>
        <DialogHeader className='flex-shrink-0'>
          <DialogTitle className='flex items-center gap-2 text-lg'>
            <Trash2 className='h-5 w-5 text-destructive' />
            Delete Service
          </DialogTitle>
          <DialogDescription className='pt-2'>
            Are you sure you want to delete the service{' '}
            <span className='font-medium'>{name}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className='min-h-0 flex-1 overflow-hidden'>
          <ScrollArea className='h-full'>
            <div className='max-h-[60vh] pr-3'>
              <div className='space-y-4 pb-6'>
                {/* Service Info */}
                <div className='rounded-md border bg-muted/50 p-3'>
                  <div className='flex items-center gap-2 text-sm'>
                    <HardDrive className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>Server:</span>
                    <span>{serverName || 'Unknown server'}</span>
                  </div>
                  <div className='mt-1 flex items-center gap-2 text-sm'>
                    <div className='h-4 w-4' /> {/* Spacer */}
                    <span className='font-medium'>Type:</span>
                    <Badge variant='secondary' className='text-xs'>
                      {type || 'Service'}
                    </Badge>
                  </div>
                  <div className='mt-1 flex items-center gap-2 text-sm'>
                    <div className='h-4 w-4' /> {/* Spacer */}
                    <span className='font-medium'>Project:</span>
                    <span>{project.name}</span>
                  </div>
                </div>

                {/* Service Details */}
                <div className='rounded-md border bg-muted/50 p-3'>
                  <p className='mb-2 text-sm font-medium'>
                    Service to be deleted:
                  </p>
                  <div className='flex items-center gap-2 text-sm'>
                    <div className='h-2 w-2 rounded-full bg-primary' />
                    <span>{service.name}</span>
                    <Badge variant='secondary' className='text-xs'>
                      {service.type || 'Service'}
                    </Badge>
                  </div>
                </div>

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
                          Delete service files from server
                        </label>
                        <p className='text-xs text-muted-foreground'>
                          Remove Docker containers, volumes, and service files
                          from {serverName}
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
                          Permanently remove all backup data for this service
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
                      Service files and containers will continue running on{' '}
                      {serverName}. You'll need to manually stop and remove them
                      if desired.
                    </AlertDescription>
                  </Alert>
                )}

                {deleteFromServer && (
                  <Alert variant='destructive'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertTitle>Permanent Action</AlertTitle>
                    <AlertDescription>
                      The service will be stopped and removed from the server.
                      This action cannot be undone.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className='flex-shrink-0 space-x-2 pt-4'>
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
                Delete Service
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteServiceDialog
