import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

const ServerIdPage = async ({ params }: PageProps) => {
  const { id } = await params

  return redirect(`/settings/servers/${id}/general`)
}

export default ServerIdPage
