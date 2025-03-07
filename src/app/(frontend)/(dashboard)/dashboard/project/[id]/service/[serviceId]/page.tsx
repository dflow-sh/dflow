import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import type { SearchParams } from 'nuqs/server'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import DeploymentList from '@/components/service/DeploymentList'
import DomainList from '@/components/service/DomainList'
import EnvironmentVariablesForm from '@/components/service/EnvironmentVariablesForm'
import GeneralTab from '@/components/service/GeneralTab'
import { loadServicePageTabs } from '@/lib/searchParams'

interface PageProps {
  params: Promise<{
    id: string
    serviceId: string
  }>
  searchParams: Promise<SearchParams>
}

const SuspendedPage = async ({ params, searchParams }: PageProps) => {
  const { id: projectId, serviceId } = await params
  const { tab } = await loadServicePageTabs(searchParams)

  const payload = await getPayload({ config: configPromise })

  const service = await payload.findByID({
    collection: 'services',
    id: serviceId,
    joins: {
      deployments: {
        limit: 1000,
      },
      domains: {
        limit: 1000,
      },
    },
  })

  if (!service?.id) {
    return notFound()
  }

  const deployments = service.deployments?.docs ?? []
  const domains = service.domains?.docs ?? []

  switch (tab) {
    case 'general':
      return <GeneralTab service={service} />

    case 'environment':
      return <EnvironmentVariablesForm service={service} />

    case 'deployments':
      return <DeploymentList deployments={deployments} />

    case 'domains':
      return <DomainList domains={domains} />

    case 'logs':
      return <p>Logs Tab</p>
    // In default case also returning general tab
    default:
      return <GeneralTab service={service} />
  }
}

const ServiceIdPage = ({ params, searchParams }: PageProps) => {
  return (
    <Suspense fallback={<Loader className='h-96 w-full' />}>
      <SuspendedPage params={params} searchParams={searchParams} />
    </Suspense>
  )
}

export default ServiceIdPage
