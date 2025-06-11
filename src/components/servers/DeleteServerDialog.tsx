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
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  HardDrive,
  Package,
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
          setShowProjects(true)
        }
      },
      onError: ({ error }) => {
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
    if (!showProjects && projects.length === 0) {
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
            <div className='space-y-4 pb-4'>
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
                    <span className='line-clamp-1'>{description}</span>
                  </div>
                )}
              </div>

              {/* Cloud Server Notice */}
              {isCloudServer && (
                <Alert variant='warning'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertTitle>Cloud Server Notice</AlertTitle>
                  <AlertDescription>
                    This is a {cloudProviderAccount.type} server. Deleting here
                    will only remove it from the platform. You'll need to
                    manually cancel/delete the instance in your{' '}
                    {cloudProviderAccount.type} account.
                  </AlertDescription>
                </Alert>
              )}

              {/* Projects Toggle Button */}
              <div className='space-y-3'>
                <Button
                  variant='outline'
                  onClick={handleToggleProjects}
                  disabled={isLoadingProjects}
                  className='w-full justify-between'>
                  <div className='flex items-center gap-2'>
                    <FolderOpen className='h-4 w-4' />
                    <span>
                      {isLoadingProjects
                        ? 'Loading projects...'
                        : showProjects
                          ? 'Hide projects'
                          : 'Show projects on this server'}
                    </span>
                    {showProjects && projects.length > 0 && (
                      <Badge variant='secondary' className='ml-2'>
                        {projects.length} project
                        {projects.length !== 1 ? 's' : ''}
                        {totalServices > 0 && (
                          <span className='ml-1'>
                            ({totalServices} service
                            {totalServices !== 1 ? 's' : ''})
                          </span>
                        )}
                      </Badge>
                    )}
                  </div>
                  {isLoadingProjects ? (
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent' />
                  ) : showProjects ? (
                    <ChevronDown className='h-4 w-4' />
                  ) : (
                    <ChevronRight className='h-4 w-4' />
                  )}
                </Button>

                {/* Projects List */}
                {showProjects && projects.length > 0 && (
                  <div className='max-h-48 rounded-md border'>
                    <ScrollArea className='h-48'>
                      <div className='p-0'>
                        {projects.map((project, index) => (
                          <div
                            key={project.id}
                            className={`p-3 ${index !== projects.length - 1 ? 'border-b' : ''}`}>
                            <div className='flex items-start justify-between'>
                              <div className='space-y-1'>
                                <div className='flex items-center gap-2'>
                                  <div className='h-2 w-2 rounded-full bg-blue-500' />
                                  <span className='text-sm font-medium'>
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
                                  <p className='ml-4 line-clamp-1 text-xs text-muted-foreground'>
                                    {project.description}
                                  </p>
                                )}
                                {project.services?.docs &&
                                  project.services.docs?.length > 0 && (
                                    <div className='ml-4 mt-2'>
                                      <div className='flex flex-wrap gap-1'>
                                        {project.services.docs.map(
                                          (service: any) => (
                                            <div
                                              key={service.id}
                                              className='flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs'>
                                              <Package className='h-3 w-3' />
                                              <span>{service.name}</span>
                                              {service.type && (
                                                <Badge
                                                  variant='secondary'
                                                  className='h-4 text-xs'>
                                                  {service.type}
                                                </Badge>
                                              )}
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {showProjects && projects.length === 0 && (
                  <div className='rounded-md border border-dashed p-4 text-center'>
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
                  {/* Delete Projects Option */}
                  <div className='flex items-start space-x-3'>
                    <Checkbox
                      id='delete-projects'
                      checked={deleteProjects}
                      onCheckedChange={checked => setDeleteProjects(!!checked)}
                      className='mt-0.5'
                    />
                    <div className='space-y-1'>
                      <label
                        htmlFor='delete-projects'
                        className='cursor-pointer text-sm font-medium leading-none'>
                        Delete all projects and services from server
                      </label>
                      <p className='text-xs text-muted-foreground'>
                        Permanently remove all Docker containers, volumes, and
                        project files from {name}
                        {hasProjectsData && (
                          <span className='mt-1 block'>
                            Affects {projects.length} project
                            {projects.length !== 1 ? 's' : ''} and{' '}
                            {totalServices} service
                            {totalServices !== 1 ? 's' : ''}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Delete Backups Option */}
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
                        className='cursor-pointer text-sm font-medium leading-none'>
                        Delete all service database backups
                      </label>
                      <p className='text-xs text-muted-foreground'>
                        Permanently remove all database backups associated with
                        services on this server
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Destructive Alert for Projects */}
              {deleteProjects && (
                <Alert variant='destructive'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertTitle>Permanent Data Loss - Projects</AlertTitle>
                  <AlertDescription>
                    {hasProjectsData ? (
                      <>
                        <strong>
                          {projects.length} project
                          {projects.length !== 1 ? 's' : ''}
                        </strong>{' '}
                        and{' '}
                        <strong>
                          {totalServices} service
                          {totalServices !== 1 ? 's' : ''}
                        </strong>{' '}
                        will be permanently deleted from the server. This
                        includes all containers, volumes, and associated data.
                      </>
                    ) : (
                      <>
                        All projects and services will be permanently deleted
                        from the server. This includes all containers, volumes,
                        and associated data.
                      </>
                    )}
                    <span className='mt-1 block font-medium'>
                      This action cannot be undone.
                    </span>
                  </AlertDescription>
                </Alert>
              )}

              {/* Destructive Alert for Backups */}
              {deleteBackups && (
                <Alert variant='destructive'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertTitle>
                    Permanent Data Loss - Database Backups
                  </AlertTitle>
                  <AlertDescription>
                    All database backups associated with services on this server
                    will be permanently deleted.
                    <span className='mt-1 block font-medium'>
                      This action cannot be undone and may affect your ability
                      to restore services.
                    </span>
                  </AlertDescription>
                </Alert>
              )}
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
