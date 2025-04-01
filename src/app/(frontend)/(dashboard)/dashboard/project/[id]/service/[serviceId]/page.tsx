import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import type { SearchParams } from 'nuqs/server'
import { getPayload } from 'payload'

import DeploymentList from '@/components/service/DeploymentList'
import DomainList from '@/components/service/DomainList'
import EnvironmentVariablesForm from '@/components/service/EnvironmentVariablesForm'
import GeneralTab from '@/components/service/GeneralTab'
import LogsTab from '@/components/service/LogsTab'
import { loadServicePageTabs } from '@/lib/searchParams'

interface PageProps {
  params: Promise<{
    id: string
    serviceId: string
  }>
  searchParams: Promise<SearchParams>
}

const ServiceIdPage = async ({ params, searchParams }: PageProps) => {
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
    },
  })

  const serverId =
    typeof service.project === 'object' ? service.project.server : ''

  if (!service?.id) {
    return notFound()
  }

  const deployments = service.deployments?.docs ?? []
  const domains = service.domains ?? []

  switch (tab) {
    case 'general':
      return <GeneralTab service={service} />

    case 'environment':
      return <EnvironmentVariablesForm service={service} />

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
    // In default case also returning general tab
    default:
      return <GeneralTab service={service} />
  }
}

export default ServiceIdPage
