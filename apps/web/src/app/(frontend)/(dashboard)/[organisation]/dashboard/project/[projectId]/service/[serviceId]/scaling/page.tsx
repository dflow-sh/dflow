import { getServiceDetails } from '@dflow/core/actions/pages/service'
import {
  fetchServiceResourceStatusAction,
  fetchServiceScaleStatusAction,
} from '@dflow/core/actions/service'
import AccessDeniedAlert from '@dflow/core/components/AccessDeniedAlert'
import ScalingTab from '@dflow/core/components/service/ScalingTab'

interface PageProps {
  params: Promise<{
    organisation: string
    projectId: string
    serviceId: string
  }>
}

const ScalingPage = async ({ params }: PageProps) => {
  const { serviceId } = await params

  const [{ data: service }, scaleRes, resourceRes] = await Promise.all([
    getServiceDetails({ id: serviceId }),
    fetchServiceScaleStatusAction({ id: serviceId }),
    fetchServiceResourceStatusAction({ id: serviceId }),
  ])

  const scale = scaleRes?.data?.scale ?? {}
  const resource = resourceRes?.data?.resource ?? {}

  if (service?.type === 'database') {
    return (
      <AccessDeniedAlert error={"The requested resource can't be Accessed!"} />
    )
  }

  return <ScalingTab service={service!} scale={scale} resource={resource} />
}

export default ScalingPage
