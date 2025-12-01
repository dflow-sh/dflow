'use client'

import CreateService from '../service/CreateService'
import DeployTemplate from '../templates/DeployTemplate'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { EllipsisVertical } from 'lucide-react'
import { useState } from 'react'

import { Project, Server, Service } from '@dflow/core/payload-types'

import CreateTemplateFromProject from './CreateTemplateFromProject'

const ProjectOptionsDropdown = ({
  project,
  services,
  isServerConnected,
}: {
  project: Partial<Project>
  services: Service[]
  isServerConnected: boolean
}) => {
  const [open, setOpen] = useState(false)
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className='border-border hover:bg-accent h-10 w-10 rounded-md border text-center'>
        <EllipsisVertical className='mx-auto h-6 w-6' />
      </DropdownMenuTrigger>
      <DropdownMenuContent side='bottom'>
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={e => e.preventDefault()}>
            <DeployTemplate
              server={project.server as Server}
              disableDeployButton={!isServerConnected}
              disableReason={'Cannot deploy template: Server is not connected'}
            />
          </DropdownMenuItem>
          {services?.length > 0 && (
            <>
              <DropdownMenuItem onSelect={e => e.preventDefault()}>
                <CreateTemplateFromProject
                  services={services}
                  projectName={project?.name!}
                />
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={e => e.preventDefault()}>
                <CreateService
                  server={project.server as Server}
                  project={project}
                  disableCreateButton={!isServerConnected}
                  disableReason={
                    'Cannot create service: Server is not connected'
                  }
                />
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProjectOptionsDropdown
