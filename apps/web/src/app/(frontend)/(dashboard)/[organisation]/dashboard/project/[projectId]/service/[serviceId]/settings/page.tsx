import { getServiceDetails } from '@dflow/core/actions/pages/service'
import ServiceSettingsTab from '@dflow/core/components/service/ServiceSettingsTab'
import { Project } from '@dflow/core/payload-types'

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
