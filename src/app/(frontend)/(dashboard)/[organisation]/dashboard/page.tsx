import LayoutClient from '../layout.client'
import { AlertCircle, Folder, Plus, Server } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

import { getProjectsAndServers } from '@/actions/pages/dashboard'
import { ProjectCard } from '@/components/ProjectCard'
import ServerTerminalClient from '@/components/ServerTerminalClient'
import CreateProject from '@/components/project/CreateProject'
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeletons'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Project, Service } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

interface PageProps {
  params: Promise<{
    organisation: string
  }>
}

const Projects = ({
  servers,
  projects,
  organisationSlug,
  hasServers,
}: {
  servers: ServerType[]
  projects: Project[]
  organisationSlug: string
  hasServers: boolean
}) => {
  if (projects?.length) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {projects?.map(project => {
          const services = (project?.services?.docs ?? []) as Service[]
          return (
            <ProjectCard
              key={project.id}
              organisationSlug={organisationSlug}
              project={project}
              servers={servers}
              services={services}
            />
          )
        })}
      </div>
    )
  }

  if (!hasServers) {
    return (
      <div className='rounded-2xl border bg-muted/10 p-8 text-center shadow-sm'>
        <div className='grid min-h-[40vh] place-items-center'>
          <div className='max-w-md space-y-4 text-center'>
            <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted'>
              <Server className='h-8 w-8 animate-pulse text-muted-foreground' />
            </div>
            <h2 className='text-2xl font-semibold'>No Servers Available</h2>
            <p className='text-muted-foreground'>
              To get started, you need at least one server connected. Add a
              server to deploy your projects with ease.
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

  // hasServers but no projects
  return (
    <div className='rounded-2xl border bg-muted/10 p-8 text-center shadow-sm'>
      <div className='grid min-h-[40vh] place-items-center'>
        <div className='max-w-md space-y-4 text-center'>
          <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted'>
            <Folder className='h-8 w-8 animate-pulse text-muted-foreground' />
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

const SuspendedDashboard = async ({
  organisationSlug,
}: {
  organisationSlug: string
}) => {
  const result = await getProjectsAndServers()

  const servers = result?.data?.serversRes.docs ?? []
  const projects = result?.data?.projectsRes.docs ?? []

  // Check if there are any servers available
  const hasServers = servers.length > 0

  // Check if there are any connected servers
  const hasConnectedServers = servers.some(
    server => server.connection?.status === 'success',
  )

  const notOnboardedServers = servers.filter(server => !server.onboarded)

  return (
    <>
      <section className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='inline-flex items-center gap-1.5 text-2xl font-semibold'>
            <Folder />
            Projects
          </div>

          {hasServers && (
            <CreateProject servers={servers}>
              <Button>
                <Plus size={16} />
                Create Project
              </Button>
            </CreateProject>
          )}
        </div>

        {/* Complete Onboarding */}
        {notOnboardedServers.length > 0 && (
          <Alert variant='warning' className='mb-4'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Some servers are not fully onboarded</AlertTitle>
            <AlertDescription>
              <div className='mb-2'>
                The following servers need to complete onboarding before they
                can be used for deployments:
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

        {!hasConnectedServers && (
          <Alert variant='warning'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>SSH Connection Issue</AlertTitle>
            <AlertDescription>
              None of your servers have an active SSH connection. Projects may
              not function properly until SSH connections are established.
            </AlertDescription>
          </Alert>
        )}

        {/* Server Alerts and Projects display */}
        <Projects
          servers={servers as ServerType[]}
          projects={projects}
          organisationSlug={organisationSlug}
          hasServers={hasServers}
        />
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
