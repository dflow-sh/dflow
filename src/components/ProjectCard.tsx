'use client'

import { format, formatDistanceToNow } from 'date-fns'
import { Ellipsis, Pencil, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { toast } from 'sonner'

import { deleteProjectAction } from '@/actions/project'
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
import { Project } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

import UpdateProject from './project/CreateProject'
import { Button } from './ui/button'

export function ProjectCard({
  project,
  servers,
}: {
  project: Project
  servers: ServerType[]
}) {
  const { execute } = useAction(deleteProjectAction, {
    onExecute: () => {
      toast.loading('Deleting project...', { id: project.id })
    },
    onSuccess: ({ data }) => {
      if (data?.deleted) {
        toast.success('Successfully deleted project', { id: project.id })
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to delete project ${error.serverError}`, {
        id: project.id,
      })
    },
  })

  return (
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
                variant='outline'
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
              <UpdateProject
                servers={servers}
                project={project}
                title='Update Project'
                description='This form will update project'
                type='update'>
                <DropdownMenuItem
                  className='w-full cursor-pointer'
                  onSelect={e => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={e => {
                    e.stopPropagation()
                  }}>
                  <Pencil />
                  Edit
                </DropdownMenuItem>
              </UpdateProject>

              <DropdownMenuItem
                className='cursor-pointer'
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  execute({ id: project.id })
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
                  {`Created ${formatDistanceToNow(new Date(project.createdAt), {
                    addSuffix: true,
                  })}`}
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
  )
}
