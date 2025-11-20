import { getServiceDetails } from '@/actions/pages/service'
import AccessDeniedAlert from '@/components/AccessDeniedAlert'
import DomainsTab from '@/components/service/DomainsTab'

interface PageProps {
  params: Promise<{
    organisation: string
    projectId: string
    serviceId: string
  }>
}

const DomainsPage = async ({ params }: PageProps) => {
  const { serviceId } = await params

  const { data: service } = await getServiceDetails({ id: serviceId })

  if (service?.type === 'database') {
    return (
      <AccessDeniedAlert error={"The requested resource can't be Accessed!"} />
    )
  }

  const domains = service?.domains ?? []
  const server =
    typeof service?.project === 'object' ? service.project.server : ''

  return (
    <DomainsTab
      domains={domains}
      // todo: Domain list should be able to handle both ssh and tailscale
      ip={
        typeof server === 'object'
          ? server.preferConnectionType === 'ssh'
            ? (server.ip ?? '')
            : (server.publicIp ?? '')
          : ''
      }
      server={typeof server !== 'string' ? server : null}
      service={service!}
    />
  )
}

export default DomainsPage
