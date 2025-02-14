import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import DeploymentList from '@/components/service/DeploymentList'

interface PageProps {
  params: Promise<{
    id: string
    serviceId: string
  }>
}

const SuspendedPage = async ({ params }: PageProps) => {
  const { id, serviceId } = await params
  const payload = await getPayload({ config: configPromise })

  const { docs: deployments } = await payload.find({
    collection: 'deployments',
    where: {
      'service.id': {
        equals: serviceId,
      },
    },
  })

  return <DeploymentList deployments={deployments} />
}

const DeploymentsPage = async ({ params }: PageProps) => {
  return (
    <Suspense fallback={<Loader className='h-96 w-full' />}>
      <SuspendedPage params={params} />
    </Suspense>
  )
}

export default DeploymentsPage
