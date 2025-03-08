import configPromise from '@payload-config'
import { TriangleAlert } from 'lucide-react'
import { notFound } from 'next/navigation'
import type { SearchParams } from 'nuqs/server'
import { getPayload } from 'payload'

import DomainList from '@/components/servers/DomainList'
import PluginsList from '@/components/servers/PluginsList'
import UpdateServerForm from '@/components/servers/UpdateServerForm'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { supportedLinuxVersions } from '@/lib/constants'
import { loadServerPageTabs } from '@/lib/searchParams'
import { ServerType } from '@/payload-types-overrides'

interface PageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<SearchParams>
}

const GeneralTab = async ({ server }: { server: ServerType }) => {
  const payload = await getPayload({ config: configPromise })
  const { docs: sshKeys } = await payload.find({
    collection: 'sshKeys',
    pagination: false,
  })

  return <UpdateServerForm server={server as ServerType} sshKeys={sshKeys} />
}

const SuspendedPage = async ({ params, searchParams }: PageProps) => {
  const { id } = await params
  const { tab } = await loadServerPageTabs(searchParams)

  const payload = await getPayload({ config: configPromise })

  const server = (await payload.findByID({
    collection: 'servers',
    id,
    context: {
      populateServerDetails: true,
    },
  })) as ServerType

  if (!server?.id) {
    return notFound()
  }

  const dokkuInstalled =
    server.sshConnected &&
    supportedLinuxVersions.includes(server.os.version ?? '') &&
    server.version

  switch (tab) {
    case 'general':
      return <GeneralTab server={server} />

    case 'plugins':
      return dokkuInstalled ? (
        <PluginsList server={server} />
      ) : (
        <Alert variant='info'>
          <TriangleAlert className='h-4 w-4' />

          <AlertTitle>Dokku not found!</AlertTitle>
          <AlertDescription className='flex w-full flex-col justify-between gap-2 md:flex-row'>
            <p>
              Either dokku not installed on your server, or your os doesn&apos;t
              support dokku, refer{' '}
              <a
                className='underline'
                href='https://dokku.com/docs/getting-started/installation/'>
                docs
              </a>
            </p>
          </AlertDescription>
        </Alert>
      )

    case 'domains':
      return <DomainList server={server} />

    case 'monitoring':
      return <p>Monitoring</p>

    default:
      return <GeneralTab server={server} />
  }
}

const ServerIdPage = async ({ params, searchParams }: PageProps) => {
  return <SuspendedPage params={params} searchParams={searchParams} />
}

export default ServerIdPage
