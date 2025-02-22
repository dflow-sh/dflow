import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import UpdateServerForm from '@/components/servers/UpdateServerForm'
import { ServerType } from '@/payload-types-overrides'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

const SuspendedPage = async ({ params }: PageProps) => {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })

  const server = await payload.findByID({
    collection: 'servers',
    id,
    context: {
      populateServerDetails: true,
    },
  })

  const { docs: sshKeys } = await payload.find({
    collection: 'sshKeys',
    pagination: false,
  })

  console.log({ server, id })

  if (!server?.id) {
    notFound()
  }

  return (
    <div className='space-y-4 rounded border p-4'>
      <UpdateServerForm server={server as ServerType} sshKeys={sshKeys} />
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
