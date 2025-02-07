'use client'

import { formatDistanceToNow } from 'date-fns'
import { Ellipsis, Trash2 } from 'lucide-react'
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
import { Project } from '@/payload-types'

import { Button } from './ui/button'

export function ProjectCard({ project }: { project: Project }) {
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
          <time className='text-sm text-muted-foreground'>
            {`Created ${formatDistanceToNow(new Date(project.createdAt), {
              addSuffix: true,
            })}`}
          </time>
        </CardContent>
      </Card>
    </Link>
  )
}
