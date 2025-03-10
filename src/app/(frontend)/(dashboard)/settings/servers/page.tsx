import configPromise from '@payload-config'
import { Plus } from 'lucide-react'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import PageHeader from '@/components/PageHeader'
import CreateServer from '@/components/servers/CreateServerForm'
import ServerCard from '@/components/servers/ServerCard'
import { Button } from '@/components/ui/button'

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
    <>
      <PageHeader
        title='Servers'
        action={
          <Suspense
            fallback={
              <Button disabled>
                <Plus />
                Add Server
              </Button>
            }>
            <SuspendedAddServer />
          </Suspense>
        }
      />

      <Suspense fallback={<Loader className='h-96 w-full' />}>
        <SuspendedPage />
      </Suspense>
    </>
  )
}

export default ServersPage
