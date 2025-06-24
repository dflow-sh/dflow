'use client'

import { AlertCircle, HardDrive, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { Dispatch, SetStateAction, useState } from 'react'
import { toast } from 'sonner'

import { deleteProjectAction } from '@/actions/project'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { ScrollArea } from './ui/scroll-area'

const DeleteProjectContent = ({
  project,
  services = [],
  setOpen,
}: {
  project: Project
  services?: Service[]
  setOpen: Dispatch<SetStateAction<boolean>>
}) => {
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
        toast.info('Added to queue', {
          description: 'Added deleting project to queue',
        })
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
    <>
      <div className='min-h-0 flex-1 overflow-hidden'>
        <ScrollArea className='h-full'>
          <div className='max-h-[60vh] pr-3'>
            <div className='space-y-4 pb-6'>
              {/* Services to be deleted */}
              {hasServices && (
                <div className='space-y-3 rounded-md border bg-muted/50 p-3'>
                  <div className='text-sm'>
                    <span className='font-medium'>Server</span>

                    <div className='flex items-center gap-2'>
                      <HardDrive className='h-4 w-4 text-muted-foreground' />
                      <span>{serverName || 'Unknown server'}</span>
                    </div>
                  </div>

                  <div>
                    <p className='text-sm font-medium'>Services</p>
                    <div className='space-y-2'>
                      {services.map(service => (
                        <div
                          key={service.id}
                          className='flex items-center gap-2 text-sm'>
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
                      ))}
                    </div>
                  </div>
                </div>
              )}

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
                      Remove Docker containers, volumes, and all service files
                      from {serverName}
                      {hasServices &&
                        ` (${services.length} service${
                          services.length > 1 ? 's' : ''
                        })`}
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
                      Permanently remove all backup data for this project and
                      its services
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
                    Project files and containers will continue running on{' '}
                    {serverName}. You'll need to manually stop and remove them
                    if desired.
                    {hasServices &&
                      ` This includes ${services.length} service${
                        services.length > 1 ? 's' : ''
                      }.`}
                  </AlertDescription>
                </Alert>
              )}

              {deleteFromServer && (
                <Alert variant='destructive'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertTitle>Permanent Action</AlertTitle>
                  <AlertDescription>
                    The project and all its services will be stopped and removed
                    from the server. This action cannot be undone.
                    {hasServices &&
                      ` This will delete ${services.length} service${
                        services.length > 1 ? 's' : ''
                      }.`}
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
          isLoading={isPending}
          onClick={handleDelete}
          className='gap-2'>
          <Trash2 size={16} />
          Delete Project
        </Button>
      </DialogFooter>
    </>
  )
}

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
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='flex max-h-[90vh] w-full max-w-2xl flex-col'>
        <DialogHeader className='flex-shrink-0'>
          <DialogTitle className='flex items-center gap-2 text-lg'>
            <Trash2 className='h-5 w-5 text-destructive' />
            Delete project
          </DialogTitle>

          <DialogDescription>
            Are you sure you want to delete the {project.name} project? Project
            associated server & services might be affected!
          </DialogDescription>
        </DialogHeader>

        <DeleteProjectContent
          services={services}
          project={project}
          setOpen={setOpen}
        />
      </DialogContent>
    </Dialog>
  )
}

export default DeleteProjectDialog
