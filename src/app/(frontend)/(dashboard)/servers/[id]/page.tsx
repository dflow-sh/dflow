import configPromise from '@payload-config'
import { TriangleAlert } from 'lucide-react'
import { notFound } from 'next/navigation'
import type { SearchParams } from 'nuqs/server'
import { getPayload } from 'payload'
import { Suspense, use } from 'react'

import DomainList from '@/components/servers/DomainList'
import PluginsList from '@/components/servers/PluginsList'
import { ProjectsAndServicesSection } from '@/components/servers/ProjectsAndServices'
import RetryPrompt from '@/components/servers/RetryPrompt'
import ServerDetails from '@/components/servers/ServerDetails'
import UpdateServerForm from '@/components/servers/UpdateServerForm'
import Monitoring from '@/components/servers/monitoring/Monitoring'
import NetdataInstallPrompt from '@/components/servers/monitoring/NetdataInstallPrompt'
import ServerOnboarding from '@/components/servers/onboarding/ServerOnboarding'
import {
  GeneralTabSkeleton,
  MonitoringTabSkeleton,
  PluginsTabSkeleton,
} from '@/components/skeletons/ServerSkeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { supportedLinuxVersions } from '@/lib/constants'
import { netdata } from '@/lib/netdata'
import { loadServerPageTabs } from '@/lib/searchParams'
import { ServerType } from '@/payload-types-overrides'

import LayoutClient from './layout.client'

interface PageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<SearchParams>
}

const GeneralTab = ({ server }: { server: ServerType }) => {
  const [sshKeys, projects, securityGroups] = use(
    Promise.all([
      getPayload({ config: configPromise }).then(payload =>
        payload.find({ collection: 'sshKeys', pagination: false }),
      ),
      getPayload({ config: configPromise }).then(payload =>
        payload.find({
          collection: 'projects',
          where: { server: { equals: server.id } },
        }),
      ),
      getPayload({ config: configPromise }).then(payload =>
        payload.find({
          collection: 'securityGroups',
          pagination: false,
          where: {
            and: [
              {
                or: [
                  { cloudProvider: { equals: server.provider } },
                  { cloudProvider: { exists: false } },
                ],
              },
              {
                or: [
                  {
                    cloudProviderAccount: {
                      equals: server.cloudProviderAccount,
                    },
                  },
                  { cloudProviderAccount: { exists: false } },
                ],
              },
            ],
          },
        }),
      ),
    ]),
  )

  const serverDetails = use(
    server.netdataVersion
      ? netdata.metrics.getServerDetails({ host: server.ip })
      : Promise.resolve({}),
  )

  return (
    <div className='flex flex-col space-y-5'>
      <ServerDetails serverDetails={serverDetails} server={server} />

      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div className='md:col-span-2'>
          <UpdateServerForm
            server={server}
            sshKeys={sshKeys.docs}
            securityGroups={securityGroups.docs}
          />
        </div>

        <ProjectsAndServicesSection projects={projects.docs} />
      </div>
    </div>
  )
}

const MonitoringTab = ({ server }: { server: ServerType }) => {
  if (
    !server ||
    typeof server !== 'object' ||
    typeof server.sshKey !== 'object'
  ) {
    return <RetryPrompt />
  }

  if (!server.netdataVersion) {
    return <NetdataInstallPrompt server={server} />
  }

  return <Monitoring server={server} />
}

const SuspendedPage = ({ params, searchParams }: PageProps) => {
  const { id } = use(params)
  const { tab } = use(loadServerPageTabs(searchParams))

  const payload = use(getPayload({ config: configPromise }))
  const [servers, server] = use(
    Promise.all([
      payload.find({ collection: 'servers', pagination: false }),
      payload.findByID({
        collection: 'servers',
        id,
        context: { populateServerDetails: true },
      }) as Promise<ServerType>,
    ]),
  )

  if (!server?.id) return notFound()

  const dokkuInstalled =
    server.sshConnected &&
    supportedLinuxVersions.includes(server.os.version ?? '') &&
    server.version

  const renderTab = () => {
    switch (tab) {
      case 'general':
        return (
          <Suspense fallback={<GeneralTabSkeleton />}>
            <GeneralTab server={server} />
          </Suspense>
        )

      case 'plugins':
        return (
          <Suspense fallback={<PluginsTabSkeleton />}>
            {dokkuInstalled ? (
              <PluginsList server={server} />
            ) : (
              <Alert variant='info'>
                <TriangleAlert className='h-4 w-4' />
                <AlertTitle>Dokku not found!</AlertTitle>
                <AlertDescription className='flex w-full flex-col justify-between gap-2 md:flex-row'>
                  <p>
                    Either dokku is not installed on your server, or your OS
                    doesn&apos;t support it. Refer to{' '}
                    <a
                      className='underline'
                      href='https://dokku.com/docs/getting-started/installation/'>
                      the docs
                    </a>
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </Suspense>
        )

      case 'domains':
        return <DomainList server={server} />

      case 'monitoring':
        return (
          <Suspense fallback={<MonitoringTabSkeleton />}>
            <MonitoringTab server={server} />
          </Suspense>
        )

      default:
        return (
          <Suspense fallback={<GeneralTabSkeleton />}>
            <GeneralTab server={server} />
          </Suspense>
        )
    }
  }

  return (
    <LayoutClient server={server} servers={servers.docs}>
      {server.onboarded ? renderTab() : <ServerOnboarding server={server} />}
    </LayoutClient>
  )
}

const ServerIdPage = (props: PageProps) => {
  return <SuspendedPage {...props} />
}

export default ServerIdPage
