import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import type { SearchParams } from 'nuqs/server'
import { getPayload } from 'payload'
import { Suspense, use } from 'react'

import Backup from '@/components/service/Backup'
import DeploymentList from '@/components/service/DeploymentList'
import DomainList from '@/components/service/DomainList'
import GeneralTab from '@/components/service/GeneralTab'
import LogsTabClient from '@/components/service/LogsTabClient'
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
  const { serviceId } = use(params)
  const { tab } = use(loadServicePageTabs(searchParams))

  const payload = use(getPayload({ config: configPromise }))

  const [service, { docs: deployments }, { docs: backupsDocs }] = use(
    Promise.all([
      payload.findByID({
        collection: 'services',
        id: serviceId,
      }),
      payload.find({
        collection: 'deployments',
        where: {
          service: {
            equals: serviceId,
          },
        },
      }),
      payload.find({
        collection: 'backups',
        where: {
          service: {
            equals: serviceId,
          },
        },
      }),
    ]),
  )

  if (!service?.id) {
    notFound()
  }

  const serverId =
    typeof service.project === 'object' ? service.project.server : ''

  const domains = service.domains ?? []
  const databaseDetails = service.databaseDetails ?? {}

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
        <LogsTabClient
          serviceId={service.id}
          serverId={typeof serverId === 'object' ? serverId.id : serverId}
        />
      )
    case 'backup':
      return (
        <Backup
          databaseDetails={databaseDetails}
          serviceId={serviceId}
          backups={backupsDocs}
        />
      )

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
