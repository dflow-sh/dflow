import LayoutClient from '../layout.client'
import {
  AlertCircle,
  Folder,
  Gift,
  Plus,
  PlusCircle,
  Server,
} from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

import { getDflowUser } from '@/actions/cloud/dFlow'
import { getProjectsAndServers } from '@/actions/pages/dashboard'
import { ProjectCard } from '@/components/ProjectCard'
import ServerTerminalClient from '@/components/ServerTerminalClient'
import CreateProject from '@/components/project/CreateProject'
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeletons'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Service } from '@/payload-types'

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
  const dflowUsers = await getDflowUser()
  const hasClaimedCredits =
    dflowUsers?.data?.users?.at(0)?.user?.hasClaimedFreeCredits

  const servers = result?.data?.serversRes.docs ?? []
  const projects = result?.data?.projectsRes.docs ?? []

  // Check if there are any servers available
  const hasServers = servers.length > 0

  // Check if there are any connected servers
  const hasConnectedServers = servers.some(
    server => server.connection?.status === 'success',
  )

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

        {/* Claim Credits Section */}
        {!hasClaimedCredits && (
          <div className='rounded-lg border border-info/50 bg-info-foreground/50 p-5 text-info dark:border-info'>
            <div className='flex items-center gap-4'>
              <Gift className='h-6 w-6 text-info' />
              <div className='flex flex-col'>
                <h4 className='text-lg font-medium text-info'>
                  Claim your free credits!
                </h4>
                <p className='text-sm text-info'>
                  You can claim rewards by joining our Discord community. Click
                  on Claim Rewards to continue on dflow.sh
                </p>
              </div>
              <div className='ml-auto'>
                <Button variant='default' asChild>
                  <a
                    href='https://dflow.sh/dashboard'
                    target='_blank'
                    rel='noopener noreferrer'>
                    Claim Rewards
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Server Alerts */}
        {!hasServers ? (
          <div className='grid min-h-[50vh] place-items-center'>
            <div className='max-w-md space-y-4 text-center'>
              <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted'>
                <Server className='h-8 w-8 animate-pulse text-muted-foreground' />
              </div>
              <h2 className='text-2xl font-semibold'>No Servers Available</h2>
              <p className='text-muted-foreground'>
                To get started, you need at least one server connected. Add a
                server to deploy your projects with ease.
              </p>
              <Link className='block' href={`/${organisationSlug}/servers`}>
                <Button variant='default'>
                  <PlusCircle className='mr-2 h-4 w-4' />
                  Create Server
                </Button>
              </Link>
            </div>
          </div>
        ) : !hasConnectedServers ? (
          <Alert variant='warning'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>SSH Connection Issue</AlertTitle>
            <AlertDescription>
              None of your servers have an active SSH connection. Projects may
              not function properly until SSH connections are established.
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Projects display */}
        {projects?.length ? (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {projects?.map((project, index) => {
              const services = (project?.services?.docs ?? []) as Service[]
              return (
                <ProjectCard
                  key={index}
                  organisationSlug={organisationSlug}
                  project={project}
                  servers={servers}
                  services={services}
                />
              )
            })}
          </div>
        ) : hasServers ? (
          <div className='grid min-h-[40vh] place-items-center'>
            <div className='max-w-md space-y-4 text-center'>
              <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted'>
                <Folder className='h-8 w-8 animate-pulse text-muted-foreground' />
              </div>
              <h2 className='text-2xl font-semibold'>No Projects Yet</h2>
              <p className='text-muted-foreground'>
                It looks like you haven’t created any projects yet. Start by
                creating a new one using a connected server.
              </p>
              <CreateProject servers={servers}>
                <Button variant='default'>
                  <Plus className='mr-2 h-4 w-4' />
                  Create Project
                </Button>
              </CreateProject>
            </div>
          </div>
        ) : null}
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
