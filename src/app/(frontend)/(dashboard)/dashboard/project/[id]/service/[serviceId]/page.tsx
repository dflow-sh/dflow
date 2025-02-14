import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{
    id: string
    serviceId: string
  }>
}

const ServiceIdPage = async ({ params }: PageProps) => {
  const { id, serviceId } = await params

  redirect(`/dashboard/project/${id}/service/${serviceId}/general`)
}

export default ServiceIdPage
