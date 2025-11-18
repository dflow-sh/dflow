import {
  getDeploymentsAction,
  getServiceDetails,
} from '@/actions/pages/service'
import DeploymentList from '@/components/service/DeploymentList'

interface PageProps {
  params: Promise<{
    organisation: string
    projectId: string
    serviceId: string
  }>
}

const DeploymentsPage = async ({ params }: PageProps) => {
  const { serviceId } = await params
  const [{ data: deployments = [] }, { data: service }] = await Promise.all([
    getDeploymentsAction({
      id: serviceId,
    }),
    getServiceDetails({ id: serviceId }),
  ])

  const server =
    typeof service?.project === 'object' ? service.project.server : ''

  return (
    <DeploymentList
      deployments={deployments}
      serviceId={serviceId}
      // todo: optimize server id fetching
      serverId={typeof server === 'object' ? server.id : server}
    />
  )
}

export default DeploymentsPage
