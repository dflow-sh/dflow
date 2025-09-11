import LayoutClient from '../layout.client'
import { AlertCircle, Folder, Plus, Server } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

import { getProjectsAndServers } from '@/actions/pages/dashboard'
import AccessDeniedAlert from '@/components/AccessDeniedAlert'
import ServerTerminalClient from '@/components/ServerTerminalClient'
import CreateProjectButton from '@/components/project/CreateProjectButton'
import ProjectFiltersSection from '@/components/project/ProjectFiltersSection'
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeletons'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ServerType } from '@/payload-types-overrides'

interface PageProps {
  params: Promise<{
    organisation: string
  }>
}

const EmptyState = ({
  organisationSlug,
  hasServers,
  hasProjects,
}: {
  organisationSlug: string
  hasServers: boolean
  hasProjects: boolean
}) => {
  if (!hasServers) {
    return (
      <div className='bg-muted/10 rounded-2xl border p-8 text-center shadow-xs'>
        <div className='grid min-h-[40vh] place-items-center'>
          <div className='max-w-md space-y-4 text-center'>
            <div className='bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
              <Server className='text-muted-foreground h-8 w-8 animate-pulse' />
            </div>
            <h2 className='text-2xl font-semibold'>No Servers Available</h2>
            <p className='text-muted-foreground text-balance'>
              You need at least one server to get started. Add a server to
              deploy your projects.
            </p>
            <Link
              className='block'
              href={`/${organisationSlug}/servers/add-new-server`}>
              <Button variant='default'>
                <Plus />
                Create Server
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!hasProjects) {
    return (
      <div className='bg-muted/10 rounded-2xl border p-8 text-center shadow-xs'>
        <div className='grid min-h-[40vh] place-items-center'>
          <div className='max-w-md space-y-4 text-center'>
            <div className='bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
              <Folder className='text-muted-foreground h-8 w-8 animate-pulse' />
            </div>
            <h2 className='text-2xl font-semibold'>No Projects Yet</h2>
            <p className='text-muted-foreground'>
              It looks like you haven&apos;t created any projects yet. Start by
              creating a new one using a connected server.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
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

            {/* Projects Display with Popover Filters */}
            {hasServers && hasProjects ? (
              <ProjectFiltersSection
                projects={visibleProjects}
                hiddenProjects={hiddenProjects}
                servers={servers as ServerType[]}
                organisationSlug={organisationSlug}
              />
            ) : (
              <EmptyState
                organisationSlug={organisationSlug}
                hasServers={hasServers}
                hasProjects={hasProjects}
              />
            )}
          </>
        )}
      </section>

      <ServerTerminalClient servers={servers} />
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
