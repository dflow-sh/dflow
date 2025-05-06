'use client'

import { format, formatDistanceToNow } from 'date-fns'
import { Clock, Ellipsis, HardDrive, Pencil, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { Dispatch, SetStateAction, useState } from 'react'
import { toast } from 'sonner'

import { deleteProjectAction } from '@/actions/project'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Project, Server, Service } from '@/payload-types'

import UpdateProject from './project/CreateProject'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

export function DeleteProjectAlert({
  project,
  open,
  setOpen,
}: {
  project: Project
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}) {
  const { name } = project
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

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Project</AlertDialogTitle>
          <AlertDialogDescription>
            {`Are you sure you want to delete the ${name}? This action is permanent and will delete all services of this project`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isPending}
            onClick={() => setOpen(false)}>
            Cancel
          </AlertDialogCancel>

          <Button
            variant='destructive'
            disabled={isPending}
            isLoading={isPending}
            onClick={() => {
              execute({
                id: project.id,
              })
            }}>
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function ProjectCard({
  project,
  servers,
  services,
}: {
  project: Project
  servers: { name: string; id: string }[]
  services: Service[]
}) {
  const [manualOpen, setManualOpen] = useState(false)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)

  const serverName = (project.server as Server).name

  // const appServices = services?.filter(service => service.type === 'app')
  // const databaseServices = services?.filter(
  //   service => service.type === 'database',
  // )
  // const dockerServices = services?.filter(service => service.type === 'docker')

  return (
    <>
      <Link href={`/dashboard/project/${project.id}`} className='h-full'>
        <Card className='h-full min-h-36'>
          <CardHeader className='w-full flex-row items-center justify-between'>
            <div>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription className='mt-1 line-clamp-1 w-3/4 text-wrap'>
                {project.description}
              </CardDescription>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='!mt-0'
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}>
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align='end'>
                <DropdownMenuItem
                  className='w-full cursor-pointer'
                  onClick={e => {
                    e.stopPropagation()
                    setManualOpen(true)
                  }}>
                  <Pencil />
                  Edit
                </DropdownMenuItem>

                <DropdownMenuItem
                  className='cursor-pointer'
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    setDeleteAlertOpen(true)
                  }}>
                  <Trash2 />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>

          <CardContent className='flex justify-end pb-2'>
            <Badge variant={'secondary'}>
              <div className='flex items-center gap-x-2'>
                <HardDrive size={16} />
                <span className='text-sm font-medium'>{serverName}</span>
              </div>
            </Badge>
          </CardContent>

          <CardFooter className='justify-between'>
            {/* <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild> */}
            <div>{services.length} services</div>
            {/* </TooltipTrigger>

                <TooltipContent side='bottom'>
                  <div className='space-y-1'>
                    {appServices.length > 0 && (
                      <div>
                        <span className='flex items-center gap-x-2 text-sm font-medium'>
                          <Github size={16} />
                          <div className='mt-1 flex flex-wrap gap-2'>
                            {appServices.map(service => (
                              <Badge variant={'secondary'}>
                                {service.name}
                              </Badge>
                            ))}
                          </div>
                        </span>
                      </div>
                    )}

                    {databaseServices.length > 0 && (
                      <div>
                        <span className='flex items-center gap-x-2 text-sm font-medium'>
                          <Database size={16} />
                          <div className='mt-1 flex flex-wrap gap-2'>
                            {databaseServices.map(service => (
                              <Badge variant={'secondary'}>
                                {service.name}
                              </Badge>
                            ))}
                          </div>
                        </span>
                      </div>
                    )}

                    {dockerServices.length > 0 && (
                      <div>
                        <span className='flex items-center gap-x-2 text-sm font-medium'>
                          <Docker className='h-5 w-5' />
                          <div className='mt-1 flex flex-wrap gap-2'>
                            {dockerServices.map(service => (
                              <Badge variant={'secondary'}>
                                {service.name}
                              </Badge>
                            ))}
                          </div>
                        </span>
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider> */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <time className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                    <Clock size={14} />
                    {`Created ${formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}`}
                  </time>
                </TooltipTrigger>

                <TooltipContent side='bottom'>
                  <p>
                    {format(new Date(project.createdAt), 'LLL d, yyyy h:mm a')}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardFooter>
        </Card>
      </Link>

      <UpdateProject
        servers={servers}
        project={project}
        title='Update Project'
        description='This form will update project'
        type='update'
        manualOpen={manualOpen}
        setManualOpen={setManualOpen}
      />

      <DeleteProjectAlert
        project={project}
        open={deleteAlertOpen}
        setOpen={setDeleteAlertOpen}
      />
    </>
  )
}
