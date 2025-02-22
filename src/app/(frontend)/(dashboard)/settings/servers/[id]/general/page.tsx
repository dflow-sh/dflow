import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import PluginsList from '@/components/servers/PluginsList'
import UpdateServerForm from '@/components/servers/UpdateServerForm'
import { supportedLinuxVersions } from '@/lib/constants'
import { ServerType } from '@/payload-types-overrides'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

const SuspendedPage = async ({ params }: PageProps) => {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })

  const server = (await payload.findByID({
    collection: 'servers',
    id,
    context: {
      populateServerDetails: true,
    },
  })) as ServerType

  const { docs: sshKeys } = await payload.find({
    collection: 'sshKeys',
    pagination: false,
  })

  if (!server?.id) {
    notFound()
  }

  const dokkuInstalled =
    server.sshConnected &&
    supportedLinuxVersions.includes(server.os.version ?? '') &&
    server.version

  return (
    <div className='space-y-6'>
      <UpdateServerForm server={server as ServerType} sshKeys={sshKeys} />
      {dokkuInstalled && <PluginsList server={server as ServerType} />}
    </div>
  )
}

const ServerIdPage = ({ params }: PageProps) => {
  return (
    <Suspense fallback={<Loader className='h-96 w-full' />}>
      <SuspendedPage params={params} />
    </Suspense>
  )
}

export default ServerIdPage
