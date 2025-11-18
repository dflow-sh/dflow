import { getServiceDetails } from '@/actions/pages/service'
import {
  fetchServiceResourceStatusAction,
  fetchServiceScaleStatusAction,
} from '@/actions/service'
import ScalingTab from '@/components/service/ScalingTab'

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

  return <ScalingTab service={service!} scale={scale} resource={resource} />
}

export default ScalingPage
