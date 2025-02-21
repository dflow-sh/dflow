import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'

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
  })

  console.log({ server, id })

  if (!server?.id) {
    notFound()
  }

  return <p>Server Details Page</p>
}

const ServerIdPage = ({ params }: PageProps) => {
  return (
    <Suspense fallback={<Loader className='h-96 w-full' />}>
      <SuspendedPage params={params} />
    </Suspense>
  )
}

export default ServerIdPage
