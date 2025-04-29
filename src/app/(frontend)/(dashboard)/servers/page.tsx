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

const SuspendedServers = () => {
  const payload = use(getPayload({ config: configPromise }))

  const { docs: servers } = use(
    payload.find({ collection: 'servers', pagination: false }),
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
        <p className='text-center'>No Servers Added!</p>
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
        <Suspense fallback={<CreateServerButtonSkeleton />}>
          {isDemoEnvironment ? (
            <Button disabled={true} size={'default'} variant={'default'}>
              <Plus />
              Add New Server
            </Button>
          ) : (
            <Link href={'/servers/add-new-server'}>
              <Button size={'default'} variant={'default'}>
                <Plus />
                Add New Server
              </Button>
            </Link>
          )}
        </Suspense>
      </div>
      <Suspense fallback={<ServersSkeleton />}>
        <SuspendedServers />
      </Suspense>
    </LayoutClient>
  )
}

export default ServersPage
