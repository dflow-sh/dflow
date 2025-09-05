import { FolderOpen, ScreenShareOff } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import {
  getProjectBreadcrumbs,
  getProjectDetails,
} from '@/actions/pages/project'
import AccessDeniedAlert from '@/components/AccessDeniedAlert'
import SidebarToggleButton from '@/components/SidebarToggleButton'
import CreateTemplateFromProject from '@/components/project/CreateTemplateFromProject'
import CreateService from '@/components/service/CreateService'
import ServiceList from '@/components/service/ServiceList'
import ServicesArchitecture from '@/components/service/ServicesArchitecture'
import DeployTemplate from '@/components/templates/DeployTemplate'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Project, Server, Service } from '@/payload-types'
import { ArchitectureContextProvider } from '@/providers/ArchitectureProvider'

import ClientLayout from './layout.client'

interface Props {
  params: Promise<{
    id: string
    organisation: string
  }>
  children: React.ReactNode
}

const GeneralTab: React.FC<{
  services: Service[]
  project: Partial<Project>
  organisation: string
  isServerConnected: boolean
}> = ({ services, project, organisation, isServerConnected }) => {
  const formattedServices = services?.length
    ? services.map(service => {
        const serviceName = service.name.replace(`${project.name}-`, '')
        return { ...service, displayName: serviceName }
      })
    : []

  return (
    <>
      <div className='mx-auto flex w-full max-w-6xl justify-between px-4'>
        <div>
          <h2 className='flex items-center text-2xl font-semibold'>
            <FolderOpen className='mr-2 h-6 w-6' />
            {project.name}
            <SidebarToggleButton
              directory='services'
              fileName='services-overview'
            />
          </h2>

          <p className='text-muted-foreground text-sm'>{project.description}</p>
        </div>

        {typeof project.server === 'object' && (
          <div className='flex items-center gap-3'>
            <DeployTemplate
              server={project.server}
              disableDeployButton={!isServerConnected}
              disableReason={'Cannot deploy template: Server is not connected'}
            />

            {services?.length ? (
              <>
                <CreateTemplateFromProject
                  services={services}
                  projectName={project?.name!}
                />

                <CreateService
                  server={project.server}
                  project={project}
                  disableCreateButton={!isServerConnected}
                  disableReason={
                    'Cannot create service: Server is not connected'
                  }
                />
              </>
            ) : null}
          </div>
        )}
      </div>
      <div className='w-full border-b pt-4' />
      {formattedServices.length ? (
        <ServiceList
          organisationSlug={organisation}
          project={project}
          services={formattedServices}
        />
      ) : typeof project.server === 'object' ? (
        <ServicesArchitecture server={project.server} />
      ) : null}
    </>
  )
}

const SuspendedPage = async ({
  params,
}: {
  params: { id: string; organisation: string }
}) => {
  const { id, organisation } = params

  const result = await getProjectDetails({ id })

  const data = result?.data
  const project = data?.Projects?.[0]

  if (!project) {
    return <AccessDeniedAlert error={result?.serverError!} />
  }

  const { services } = data

  const isServerConnected = Boolean(
    project.server &&
      typeof project.server === 'object' &&
      project.server.connection?.status === 'success',
  )

  return (
    <ArchitectureContextProvider>
      <section>
        {/* Display SSH connection alert if server is not connected */}
        {typeof project.server === 'object' && !isServerConnected && (
          <Alert variant='destructive' className='mt-4 mb-4'>
            <ScreenShareOff className='h-4 w-4' />
            <AlertTitle>SSH Connection Failed</AlertTitle>
            <AlertDescription>
              Unable to establish SSH connection to the server. Please verify
              your server credentials and SSH key configuration. Server
              operations, including service creation and deployment, are
              unavailable until the connection is restored.{' '}
              <Link
                href={`/${organisation}/servers/${project.server.id}`}
                className='text-primary hover:text-primary text-sm font-normal hover:underline hover:underline-offset-4'>
                Go to server settings
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <GeneralTab
          services={services}
          project={project}
          organisation={organisation}
          isServerConnected={isServerConnected}
        />
      </section>
    </ArchitectureContextProvider>
  )
}

const layout = async ({ children, params }: Props) => {
  const syncParams = await params
  const { id } = syncParams
  const result = await getProjectBreadcrumbs({ id })

  const project = result?.data?.project?.docs?.at(0)

  return (
    <ClientLayout
      project={{
        id: project?.id!,
        name: project?.name!,
      }}
      projects={result?.data?.projects?.docs as Project[]}
      server={project?.server as Server}>
      <SuspendedPage params={syncParams} />
      {children}
    </ClientLayout>
  )
}

export default layout
