import LayoutClient from '../layout.client'
import { AlertCircle, Folder } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

import { getProjectsAndServers } from '@dflow/core/actions/pages/dashboard'
import AccessDeniedAlert from '@dflow/core/components/AccessDeniedAlert'
import CreateProjectButton from '@dflow/core/components/project/CreateProjectButton'
import ProjectFiltersSection from '@dflow/core/components/project/ProjectFiltersSection'
import { DashboardSkeleton } from '@dflow/core/components/skeletons/DashboardSkeletons'
import DashboardServersEmptyState from '@dflow/core/components/states/DashboardServersEmptyState'
import ProjectsEmptyState from '@dflow/core/components/states/ProjectsEmptyState'
import { Alert, AlertDescription, AlertTitle } from '@dflow/core/components/ui/alert'
import { ServerType } from '@dflow/core/payload-types-overrides'

interface PageProps {
  params: Promise<{
    organisation: string
  }>
}

const SuspendedDashboard = async ({
  organisationSlug,
}: {
  organisationSlug: string
}) => {
  const result = await getProjectsAndServers()

  const servers = result?.data?.serversRes.docs ?? []
  const projects = result?.data?.projectsRes.docs ?? []

  // Separate hidden and visible projects
  const hiddenProjects = projects.filter(project => project.hidden)
  const visibleProjects = projects.filter(project => !project.hidden)

  // Check if there are any servers available
  const hasServers = servers.length > 0
  const hasProjects = projects.length > 0

  // Check if there are any connection fail servers
  const allServersFailed = servers?.every(
    server => server.connection?.status === 'failed',
  )

  const notOnboardedServers = servers.filter(
    server => !server.onboarded && server.connection?.status === 'success',
  )

  const renderProjectSection = () => {
    if (!hasServers) {
      return <DashboardServersEmptyState />
    }

    if (!hasProjects) {
      return <ProjectsEmptyState />
    }

    return (
      <ProjectFiltersSection
        projects={visibleProjects}
        hiddenProjects={hiddenProjects}
        servers={servers as ServerType[]}
        organisationSlug={organisationSlug}
      />
    )
  }

  return (
    <>
      <section className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='inline-flex items-center gap-1.5 text-2xl font-semibold'>
            <Folder />
            Projects
          </div>
          <div className='flex items-center gap-3'>
            {hasServers && <CreateProjectButton servers={servers} />}
          </div>
        </div>

        {result?.serverError ? (
          <AccessDeniedAlert error={result?.serverError} />
        ) : (
          <>
            {/* Server Status Alerts */}
            {notOnboardedServers.length > 0 && (
              <Alert variant='warning' className='mb-4'>
                <AlertCircle className='h-4 w-4' />
                <AlertTitle>Some servers are not fully onboarded</AlertTitle>
                <AlertDescription>
                  <div className='mb-2'>
                    The following servers need to complete onboarding before
                    they can be used for deployments:
                  </div>
                  <ul className='mb-2 list-inside list-disc'>
                    {notOnboardedServers.map(server => (
                      <li key={server.id} className='font-medium'>
                        {server.name || server.id}
                      </li>
                    ))}
                  </ul>
                  <div>
                    <Link
                      href={`/${organisationSlug}/servers`}
                      className='font-semibold underline'>
                      Go to Servers page to complete onboarding
                    </Link>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {servers.length > 0 && allServersFailed && (
              <Alert variant='warning'>
                <AlertCircle className='h-4 w-4' />
                <AlertTitle>SSH Connection Issue</AlertTitle>
                <AlertDescription>
                  None of your servers have an active SSH connection. Projects
                  may not function properly until SSH connections are
                  established.
                  <br />
                  Go to{' '}
                  <a href={`servers`} className='text-primary underline'>
                    servers page
                  </a>{' '}
                  to check connection and refresh connections.
                </AlertDescription>
              </Alert>
            )}

            {/* Project Section */}
            {renderProjectSection()}
          </>
        )}
      </section>

      {/* <ServerTerminalClient servers={servers} /> */}
    </>
  )
}

const DashboardPage = async ({ params }: PageProps) => {
  const syncParams = await params
  return (
    <LayoutClient>
      <Suspense fallback={<DashboardSkeleton />}>
        <SuspendedDashboard organisationSlug={syncParams.organisation} />
      </Suspense>
    </LayoutClient>
  )
}

export default DashboardPage
