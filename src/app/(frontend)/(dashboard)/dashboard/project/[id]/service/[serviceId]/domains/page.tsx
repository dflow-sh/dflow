import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import DomainList from '@/components/service/DomainList'

interface PageProps {
  params: Promise<{
    id: string
    serviceId: string
  }>
}

const SuspendedPage = async ({ params }: PageProps) => {
  const { serviceId } = await params
  const payload = await getPayload({ config: configPromise })

  const { docs: domains } = await payload.find({
    collection: 'domains',
    where: {
      'service.id': {
        equals: serviceId,
      },
    },
  })

  return <DomainList domains={domains} />
}

const DomainsPage = async ({ params }: PageProps) => {
  return (
    <Suspense fallback={<Loader className='h-96 w-full' />}>
      <SuspendedPage params={params} />
    </Suspense>
  )
}

export default DomainsPage
