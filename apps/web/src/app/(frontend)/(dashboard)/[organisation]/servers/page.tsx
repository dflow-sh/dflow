import LayoutClient from '../layout.client'
import { Plus, Server } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

import { getServersDetailsAction } from '@/actions/pages/server'
import AccessDeniedAlert from '@/components/AccessDeniedAlert'
import RefreshButton from '@/components/RefreshButton'
import SidebarToggleButton from '@/components/SidebarToggleButton'
import ServerCard from '@/components/servers/ServerCard'
import SyncDFlow from '@/components/servers/SyncDFlow'
import {
  CreateServerButtonSkeleton,
  ServersSkeleton,
} from '@/components/skeletons/ServersSkeleton'
import ServersEmptyState from '@/components/states/ServersEmptyState'
import { Button } from '@/components/ui/button'

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
