'use client'

import { format, formatDistanceToNow } from 'date-fns'
import {
  AlertCircle,
  Clock,
  Ellipsis,
  HardDrive,
  Pencil,
  Trash2,
  WifiOff,
} from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { Dispatch, SetStateAction, useState } from 'react'
import { toast } from 'sonner'

import { deleteProjectAction } from '@/actions/project'
import {
  AlertDialog,
  AlertDialogAction,
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
import { Project, Server, Service, SshKey } from '@/payload-types'

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
  const { id, name } = project
  const { execute } = useAction(deleteProjectAction, {
    onExecute: () => {
      setOpen(false)
      toast.loading('Please wait deleting project...', { id })
    },
    onSuccess: ({ data }) => {
      if (data?.deleted) {
        toast.success('Successfully deleted project', { id })
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to delete project: ${error.serverError}`, {
        id,
      })
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
          <AlertDialogCancel onClick={() => setOpen(false)}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            variant='destructive'
            onClick={() => {
              execute({
                id: project.id,
              })
            }}>
            Delete
          </AlertDialogAction>
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
  servers: {
    name: string
    id: string
    sshConnected: boolean
    ip: string
    port: number
    username: string
    sshKey: SshKey
  }[]
  services: Service[]
}) {
  const [manualOpen, setManualOpen] = useState(false)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)

  const serverName = (project.server as Server)?.name
  const serverId = (project.server as Server)?.id
  const serverExists = servers.some(server => server.id === serverId)
  const isServerConnected = servers.find(
    server => server.id === serverId,
  )?.sshConnected

  const isDisabled = !serverExists || !isServerConnected

  const cardContent = (
    <Card
      className={`h-full min-h-36 transition-all duration-200 ${
        isDisabled
          ? 'border-red-500/40 bg-red-500/5 opacity-80 hover:border-red-500/60 hover:bg-red-500/10'
          : 'hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm'
      }`}>
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

      <CardContent className='flex flex-col gap-2'>
        {!serverExists && (
          <div className='mb-1 flex items-center gap-2 text-sm text-red-500'>
            <AlertCircle size={16} />
            <span>Server not found</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertCircle
                    size={14}
                    className='cursor-help text-muted-foreground'
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Server does not exist. Action required.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {serverExists && !isServerConnected && (
          <div className='mb-1 flex items-center gap-2 text-sm text-red-500'>
            <WifiOff size={16} />
            <span>SSH not connected</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertCircle
                    size={14}
                    className='cursor-help text-muted-foreground'
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Fix SSH connection to continue.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        <div className='flex justify-end'>
          <Badge variant={serverExists ? 'secondary' : 'destructive'}>
            <div className='flex items-center gap-x-2'>
              <HardDrive size={16} />
              <span className='text-sm font-medium'>
                {serverName || 'Unknown server'}
              </span>
            </div>
          </Badge>
        </div>
      </CardContent>

      <CardFooter className='justify-between'>
        <div>{services.length} services</div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <time className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                <Clock size={14} />
                {`Created ${formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}`}
              </time>
            </TooltipTrigger>

            <TooltipContent side='bottom'>
              <p>{format(new Date(project.createdAt), 'LLL d, yyyy h:mm a')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  )

  return (
    <>
      {isDisabled ? (
        <div
          className='group h-full cursor-not-allowed'
          onClick={e => e.preventDefault()}>
          {cardContent}
        </div>
      ) : (
        <Link
          href={`/dashboard/project/${project.id}`}
          className='group h-full'>
          {cardContent}
        </Link>
      )}

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
