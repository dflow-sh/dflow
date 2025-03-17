'use client'

import { format, formatDistanceToNow } from 'date-fns'
import { Ellipsis, Pencil, Trash2 } from 'lucide-react'
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
import { Project, Server } from '@/payload-types'

import UpdateProject from './project/CreateProject'
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
}: {
  project: Project
  servers: Server[]
}) {
  const [manualOpen, setManualOpen] = useState(false)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)

  return (
    <>
      <Link href={`/dashboard/project/${project.id}`} className='h-full'>
        <Card className='h-full min-h-36'>
          <CardHeader className='w-full flex-row items-start justify-between'>
            <div>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
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

          <CardContent>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <time className='text-sm text-muted-foreground'>
                    {`Created ${formatDistanceToNow(
                      new Date(project.createdAt),
                      {
                        addSuffix: true,
                      },
                    )}`}
                  </time>
                </TooltipTrigger>

                <TooltipContent>
                  <p>
                    {format(new Date(project.createdAt), 'LLL d, yyyy h:mm a')}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardContent>
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
