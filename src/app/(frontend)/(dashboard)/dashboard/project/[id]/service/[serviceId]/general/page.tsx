import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import BuildTypeForm from '@/components/service/BuildTypeForm'
import DeploymentForm from '@/components/service/DeploymentForm'
import ProviderForm from '@/components/service/ProviderForm'

interface PageProps {
  params: Promise<{
    id: string
    serviceId: string
  }>
}

const SuspendedPage = async ({ params }: PageProps) => {
  const { id, serviceId } = await params
  const payload = await getPayload({ config: configPromise })

  const service = await payload.findByID({
    collection: 'services',
    id: serviceId,
  })

  const { docs: gitProviders } = await payload.find({
    collection: 'gitProviders',
    limit: 1000,
  })

  return (
    <div className='space-y-4'>
      <DeploymentForm />
      <ProviderForm service={service} gitProviders={gitProviders} />
      <BuildTypeForm service={service} />
    </div>
  )
}

const GeneralTabPage = ({ params }: PageProps) => {
  return (
    <Suspense fallback={<Loader className='h-96 w-full' />}>
      <SuspendedPage params={params} />
    </Suspense>
  )
}

export default GeneralTabPage
