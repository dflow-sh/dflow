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
import Link from 'next/link'
import { useState } from 'react'

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
import { cn } from '@/lib/utils'
import { Project, Server, Service } from '@/payload-types'

import DeleteProjectDialog from './DeleteProjectDialog'
import UpdateProject from './project/CreateProject'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

export function ProjectCard({
  project,
  servers,
  services,
  organisationSlug,
}: {
  project: Project
  servers: {
    id: string
    name: string
    onboarded?: boolean | null | undefined
    connection?:
      | {
          status?: ('success' | 'failed' | 'not-checked-yet') | null
          lastChecked?: string | null
        }
      | undefined
  }[]
  services: Service[]
  organisationSlug: string
}) {
  const [manualOpen, setManualOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const serverName = (project.server as Server)?.name
  const serverId = (project.server as Server)?.id
  const serverExists = servers.some(server => server.id === serverId)
  const isServerConnected =
    servers.find(server => server.id === serverId)?.connection?.status ===
    'success'

  const isDisabled = !serverExists || !isServerConnected

  const cardContent = (
    <Card
      className={cn(
        'h-full min-h-36 transition-all duration-200',
        isDisabled && 'border-l-4 border-l-red-500 hover:border-l-red-600',
      )}>
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
                setDeleteDialogOpen(true)
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
      <Link
        href={`/${organisationSlug}/dashboard/project/${project.id}`}
        className='group block h-full'>
        {cardContent}
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

      <DeleteProjectDialog
        project={project}
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        services={services}
      />
    </>
  )
}
