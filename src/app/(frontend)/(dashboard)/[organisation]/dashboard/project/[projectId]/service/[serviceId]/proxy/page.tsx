import { getServiceDetails } from '@/actions/pages/service'
import { getServiceNginxConfigAction } from '@/actions/service'
import AccessDeniedAlert from '@/components/AccessDeniedAlert'
import ProxyTab from '@/components/service/ProxyTab'

interface PageProps {
  params: Promise<{
    organisation: string
    projectId: string
    serviceId: string
  }>
}

const ProxyPage = async ({ params }: PageProps) => {
  const { serviceId } = await params

  const [{ data: service }, { data: proxyData = [] }] = await Promise.all([
    getServiceDetails({ id: serviceId }),
    getServiceNginxConfigAction({
      id: serviceId,
    }),
  ])

  if (service?.type === 'database') {
    return (
      <AccessDeniedAlert error={"The requested resource can't be Accessed!"} />
    )
  }

  return <ProxyTab proxyData={proxyData} service={service!} />
}

export default ProxyPage
