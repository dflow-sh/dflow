import { getServiceDetails } from '@/actions/pages/service'
import ServiceSettingsTab from '@/components/service/ServiceSettingsTab'
import { Project } from '@/payload-types'

interface PageProps {
  params: Promise<{
    organisation: string
    projectId: string
    serviceId: string
  }>
}

const SettingsPage = async ({ params }: PageProps) => {
  const { serviceId } = await params

  const { data: service } = await getServiceDetails({
    id: serviceId,
  })

  return (
    <ServiceSettingsTab
      service={service!}
      project={service?.project as Project}
    />
  )
}

export default SettingsPage
