import configPromise from '@payload-config'
import { getPayload } from 'payload'

import CreateServer from '@/components/servers/CreateServerForm'
import ServerList from '@/components/servers/ServerList'

const ServersPage = async () => {
  const payload = await getPayload({ config: configPromise })
  const { docs: keys } = await payload.find({
    collection: 'sshKeys',
    limit: 1000,
  })

  const { docs: servers } = await payload.find({
    collection: 'servers',
    limit: 1000,
  })

  return (
    <section className='space-y-8'>
      <ServerList servers={servers} sshKeys={keys} />
      <CreateServer sshKeys={keys} />
    </section>
  )
}

export default ServersPage
