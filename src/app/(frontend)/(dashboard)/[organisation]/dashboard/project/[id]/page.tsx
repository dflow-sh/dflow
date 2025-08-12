import { FolderOpen, ScreenShareOff } from 'lucide-react'
import Link from 'next/link'
import type { SearchParams } from 'nuqs/server'
import { Suspense } from 'react'

import { getProjectDetails } from '@/actions/pages/project'
import AccessDeniedAlert from '@/components/AccessDeniedAlert'
import SidebarToggleButton from '@/components/SidebarToggleButton'
import CreateTemplateFromProject from '@/components/project/CreateTemplateFromProject'
import ProjectSettingsTab from '@/components/project/ProjectSettingsTab'
import ProjectTabsList from '@/components/project/ProjectTabList'
import CreateService from '@/components/service/CreateService'
import ServiceList from '@/components/service/ServiceList'
import ServicesArchitecture from '@/components/service/ServicesArchitecture'
import ServicesSkeleton from '@/components/skeletons/ServicesSkeleton'
import DeployTemplate from '@/components/templates/DeployTemplate'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { loadProjectPageTabs } from '@/lib/searchParams'
import { Project, Service } from '@/payload-types'
import { ArchitectureContextProvider } from '@/providers/ArchitectureProvider'

interface PageProps {
  params: Promise<{
    id: string
    organisation: string
  }>
  searchParams: Promise<SearchParams>
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
      <div className='flex w-full justify-between'>
        <div>
          <h2 className='flex items-center text-2xl font-semibold'>
            <FolderOpen className='mr-2 h-6 w-6' />
            {project.name}
            <SidebarToggleButton
              directory='services'
              fileName='services-overview'
            />
          </h2>

          <p className='text-sm text-muted-foreground'>{project.description}</p>
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
  searchParams,
}: {
  params: { id: string; organisation: string }
  searchParams: Promise<SearchParams>
}) => {
  const { id, organisation } = params

  const { tab } = await loadProjectPageTabs(searchParams)

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

  const renderTab = () => {
    switch (tab) {
      case 'general':
        return (
          <Suspense fallback={<ServicesSkeleton />}>
            <GeneralTab
              services={services}
              project={project}
              organisation={organisation}
              isServerConnected={isServerConnected}
            />
          </Suspense>
        )

      case 'settings':
        return (
          <Suspense fallback={<></>}>
            <ProjectSettingsTab services={services} project={project} />
          </Suspense>
        )

      default:
        return (
          <Suspense fallback={<ServicesSkeleton />}>
            <GeneralTab
              services={services}
              project={project}
              organisation={organisation}
              isServerConnected={isServerConnected}
            />
          </Suspense>
        )
    }
  }

  return (
    <ArchitectureContextProvider>
      <section>
        {/* Display SSH connection alert if server is not connected */}
        {typeof project.server === 'object' && !isServerConnected && (
          <Alert variant='destructive' className='mb-4 mt-4'>
            <ScreenShareOff className='h-4 w-4' />
            <AlertTitle>SSH Connection Failed</AlertTitle>
            <AlertDescription>
              Unable to establish SSH connection to the server. Please verify
              your server credentials and SSH key configuration. Server
              operations, including service creation and deployment, are
              unavailable until the connection is restored.{' '}
              <Link
                href={`/${organisation}/servers/${project.server.id}`}
                className='text-sm font-normal text-primary hover:text-primary hover:underline hover:underline-offset-4'>
                Go to server settings
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {renderTab()}
      </section>
    </ArchitectureContextProvider>
  )
}

const ProjectIdPage = async ({ params, searchParams }: PageProps) => {
  const syncParams = await params

  return (
    <ProjectTabsList>
      <SuspendedPage params={syncParams} searchParams={searchParams} />
    </ProjectTabsList>
  )
}

export default ProjectIdPage
