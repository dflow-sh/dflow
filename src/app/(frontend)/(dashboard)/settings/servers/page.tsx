import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import ServerCard from '@/components/servers/ServerCard'

const SuspendedPage = async () => {
  const payload = await getPayload({ config: configPromise })
  const { docs: servers } = await payload.find({
    collection: 'servers',
    pagination: false,
  })

  console.log({ servers })

  return servers.length ? (
    <div className='grid gap-4 md:grid-cols-3'>
      {servers.map(server => (
        <ServerCard server={server} key={server.id} />
      ))}
    </div>
  ) : (
    <p className='text-center'>No Servers Added!</p>
  )
}

const ServersPage = async () => {
  return (
    <Suspense fallback={<Loader className='h-96 w-full' />}>
      <SuspendedPage />
    </Suspense>
  )
}

export default ServersPage
