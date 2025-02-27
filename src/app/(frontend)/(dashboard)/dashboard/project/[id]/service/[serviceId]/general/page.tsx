import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import GeneralTab from '@/components/service/GeneralTab'

interface PageProps {
  params: Promise<{
    id: string
    serviceId: string
  }>
}

const SuspendedPage = async ({ params }: PageProps) => {
  const { serviceId } = await params
  const payload = await getPayload({ config: configPromise })

  const service = await payload.findByID({
    collection: 'services',
    id: serviceId,
  })

  if (!service?.id) {
    return notFound()
  }

  return <GeneralTab service={service} />
}

const GeneralTabPage = ({ params }: PageProps) => {
  return (
    <Suspense fallback={<Loader className='h-96 w-full' />}>
      <SuspendedPage params={params} />
    </Suspense>
  )
}

export default GeneralTabPage
