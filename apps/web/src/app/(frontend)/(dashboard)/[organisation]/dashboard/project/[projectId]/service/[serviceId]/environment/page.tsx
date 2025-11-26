import { getServiceDetails } from '@dflow/core/actions/pages/service'
import AccessDeniedAlert from '@dflow/core/components/AccessDeniedAlert'
import VariablesForm from '@dflow/core/components/service/VariablesForm'

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

  if (service?.type === 'database') {
    return (
      <AccessDeniedAlert error={"The requested resource can't be Accessed!"} />
    )
  }

  return <VariablesForm service={service!} />
}

export default EnvironmentPage
