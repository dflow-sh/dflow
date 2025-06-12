'use client'

import ServiceIcon, { StatusType } from '../ServiceIcon'
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
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  HardDrive,
  Trash2,
} from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { Dispatch, SetStateAction, useState } from 'react'
import { toast } from 'sonner'

import { getServerProjects } from '@/actions/pages/server'
import { deleteServerAction } from '@/actions/server'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Project, Server } from '@/payload-types'

const DeleteServerDialog = ({
  server,
  open,
  setOpen,
}: {
  server: Server
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}) => {
  const { name, ip, description, cloudProviderAccount } = server
  const [deleteProjects, setDeleteProjects] = useState<boolean>(false)
  const [deleteBackups, setDeleteBackups] = useState<boolean>(false)
  const [showProjects, setShowProjects] = useState<boolean>(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsFetched, setProjectsFetched] = useState<boolean>(false)

  const connectionStatus = server.connection?.status || 'unknown'
  const isConnected = connectionStatus === 'success'
  const isOnboarded = server.onboarded === true
  const isCloudServer =
    cloudProviderAccount !== null &&
    typeof cloudProviderAccount === 'object' &&
    cloudProviderAccount.type

  const { execute: executeDelete, isPending: isDeleting } = useAction(
    deleteServerAction,
    {
      onSuccess: ({ data }) => {
        if (data?.deleted) {
          setOpen(false)
          toast.info('Added to queue', {
            description: 'Added deleting server to queue',
          })
        }
      },
      onError: ({ error }) => {
        setOpen(false)
        toast.error(`Failed to delete server: ${error.serverError}`)
      },
    },
  )

  const { execute: executeGetProjects, isPending: isLoadingProjects } =
    useAction(getServerProjects, {
      onSuccess: ({ data }) => {
        if (data?.projects) {
          setProjects(data.projects)
          setProjectsFetched(true)
          setShowProjects(true)
        }
      },
      onError: ({ error }) => {
        setProjectsFetched(true)
        toast.error(`Failed to load projects: ${error.serverError}`)
      },
    })

  const totalServices = projects.reduce(
    (acc, project) => acc + (project.services?.docs?.length || 0),
    0,
  )

  const handleDelete = () => {
    executeDelete({
      id: server.id,
      deleteProjects,
      deleteBackups,
    })
  }

  const handleToggleProjects = () => {
    if (!projectsFetched) {
      executeGetProjects({ id: server.id })
    } else {
      setShowProjects(!showProjects)
    }
  }

  const hasProjectsData = showProjects && projects.length > 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='flex max-h-[90vh] w-full max-w-2xl flex-col'>
        <DialogHeader className='flex-shrink-0'>
          <DialogTitle className='flex items-center gap-2 text-lg'>
            <Trash2 className='h-5 w-5 text-destructive' />
            Delete Server
          </DialogTitle>
          <DialogDescription className='pt-2'>
            Are you sure you want to delete the server{' '}
            <span className='font-medium'>{name}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className='min-h-0 flex-1 overflow-hidden'>
          <ScrollArea className='h-full'>
            <div className='max-h-[60vh] pr-3'>
              <div className='space-y-4 pb-6'>
                {/* Server Info */}
                <div className='rounded-md border bg-muted/50 p-3'>
                  <div className='flex items-center gap-2 text-sm'>
                    <HardDrive className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>Name:</span>
                    <span>{name}</span>
                  </div>
                  <div className='mt-1 flex items-center gap-2 text-sm'>
                    <div className='h-4 w-4' /> {/* Spacer */}
                    <span className='font-medium'>IP Address:</span>
                    <span>{ip}</span>
                  </div>
                  <div className='mt-1 flex items-center gap-2 text-sm'>
                    <div className='h-4 w-4' /> {/* Spacer */}
                    <span className='font-medium'>Status:</span>
                    {isOnboarded ? (
                      <Badge variant={isConnected ? 'success' : 'destructive'}>
                        {isConnected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    ) : (
                      <Badge variant='warning'>Onboarding Pending</Badge>
                    )}
                  </div>
                  {description && (
                    <div className='mt-1 flex items-center gap-2 text-sm'>
                      <div className='h-4 w-4' /> {/* Spacer */}
                      <span className='font-medium'>Description:</span>
                      <span className='line-clamp-1 text-muted-foreground'>
                        {description}
                      </span>
                    </div>
                  )}
                  {isCloudServer && (
                    <div className='mt-1 flex items-center gap-2 text-sm'>
                      <div className='h-4 w-4' /> {/* Spacer */}
                      <span className='font-medium'>Provider:</span>
                      <Badge variant='outline' className='text-xs'>
                        {cloudProviderAccount.type}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Cloud Server Notice */}
                {isCloudServer && (
                  <Alert variant='warning'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertTitle>Cloud Server Notice</AlertTitle>
                    <AlertDescription>
                      This is a {cloudProviderAccount.type} server. Deleting
                      here will only remove it from the platform. You'll need to
                      manually cancel/delete the instance in your{' '}
                      {cloudProviderAccount.type} account.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Projects Section */}
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <p className='text-sm font-medium'>Server Contents:</p>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleToggleProjects}
                      disabled={isLoadingProjects}
                      className='h-8 gap-2'>
                      <FolderOpen className='h-3 w-3' />
                      <span className='text-xs'>
                        {isLoadingProjects
                          ? 'Loading...'
                          : showProjects
                            ? 'Hide'
                            : 'Show'}{' '}
                        Projects
                      </span>
                      {hasProjectsData && (
                        <Badge variant='secondary' className='ml-1 text-xs'>
                          {projects.length}
                        </Badge>
                      )}
                      {isLoadingProjects ? (
                        <div className='h-3 w-3 animate-spin rounded-full border border-muted-foreground border-t-transparent' />
                      ) : showProjects ? (
                        <ChevronDown className='h-3 w-3' />
                      ) : (
                        <ChevronRight className='h-3 w-3' />
                      )}
                    </Button>
                  </div>

                  {/* Projects not fetched yet */}
                  {!projectsFetched && !isLoadingProjects && (
                    <div className='rounded-md border border-dashed bg-muted/25 p-4 text-center'>
                      <FolderOpen className='mx-auto h-8 w-8 text-muted-foreground' />
                      <p className='mt-2 text-sm text-muted-foreground'>
                        Click "Show Projects" to view server contents
                      </p>
                    </div>
                  )}

                  {/* Projects List */}
                  {showProjects && projects.length > 0 && (
                    <div className='rounded-md border bg-muted/50 p-3'>
                      <p className='mb-2 text-sm font-medium'>
                        Projects and services to be affected:
                      </p>
                      <ScrollArea>
                        <div className='max-h-48 space-y-4 pr-3'>
                          {projects.map(project => (
                            <div key={project.id} className='space-y-2'>
                              <div className='flex items-center gap-2 text-sm'>
                                <div className='h-2 w-2 rounded-full bg-blue-500' />
                                <span className='font-medium'>
                                  {project.name}
                                </span>
                                {project.services?.docs &&
                                  project.services.docs?.length > 0 && (
                                    <Badge
                                      variant='outline'
                                      className='text-xs'>
                                      {project.services.docs.length} service
                                      {project.services.docs.length !== 1
                                        ? 's'
                                        : ''}
                                    </Badge>
                                  )}
                              </div>
                              {project.description && (
                                <p className='ml-4 text-xs text-muted-foreground'>
                                  {project.description}
                                </p>
                              )}
                              {project.services?.docs &&
                                project.services.docs?.length > 0 && (
                                  <div className='ml-4 flex flex-wrap gap-2'>
                                    {project.services.docs.map(serviceData => {
                                      const service =
                                        typeof serviceData === 'object'
                                          ? serviceData
                                          : null

                                      return (
                                        <div
                                          key={service?.id}
                                          className='flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs'>
                                          {service?.type && (
                                            <ServiceIcon
                                              type={
                                                service.type === 'database' &&
                                                service.databaseDetails?.type
                                                  ? (service.databaseDetails
                                                      .type as StatusType)
                                                  : (service.type as StatusType)
                                              }
                                            />
                                          )}

                                          <span>{service?.name}</span>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      {hasProjectsData && (
                        <div className='mt-2 text-xs text-muted-foreground'>
                          Total: {projects.length} project
                          {projects.length !== 1 ? 's' : ''} and {totalServices}{' '}
                          service
                          {totalServices !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  )}

                  {showProjects && projects.length === 0 && (
                    <div className='rounded-md border border-dashed bg-muted/25 p-4 text-center'>
                      <p className='text-sm text-muted-foreground'>
                        No projects found on this server
                      </p>
                    </div>
                  )}
                </div>

                {/* Deletion Options */}
                <div className='space-y-3'>
                  <p className='text-sm font-medium'>Deletion Options:</p>

                  <div className='space-y-3 rounded-md border p-3'>
                    <div className='flex items-start space-x-3'>
                      <Checkbox
                        id='delete-projects'
                        checked={deleteProjects}
                        onCheckedChange={checked =>
                          setDeleteProjects(Boolean(checked))
                        }
                        className='mt-0.5'
                      />
                      <div className='space-y-1'>
                        <label
                          htmlFor='delete-projects'
                          className='cursor-pointer text-sm font-medium leading-none'>
                          Delete Projects & Services
                        </label>
                        <p className='text-xs text-muted-foreground'>
                          All Projects & Services will be permanently deleted
                          from your {server.name}
                          {hasProjectsData && (
                            <span className='mt-1 block'>
                              This will affect {projects.length} project
                              {projects.length !== 1 ? 's' : ''} and{' '}
                              {totalServices} service
                              {totalServices !== 1 ? 's' : ''}
                            </span>
                          )}
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
                          Delete Database Backups
                        </label>
                        <p className='text-xs text-muted-foreground'>
                          Permanently remove all backup data for services on
                          this server
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warning Messages */}
                {!deleteProjects && !deleteBackups && (
                  <Alert variant='warning'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertTitle>Server data will remain</AlertTitle>
                    <AlertDescription>
                      Projects, services, and backups will continue to exist on{' '}
                      {name}. You'll need to manually clean them up if desired.
                      {hasProjectsData &&
                        ` This includes ${projects.length} project${
                          projects.length !== 1 ? 's' : ''
                        } and ${totalServices} service${
                          totalServices !== 1 ? 's' : ''
                        }.`}
                    </AlertDescription>
                  </Alert>
                )}

                {(deleteProjects || deleteBackups) && (
                  <Alert variant='destructive'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertTitle>Permanent Action</AlertTitle>
                    <AlertDescription>
                      {deleteProjects && (
                        <div className='mb-2'>
                          All projects and services will be stopped and removed
                          from the server.
                          {hasProjectsData &&
                            ` This will delete ${projects.length} project${
                              projects.length !== 1 ? 's' : ''
                            } and ${totalServices} service${
                              totalServices !== 1 ? 's' : ''
                            }.`}
                        </div>
                      )}
                      {deleteBackups && (
                        <div className={deleteProjects ? '' : 'mb-2'}>
                          All backup data associated with services on this
                          server will be permanently deleted.
                        </div>
                      )}
                      <div className='font-medium'>
                        This action cannot be undone.
                      </div>
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
            disabled={isDeleting}
            onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            disabled={isDeleting}
            onClick={handleDelete}
            className='gap-2'>
            {isDeleting ? (
              <>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete Server
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteServerDialog
