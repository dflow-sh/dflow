import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import type { SearchParams } from 'nuqs/server'
import { getPayload } from 'payload'
import { Suspense, use } from 'react'

import DatabaseBackup from '@/components/service/DatabaseBackup'
import DeploymentList from '@/components/service/DeploymentList'
import DomainList from '@/components/service/DomainList'
import GeneralTab from '@/components/service/GeneralTab'
import LogsTab from '@/components/service/LogsTab'
import VariablesForm from '@/components/service/VariablesForm'
import { ServiceSkeleton } from '@/components/skeletons/ServiceSkeleton'
import { loadServicePageTabs } from '@/lib/searchParams'

interface PageProps {
  params: Promise<{
    id: string
    serviceId: string
  }>
  searchParams: Promise<SearchParams>
}

const SuspendedPage = ({ params, searchParams }: PageProps) => {
  const { id: projectId, serviceId } = use(params)
  const { tab } = use(loadServicePageTabs(searchParams))

  const payload = use(getPayload({ config: configPromise }))

  const service = use(
    payload.findByID({
      collection: 'services',
      id: serviceId,
      joins: {
        deployments: {
          limit: 1000,
        },
      },
    }),
  )

  if (!service?.id) {
    notFound()
  }

  const serverId =
    typeof service.project === 'object' ? service.project.server : ''

  const deployments = service.deployments?.docs ?? []
  const domains = service.domains ?? []

  switch (tab) {
    case 'general':
      return <GeneralTab service={service} />

    case 'environment':
      return <VariablesForm service={service} />

    case 'deployments':
      return (
        <DeploymentList
          deployments={deployments}
          serviceId={service.id}
          serverId={typeof serverId === 'object' ? serverId.id : serverId}
        />
      )

    case 'domains':
      return <DomainList domains={domains} />

    case 'logs':
      return (
        <LogsTab
          serviceId={service.id}
          serverId={typeof serverId === 'object' ? serverId.id : serverId}
        />
      )

    case 'backup':
      return <DatabaseBackup />

    // In default case also returning general tab
    default:
      return <GeneralTab service={service} />
  }
}

const ServiceIdPage = async (props: PageProps) => {
  return (
    <Suspense fallback={<ServiceSkeleton />}>
      <SuspendedPage {...props} />
    </Suspense>
  )
}

export default ServiceIdPage
