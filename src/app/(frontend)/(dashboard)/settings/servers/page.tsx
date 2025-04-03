import LayoutClient from '../../layout.client'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import CreateServer from '@/components/servers/CreateServerForm'
import ServerCard from '@/components/servers/ServerCard'

import ServersLoading from './ServersLoading'

const SuspendedAddServer = async () => {
  const payload = await getPayload({ config: configPromise })
  const { docs: keys } = await payload.find({
    collection: 'sshKeys',
    pagination: false,
  })

  return <CreateServer sshKeys={keys} />
}

const SuspendedPage = async () => {
  const payload = await getPayload({ config: configPromise })
  const { docs: servers } = await payload.find({
    collection: 'servers',
    pagination: false,
  })

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
    <Suspense fallback={<ServersLoading />}>
      <LayoutClient>
        <div className='mb-5 flex items-center justify-between'>
          <div className='text-2xl font-semibold'>Servers</div>
          <SuspendedAddServer />
        </div>
        <SuspendedPage />
      </LayoutClient>
    </Suspense>
  )
}

export default ServersPage
