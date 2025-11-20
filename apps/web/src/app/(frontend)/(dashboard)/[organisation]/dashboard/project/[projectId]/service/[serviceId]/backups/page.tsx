import { getServiceBackups, getServiceDetails } from '@/actions/pages/service'
import AccessDeniedAlert from '@/components/AccessDeniedAlert'
import Backup from '@/components/service/Backup'

interface PageProps {
  params: Promise<{
    organisation: string
    projectId: string
    serviceId: string
  }>
}

const BackupsPage = async ({ params }: PageProps) => {
  const { serviceId } = await params

  const [{ data: service }, { data: backups = [], serverError }] =
    await Promise.all([
      getServiceDetails({ id: serviceId }),
      getServiceBackups({ id: serviceId }),
    ])

  const databaseDetails = service?.databaseDetails ?? {}

  // restricting when database specific pages're accessed
  if (service?.type === 'app' || service?.type === 'docker') {
    return (
      <AccessDeniedAlert error={"The requested resource can't be Accessed!"} />
    )
  }

  if (serverError) {
    return <AccessDeniedAlert error={serverError!} />
  }

  return (
    <Backup
      databaseDetails={databaseDetails}
      serviceId={serviceId}
      backups={backups}
    />
  )
}

export default BackupsPage
