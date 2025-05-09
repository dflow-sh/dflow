import LayoutClient from '../layout.client'
import configPromise from '@payload-config'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { getPayload } from 'payload'
import { Suspense, use } from 'react'

import ServerTerminalClient from '@/components/ServerTerminalClient'
import ServerCard from '@/components/servers/ServerCard'
import {
  CreateServerButtonSkeleton,
  ServersSkeleton,
} from '@/components/skeletons/ServersSkeleton'
import { Button } from '@/components/ui/button'
import { isDemoEnvironment } from '@/lib/constants'

interface PageProps {
  params: Promise<{
    organisation: string
  }>
}
const SuspendedServers = ({
  organisationSlug,
}: {
  organisationSlug: string
}) => {
  const payload = use(getPayload({ config: configPromise }))

  const { docs: servers } = use(
    payload.find({
      collection: 'servers',
      where: {
        'tenant.slug': {
          equals: organisationSlug,
        },
      },
      pagination: false,
    }),
  )

  return (
    <>
      {servers.length ? (
        <div className='grid gap-4 md:grid-cols-3'>
          {servers.map(server => (
            <ServerCard
              organisationSlug={organisationSlug}
              server={server}
              key={server.id}
            />
          ))}
        </div>
      ) : (
        <p className='text-center'>No Servers Added!</p>
      )}

      <ServerTerminalClient servers={servers} />
    </>
  )
}

const ServersPage = async ({ params }: PageProps) => {
  const syncParams = await params
  return (
    <LayoutClient>
      <div className='mb-5 flex items-center justify-between'>
        <div className='text-2xl font-semibold'>Servers</div>
        <Suspense fallback={<CreateServerButtonSkeleton />}>
          {isDemoEnvironment ? (
            <Button disabled={true} size={'default'} variant={'default'}>
              <Plus />
              Add New Server
            </Button>
          ) : (
            <Link href={`/${syncParams.organisation}/servers/add-new-server`}>
              <Button size={'default'} variant={'default'}>
                <Plus />
                Add New Server
              </Button>
            </Link>
          )}
        </Suspense>
      </div>
      <Suspense fallback={<ServersSkeleton />}>
        <SuspendedServers organisationSlug={syncParams.organisation} />
      </Suspense>
    </LayoutClient>
  )
}

export default ServersPage
