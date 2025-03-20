'use client'

import { Docker, MariaDB, MongoDB, MySQL, PostgreSQL, Redis } from '../icons'
import { Button } from '../ui/button'
import { format, formatDistanceToNow } from 'date-fns'
import { Clock, Database, Ellipsis, Globe, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { JSX } from 'react'
import { toast } from 'sonner'

import { deleteServiceAction } from '@/actions/service'
import {
  Card,
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
import { Service } from '@/payload-types'

const icon: { [key in Service['type']]: JSX.Element } = {
  app: <Globe className='size-6 text-green-600' />,
  database: <Database className='size-6 text-destructive' />,
  docker: <Docker className='size-6' />,
}

type StatusType = NonNullable<NonNullable<Service['databaseDetails']>['type']>

const databaseIcons: {
  [key in StatusType]: JSX.Element
} = {
  postgres: <PostgreSQL className='size-6' />,
  mariadb: <MariaDB className='size-6' />,
  mongo: <MongoDB className='size-6' />,
  mysql: <MySQL className='size-6' />,
  redis: <Redis className='size-6' />,
}

export function ServiceCard({
  service,
  projectId,
}: {
  service: Service
  projectId: string
}) {
  const { execute } = useAction(deleteServiceAction, {
    onSuccess: ({ data }) => {
      if (data?.deleted) {
        toast.info('Added to queue', {
          description: 'Added deleting service to queue',
        })
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to delete service ${error.serverError}`)
    },
  })

  return (
    <Link
      href={`/dashboard/project/${projectId}/service/${service.id}`}
      className='h-full'>
      <Card className='h-full min-h-36'>
        <CardHeader className='w-full flex-row justify-between'>
          <div className='flex items-center gap-x-3'>
            {service.type === 'database' && service.databaseDetails?.type
              ? databaseIcons[service.databaseDetails?.type]
              : icon[service.type]}

            <div className='flex-1 items-start'>
              <CardTitle>{service.name}</CardTitle>
              <CardDescription className='mt-1 line-clamp-1 w-3/4 text-wrap'>
                {service.description}
              </CardDescription>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild className='flex-shrink-0'>
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

        <CardFooter>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <time className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                  <Clock size={14} />
                  {`Created ${formatDistanceToNow(new Date(service.createdAt), {
                    addSuffix: true,
                  })}`}
                </time>
              </TooltipTrigger>

              <TooltipContent side='bottom'>
                <p>
                  {format(new Date(service.createdAt), 'LLL d, yyyy h:mm a')}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      </Card>
    </Link>
  )
}
