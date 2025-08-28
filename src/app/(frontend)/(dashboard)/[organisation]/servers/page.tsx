import LayoutClient from '../layout.client'
import { Plus, Server } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

import { getServersDetailsAction } from '@/actions/pages/server'
import AccessDeniedAlert from '@/components/AccessDeniedAlert'
import RefreshButton from '@/components/RefreshButton'
import ServerTerminalClient from '@/components/ServerTerminalClient'
import SidebarToggleButton from '@/components/SidebarToggleButton'
import ServerCard from '@/components/servers/ServerCard'
import SyncDFlow from '@/components/servers/SyncDFlow'
import {
  CreateServerButtonSkeleton,
  ServersSkeleton,
} from '@/components/skeletons/ServersSkeleton'
import { Button } from '@/components/ui/button'
import { ServerType } from '@/payload-types-overrides'

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
    populateServerDetails: !refreshServerDetails,
    refreshServerDetails,
  })
  const servers = result?.data?.servers ?? []

  return (
    <>
      {result?.serverError ? (
        <AccessDeniedAlert error={result?.serverError} />
      ) : servers.length ? (
        <div className='grid gap-4 md:grid-cols-3'>
          {servers.map(server => (
            <ServerCard
              organisationSlug={organisationSlug}
              server={server as ServerType}
              key={server.id}
            />
          ))}
        </div>
      ) : (
        <div className='rounded-2xl border bg-muted/10 p-8 text-center shadow-xs'>
          <div className='grid min-h-[40vh] place-items-center'>
            <div>
              <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted'>
                <Server className='h-8 w-8 animate-pulse text-muted-foreground' />
              </div>

              <div className='my-4'>
                <h3 className='text-xl font-semibold text-foreground'>
                  No Servers Added
                </h3>
                <p className='text-base text-muted-foreground'>
                  Get started by adding your first server.
                </p>
              </div>

              <Link
                className='block'
                href={`/${organisationSlug}/servers/add-new-server`}>
                <Button className='mt-2'>
                  <Plus className='h-4 w-4' />
                  Add Your First Server
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <ServerTerminalClient servers={servers} />
    </>
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
