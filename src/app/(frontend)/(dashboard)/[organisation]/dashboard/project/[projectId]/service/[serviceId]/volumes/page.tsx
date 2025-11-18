import { getServiceDetails } from '@/actions/pages/service'
import VolumesForm from '@/components/service/VolumesForm'

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

  return <VolumesForm service={service!} />
}

export default VolumesPage
