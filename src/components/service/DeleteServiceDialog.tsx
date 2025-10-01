'use client'

import ServiceIcon, { StatusType } from '../ServiceIcon'
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
import { AlertCircle, Folder, HardDrive, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useParams, useRouter } from 'next/navigation'
import { Dispatch, SetStateAction, useState } from 'react'
import { toast } from 'sonner'

import { deleteServiceAction } from '@/actions/service'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Project, Server, Service } from '@/payload-types'

const DeleteServiceContent = ({
  service,
  project,
  setOpen,
}: {
  service: Service & { displayName?: string }
  project: Partial<Project>
  setOpen: Dispatch<SetStateAction<boolean>>
}) => {
  const [deleteBackups, setDeleteBackups] = useState<boolean>(false)
  const [deleteFromServer, setDeleteFromServer] = useState<boolean>(true)
  const router = useRouter()
  const params = useParams<{ organisation: string; id: string }>()

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
    onExecute: () => {
      const { organisation, id } = params
      router.replace(`/${organisation}/dashboard/project/${id}`)
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
    <>
      <div className='min-h-0 flex-1 overflow-hidden'>
        <ScrollArea className='h-full'>
          <div className='max-h-[60vh] pr-3'>
            <div className='space-y-4 pb-6'>
              {/* Service Info */}
              <div className='bg-muted/50 space-y-3 rounded-md border p-3 text-sm'>
                <div>
                  <span className='font-medium'>Server</span>

                  <div className='flex items-center gap-2'>
                    <HardDrive className='text-muted-foreground h-4 w-4' />
                    <span>{serverName || 'Unknown server'}</span>
                  </div>
                </div>

                <div>
                  <span className='font-medium'>Project</span>

                  <div className='flex items-center gap-2'>
                    <Folder className='text-muted-foreground h-4 w-4' />
                    <span>{project.name}</span>
                  </div>
                </div>

                <div>
                  <p className='text-sm font-medium'>Service</p>
                  <div className='flex items-center gap-2 text-sm'>
                    <ServiceIcon
                      type={
                        service.type === 'database' &&
                        service.databaseDetails?.type
                          ? (service.databaseDetails.type as StatusType)
                          : (service.type as StatusType)
                      }
                      className='h-4 w-4'
                    />
                    <span>{service.name}</span>
                  </div>
                </div>
              </div>

              {/* Deletion Options */}

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
                      className='cursor-pointer text-sm leading-none font-medium'>
                      Delete service files from server
                    </label>
                    <p className='text-muted-foreground text-xs'>
                      Remove Docker containers, volumes, and service files from{' '}
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
                      className='cursor-pointer text-sm leading-none font-medium'>
                      Delete all associated backups
                    </label>
                    <p className='text-muted-foreground text-xs'>
                      Permanently remove all backup data for this service
                    </p>
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

      <DialogFooter className='shrink-0 space-x-2 pt-4'>
        <Button
          variant='outline'
          disabled={isPending}
          onClick={() => setOpen(false)}>
          Cancel
        </Button>

        <Button
          variant='destructive'
          disabled={isPending}
          isLoading={isPending}
          onClick={handleDelete}
          className='gap-2'>
          <Trash2 size={16} />
          Delete Service
        </Button>
      </DialogFooter>
    </>
  )
}

const DeleteServiceDialog = ({
  service,
  project,
  open,
  setOpen,
}: {
  service: Service & { displayName?: string }
  project: Partial<Project>
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='flex max-h-[90vh] w-full max-w-2xl flex-col'>
        <DialogHeader className='shrink-0'>
          <DialogTitle className='flex items-center gap-2 text-lg'>
            <Trash2 className='text-destructive h-5 w-5' />
            Delete Service
          </DialogTitle>
          <DialogDescription className='pt-2'>
            Are you sure you want to delete the service{' '}
            <span className='font-medium'>{service.name}</span>?
          </DialogDescription>
        </DialogHeader>

        <DeleteServiceContent
          project={project}
          service={service}
          setOpen={setOpen}
        />
      </DialogContent>
    </Dialog>
  )
}

export default DeleteServiceDialog
