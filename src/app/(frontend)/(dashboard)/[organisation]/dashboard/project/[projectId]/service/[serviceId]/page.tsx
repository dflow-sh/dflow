import type { SearchParams } from 'nuqs/server'
import { Suspense } from 'react'

import { getServiceDetails } from '@/actions/pages/service'
import GeneralTab from '@/components/service/GeneralTab'
import ServiceSkeleton from '@/components/skeletons/ServiceSkeleton'

interface PageProps {
  params: Promise<{
    organisation: string
    projectId: string
    serviceId: string
  }>
  searchParams: Promise<SearchParams>
}

const SuspendedPage = async ({ params }: PageProps) => {
  const { serviceId } = await params

  const { data: service } = await getServiceDetails({
    id: serviceId,
  })

  const server =
    typeof service?.project === 'object' ? service.project.server : ''

  return <GeneralTab service={service!} server={server} />
}

const ServiceIdPage = async (props: PageProps) => {
  return (
    <Suspense fallback={<ServiceSkeleton />}>
      <SuspendedPage {...props} />
    </Suspense>
  )
}

export default ServiceIdPage
