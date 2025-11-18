import { getServiceDetails } from '@/actions/pages/service'
import VariablesForm from '@/components/service/VariablesForm'

interface PageProps {
  params: Promise<{
    organisation: string
    projectId: string
    serviceId: string
  }>
}

const EnvironmentPage = async ({ params }: PageProps) => {
  const { serviceId } = await params
  const { data: service } = await getServiceDetails({ id: serviceId })

  return <VariablesForm service={service!} />
}

export default EnvironmentPage
