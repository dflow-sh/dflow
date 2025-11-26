import type { SearchParams } from 'nuqs/server'
import { getServiceDetails } from '@dflow/core/actions/pages/service'
import GeneralTab from '@dflow/core/components/service/GeneralTab'

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
  return <SuspendedPage {...props} />
}

export default ServiceIdPage
