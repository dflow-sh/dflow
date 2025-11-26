import { Suspense } from 'react'
import { Plus, Server } from 'lucide-react'
import Link from 'next/link'
import { getServersDetailsAction } from '@dflow/core/actions/pages/server'
import AccessDeniedAlert from '@dflow/core/components/AccessDeniedAlert'
import RefreshButton from '@dflow/core/components/RefreshButton'
import ServerCard from '@dflow/core/components/servers/ServerCard'
import SyncDFlow from '@dflow/core/components/servers/SyncDFlow'
import SidebarToggleButton from '@dflow/core/components/SidebarToggleButton'
import {
  CreateServerButtonSkeleton,
  ServersSkeleton,
} from '@dflow/core/components/skeletons/ServersSkeleton'
import ServersEmptyState from '@dflow/core/components/states/ServersEmptyState'
import { Button } from '@dflow/core/components/ui/button'
import LayoutClient from '../layout.client'

interface PageProps {
  params: Promise<{
    organisation: string
  }>
  searchParams: Promise<{
    refreshServerDetails?: boolean
  }>
}

const SuspendedServers = async ({
  organisationSlug,
  refreshServerDetails,
}: {
  organisationSlug: string
  refreshServerDetails: boolean
}) => {
  const result = await getServersDetailsAction({
    refreshServerDetails,
  })
  const servers = result?.data?.servers ?? []

  if (result?.serverError) {
    return <AccessDeniedAlert error={result?.serverError} />
  }

  if (!servers.length) {
    return <ServersEmptyState />
  }

  return (
    <div className='grid gap-4 md:grid-cols-3'>
      {servers.map(server => (
        <ServerCard
          organisationSlug={organisationSlug}
          server={server}
          key={server.id}
        />
      ))}
    </div>
  )
}

const ServersPage = async ({ params, searchParams }: PageProps) => {
  const [syncParams, syncSearchParams] = await Promise.all([
    params,
    searchParams,
  ])

  return (
    <LayoutClient>
      <div className='mb-5 flex items-center justify-between'>
        <div className='flex items-center gap-1.5 text-2xl font-semibold'>
          <Server />
          Servers
          <SidebarToggleButton directory='servers' fileName='server-overview' />
        </div>

        <div className='flex gap-2'>
          <RefreshButton />

          <Suspense fallback={<CreateServerButtonSkeleton />}>
            <SyncDFlow />

            <Link href={`/${syncParams.organisation}/servers/add-new-server`}>
              <Button variant={'default'}>
                <Plus size={16} />
                Add New Server
              </Button>
            </Link>
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<ServersSkeleton />}>
        <SuspendedServers
          organisationSlug={syncParams.organisation}
          refreshServerDetails={
            String(syncSearchParams.refreshServerDetails) === 'true'
          }
        />
      </Suspense>
    </LayoutClient>
  )
}

export default ServersPage
