import { getServiceDetails } from '@dflow/core/actions/pages/service'
import AccessDeniedAlert from '@dflow/core/components/AccessDeniedAlert'
import VolumesForm from '@dflow/core/components/service/VolumesForm'

interface PageProps {
  params: Promise<{
    organisation: string
    projectId: string
    serviceId: string
  }>
}

const VolumesPage = async ({ params }: PageProps) => {
  const { serviceId } = await params
  const { data: service } = await getServiceDetails({ id: serviceId })

  if (service?.type === 'database') {
    return (
      <AccessDeniedAlert error={"The requested resource can't be Accessed!"} />
    )
  }

  return <VolumesForm service={service!} />
}

export default VolumesPage
