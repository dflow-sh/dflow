import { getServiceDetails } from '@dflow/core/actions/pages/service'
import LogsTabClient from '@dflow/core/components/service/LogsTabClient'

interface PageProps {
  params: Promise<{
    organisation: string
    projectId: string
    serviceId: string
  }>
}

const LogsPage = async ({ params }: PageProps) => {
  const { serviceId } = await params

  const { data: service } = await getServiceDetails({ id: serviceId })

  const server =
    typeof service?.project === 'object' ? service.project.server : ''

  return (
    <LogsTabClient
      serviceId={serviceId}
      serverId={typeof server === 'object' ? server.id : server}
    />
  )
}

export default LogsPage
