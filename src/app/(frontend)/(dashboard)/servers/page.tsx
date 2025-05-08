import LayoutClient from '../layout.client'
import configPromise from '@payload-config'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { getPayload } from 'payload'
import { Suspense, use } from 'react'

import RefreshButton from '@/components/RefreshButton'
import ServerTerminalClient from '@/components/ServerTerminalClient'
import ServerCard from '@/components/servers/ServerCard'
import {
  CreateServerButtonSkeleton,
  ServersSkeleton,
} from '@/components/skeletons/ServersSkeleton'
import { Button } from '@/components/ui/button'
import { isDemoEnvironment } from '@/lib/constants'

const SuspendedServers = () => {
  const payload = use(getPayload({ config: configPromise }))

  const { docs: servers } = use(
    payload.find({
      collection: 'servers',
      pagination: false,
      context: { populateServerDetails: true },
    }),
  )

  return (
    <>
      {servers.length ? (
        <div className='grid gap-4 md:grid-cols-3'>
          {servers.map(server => (
            <ServerCard server={server} key={server.id} />
          ))}
        </div>
      ) : (
        <div className='rounded-lg border bg-muted/20 py-12 text-center'>
          <h3 className='mb-2 text-lg font-medium'>No Servers Added!</h3>
          <p className='mb-4 text-muted-foreground'>
            Get started by adding your first server.
          </p>
          {!isDemoEnvironment && (
            <Link href='/servers/add-new-server'>
              <Button size='sm'>
                <Plus className='mr-2 h-4 w-4' />
                Add Your First Server
              </Button>
            </Link>
          )}
        </div>
      )}

      <ServerTerminalClient servers={servers} />
    </>
  )
}

const ServersPage = async () => {
  return (
    <LayoutClient>
      <div className='mb-5 flex items-center justify-between'>
        <div className='text-2xl font-semibold'>Servers</div>
        <div className='flex gap-2'>
          <RefreshButton /> {/* Use the client component here */}
          <Suspense fallback={<CreateServerButtonSkeleton />}>
            {isDemoEnvironment ? (
              <Button disabled={true} size={'default'} variant={'default'}>
                <Plus className='mr-2 h-4 w-4' />
                Add New Server
              </Button>
            ) : (
              <Link href={'/servers/add-new-server'}>
                <Button size={'default'} variant={'default'}>
                  <Plus className='mr-2 h-4 w-4' />
                  Add New Server
                </Button>
              </Link>
            )}
          </Suspense>
        </div>
      </div>
      <Suspense fallback={<ServersSkeleton />}>
        <SuspendedServers />
      </Suspense>
    </LayoutClient>
  )
}

export default ServersPage
