'use client'

import { Docker, MariaDB, MongoDB, MySQL, PostgreSQL, Redis } from '../icons'
import {
  ChevronRight,
  Database,
  Folder,
  FolderOpen,
  Github,
  LayersIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { JSX, useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Project, Service } from '@/payload-types'

const icon: { [key in Service['type']]: JSX.Element } = {
  app: <Github className='size-4' />,
  database: <Database className='size-4 text-destructive' />,
  docker: <Docker className='size-4' />,
}

type StatusType = NonNullable<NonNullable<Service['databaseDetails']>['type']>

const databaseIcons: {
  [key in StatusType]: JSX.Element
} = {
  postgres: <PostgreSQL className='size-4' />,
  mariadb: <MariaDB className='size-4' />,
  mongo: <MongoDB className='size-4' />,
  mysql: <MySQL className='size-4' />,
  redis: <Redis className='size-4' />,
}
const ProjectsCard = ({ projects }: { projects: Project[] }) => {
  const params = useParams()
  const [openProjectId, setOpenProjectId] = useState<string | null>(null)

  const toggleProject = (projectId: string) => {
    setOpenProjectId(prev => (prev === projectId ? null : projectId))
  }

  // Calculate total services count
  const totalServicesCount = projects.reduce((total, project) => {
    return total + (project.services?.docs?.length || 0)
  }, 0)

  return (
    <Card className='h-full w-full rounded-sm border-none'>
      <CardHeader className='border-b'>
        <CardTitle className='flex items-center gap-3'>
          <LayersIcon className='h-6 w-6 text-muted-foreground' />
          <span className='flex flex-col font-semibold'>
            <span>Projects & Services</span>
            <span className='text-sm text-muted-foreground'>
              ({projects.length}{' '}
              {projects.length === 1 ? 'Project' : 'Projects'},{' '}
              {totalServicesCount}{' '}
              {totalServicesCount === 1 ? 'Service' : 'Services'})
            </span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className='p-0'>
        {projects.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <p className='text-sm text-muted-foreground'>No projects found</p>
          </div>
        ) : (
          <div>
            {projects.map(project => (
              <div
                key={project.id}
                className='relative border-b last:border-b-0'>
                <div
                  onClick={() => toggleProject(project.id)}
                  className='cursor-pointer'>
                  <div className='flex items-center justify-between p-4 pb-2 pr-6'>
                    <div className='flex w-full items-center space-x-3'>
                      <div className='flex items-center space-x-2'>
                        <ChevronRight
                          className={cn(
                            'h-4 w-4 text-muted-foreground transition-transform',
                            openProjectId === project.id ? 'rotate-90' : '',
                          )}
                        />
                        {openProjectId === project.id ? (
                          <FolderOpen className='h-5 w-5' />
                        ) : (
                          <Folder className='h-5 w-5 text-muted-foreground' />
                        )}
                      </div>
                      <div className='flex-grow'>
                        <Link
                          href={`/${params.organisation}/dashboard/project/${project.id}`}>
                          <span className='text-sm font-medium hover:text-primary'>
                            {project.name}
                          </span>
                        </Link>
                        <div className='text-xs text-muted-foreground'>
                          {project.services?.docs?.length || 0}{' '}
                          {project.services?.docs?.length === 1
                            ? 'Service'
                            : 'Services'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {openProjectId === project.id &&
                  project.services?.docs &&
                  project.services.docs.length > 0 && (
                    <div className='ml-12 space-y-2 px-4 py-2'>
                      {project.services.docs.map(service => {
                        if (typeof service === 'string') return null

                        return (
                          <Link
                            key={service.id}
                            href={`/${params.organisation}/dashboard/project/${project.id}/service/${service.id}`}
                            className='group block'>
                            <div className='flex items-center rounded-md border p-2 text-sm'>
                              <div className='mr-3'>
                                {service.type === 'database' &&
                                service.databaseDetails?.type
                                  ? databaseIcons[service.databaseDetails?.type]
                                  : icon[service.type]}
                              </div>
                              <span className='text-sm group-hover:text-primary'>
                                {service.name}
                              </span>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export const ProjectsAndServicesSection = ({
  projects,
}: {
  projects: Project[]
}) => {
  return (
    <div className='grid grid-cols-1 gap-4'>
      <ProjectsCard projects={projects} />
    </div>
  )
}

export default ProjectsAndServicesSection
