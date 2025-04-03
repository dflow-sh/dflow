import configPromise from '@payload-config'
import { TriangleAlert } from 'lucide-react'
import { notFound } from 'next/navigation'
import type { SearchParams } from 'nuqs/server'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import Loader from '@/components/Loader'
import DomainList from '@/components/servers/DomainList'
import PluginsList from '@/components/servers/PluginsList'
import { ProjectsAndServicesSection } from '@/components/servers/ProjectsAndServices'
import RetryPrompt from '@/components/servers/RetryPrompt'
import ServerDetails from '@/components/servers/ServerDetails'
import UpdateServerForm from '@/components/servers/UpdateServerForm'
import Monitoring from '@/components/servers/monitoring/Monitoring'
import NetdataInstallPrompt from '@/components/servers/monitoring/NetdataInstallPrompt'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { supportedLinuxVersions } from '@/lib/constants'
import { netdata } from '@/lib/netdata'
import { loadServerPageTabs } from '@/lib/searchParams'
import { dynamicSSH } from '@/lib/ssh'
import { ServerType } from '@/payload-types-overrides'

import ServerLoading from './ServerLoading'
import LayoutClient from './layout.client'

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

  const serverDetails = await netdata.metrics.getServerDetails({
    host: server.ip,
  })

  const { docs: projects } = await payload.find({
    collection: 'projects',
    where: {
      server: { equals: server.id },
    },
  })

  return (
    <div className='flex flex-col space-y-5'>
      <ServerDetails serverDetails={serverDetails} server={server} />

      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div className='md:col-span-2'>
          <UpdateServerForm server={server as ServerType} sshKeys={sshKeys} />
        </div>

        <ProjectsAndServicesSection projects={projects} />
      </div>
    </div>
  )
}

const MonitoringTab = async ({ server }: { server: ServerType }) => {
  if (
    !server ||
    typeof server !== 'object' ||
    typeof server.sshKey !== 'object'
  ) {
    return <RetryPrompt />
  }

  try {
    const ssh = await dynamicSSH({
      host: server.ip,
      username: server.username,
      port: server.port,
      privateKey: server.sshKey.privateKey,
    })

    const netdataStatus = await netdata.core.checkInstalled({ ssh })

    if (!netdataStatus.isInstalled) {
      console.warn('Netdata is not installed on the server.')
      return <NetdataInstallPrompt server={server} />
    }

    return <Monitoring server={server} />
  } catch (error) {
    console.log('SSH Connection Error:', error)
    return <RetryPrompt />
  }
}

const SuspendedPage = async ({ params, searchParams }: PageProps) => {
  const { id } = await params
  const { tab } = await loadServerPageTabs(searchParams)

  const payload = await getPayload({ config: configPromise })

  const servers = await payload.find({
    collection: 'servers',
    pagination: false,
  })

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

  const Component = () => {
    switch (tab) {
      case 'general':
        return (
          <Suspense fallback={<Loader className='h-96 w-full' />}>
            <GeneralTab server={server} />
          </Suspense>
        )

      case 'plugins':
        return dokkuInstalled ? (
          <PluginsList server={server} />
        ) : (
          <Alert variant='info'>
            <TriangleAlert className='h-4 w-4' />

            <AlertTitle>Dokku not found!</AlertTitle>
            <AlertDescription className='flex w-full flex-col justify-between gap-2 md:flex-row'>
              <p>
                Either dokku not installed on your server, or your os
                doesn&apos;t support dokku, refer{' '}
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
        return <MonitoringTab server={server} />

      default:
        return <GeneralTab server={server} />
    }
  }

  return (
    <LayoutClient server={server} servers={servers.docs}>
      <Component />
    </LayoutClient>
  )
}

const ServerIdPage = ({ params, searchParams }: PageProps) => {
  return (
    <Suspense fallback={<ServerLoading />}>
      <SuspendedPage params={params} searchParams={searchParams} />
    </Suspense>
  )
}

export default ServerIdPage
