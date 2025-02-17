'use client'

import { Button } from '../ui/button'
import { formatDistanceToNow } from 'date-fns'
import { Database, Ellipsis, Globe, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { JSX } from 'react'
import { toast } from 'sonner'

import { deleteServiceAction } from '@/actions/service'
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
import { Service } from '@/payload-types'

const icon: { [key in Service['type']]: JSX.Element } = {
  app: <Globe className='size-6 text-green-600' />,
  database: <Database className='size-6 text-destructive' />,
  docker: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='#008fe2'
      className='size-6'>
      <path d='M13.98 11.08h2.12a.19.19 0 0 0 .19-.19V9.01a.19.19 0 0 0-.19-.19h-2.12a.18.18 0 0 0-.18.18v1.9c0 .1.08.18.18.18m-2.95-5.43h2.12a.19.19 0 0 0 .18-.19V3.57a.19.19 0 0 0-.18-.18h-2.12a.18.18 0 0 0-.19.18v1.9c0 .1.09.18.19.18m0 2.71h2.12a.19.19 0 0 0 .18-.18V6.29a.19.19 0 0 0-.18-.18h-2.12a.18.18 0 0 0-.19.18v1.89c0 .1.09.18.19.18m-2.93 0h2.12a.19.19 0 0 0 .18-.18V6.29a.18.18 0 0 0-.18-.18H8.1a.18.18 0 0 0-.18.18v1.89c0 .1.08.18.18.18m-2.96 0h2.11a.19.19 0 0 0 .19-.18V6.29a.18.18 0 0 0-.19-.18H5.14a.19.19 0 0 0-.19.18v1.89c0 .1.08.18.19.18m5.89 2.72h2.12a.19.19 0 0 0 .18-.19V9.01a.19.19 0 0 0-.18-.19h-2.12a.18.18 0 0 0-.19.18v1.9c0 .1.09.18.19.18m-2.93 0h2.12a.18.18 0 0 0 .18-.19V9.01a.18.18 0 0 0-.18-.19H8.1a.18.18 0 0 0-.18.18v1.9c0 .1.08.18.18.18m-2.96 0h2.11a.18.18 0 0 0 .19-.19V9.01a.18.18 0 0 0-.18-.19H5.14a.19.19 0 0 0-.19.19v1.88c0 .1.08.19.19.19m-2.92 0h2.12a.18.18 0 0 0 .18-.19V9.01a.18.18 0 0 0-.18-.19H2.22a.18.18 0 0 0-.19.18v1.9c0 .1.08.18.19.18m21.54-1.19c-.06-.05-.67-.51-1.95-.51-.34 0-.68.03-1.01.09a3.77 3.77 0 0 0-1.72-2.57l-.34-.2-.23.33a4.6 4.6 0 0 0-.6 1.43c-.24.97-.1 1.88.4 2.66a4.7 4.7 0 0 1-1.75.42H.76a.75.75 0 0 0-.76.75 11.38 11.38 0 0 0 .7 4.06 6.03 6.03 0 0 0 2.4 3.12c1.18.73 3.1 1.14 5.28 1.14.98 0 1.96-.08 2.93-.26a12.25 12.25 0 0 0 3.82-1.4 10.5 10.5 0 0 0 2.61-2.13c1.25-1.42 2-3 2.55-4.4h.23c1.37 0 2.21-.55 2.68-1 .3-.3.55-.66.7-1.06l.1-.28Z' />
    </svg>
  ),
}

export function ServiceCard({
  service,
  projectId,
}: {
  service: Service
  projectId: string
}) {
  const { execute } = useAction(deleteServiceAction, {
    onExecute: () => {
      toast.loading('Deleting service...', { id: service.id })
    },
    onSuccess: ({ data }) => {
      if (data?.deleted) {
        toast.success('Successfully deleted service', { id: service.id })
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to delete service ${error.serverError}`, {
        id: service.id,
      })
    },
  })

  return (
    <Link
      href={`/dashboard/project/${projectId}/service/${service.id}/general`}
      className='h-full'>
      <Card className='h-full min-h-36'>
        <CardHeader className='w-full flex-row items-start justify-between'>
          <div className='flex gap-3'>
            {icon[service.type]}

            <div>
              <CardTitle>{service.name}</CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </div>
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
                  execute({ id: service.id })
                }}>
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent>
          <time className='text-sm text-muted-foreground'>
            {`Created ${formatDistanceToNow(new Date(service.createdAt), {
              addSuffix: true,
            })}`}
          </time>
        </CardContent>
      </Card>
    </Link>
  )
}
