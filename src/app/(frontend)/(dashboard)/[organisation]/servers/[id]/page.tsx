import { ScreenShareOff, TriangleAlert } from 'lucide-react'
import { notFound } from 'next/navigation'
import type { SearchParams } from 'nuqs/server'
import { Suspense, use } from 'react'

import {
  getServerBreadcrumbs,
  getServerGeneralTabDetails,
} from '@/actions/pages/server'
import SidebarToggleButton from '@/components/SidebarToggleButton'
import UpdateManualServerFrom from '@/components/servers/AttachCustomServerForm'
import UpdateEC2InstanceForm from '@/components/servers/CreateEC2InstanceForm'
import DomainForm from '@/components/servers/DomainForm'
import DomainList from '@/components/servers/DomainList'
import PluginsList from '@/components/servers/PluginsList'
import { ProjectsAndServicesSection } from '@/components/servers/ProjectsAndServices'
import RetryPrompt from '@/components/servers/RetryPrompt'
import ServerDetails from '@/components/servers/ServerDetails'
import Monitoring from '@/components/servers/monitoring/Monitoring'
import NetdataInstallPrompt from '@/components/servers/monitoring/NetdataInstallPrompt'
import ServerOnboarding from '@/components/servers/onboarding/ServerOnboarding'
import {
  DomainsTabSkeleton,
  GeneralTabSkeleton,
  MonitoringTabSkeleton,
  PluginsTabSkeleton,
} from '@/components/skeletons/ServerSkeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { supportedLinuxVersions } from '@/lib/constants'
import { netdata } from '@/lib/netdata'
import { loadServerPageTabs } from '@/lib/searchParams'
import { SecurityGroup, SshKey } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

import LayoutClient from './layout.client'

interface PageProps {
  params: Promise<{
    id: string
    organisation: string
  }>
  searchParams: Promise<SearchParams>
}

const SSHConnectionAlert = ({ server }: { server: ServerType }) => {
  if (server.connection?.status === 'success') return null

  return (
    <Alert variant='destructive'>
      <ScreenShareOff className='h-4 w-4' />
      <AlertTitle>SSH connection failed</AlertTitle>
      <AlertDescription>
        Failed to establish connection to server, please check the server
        details
      </AlertDescription>
    </Alert>
  )
}

const UpdateServerForm = ({
  server,
  sshKeys,
  securityGroups,
}: {
  server: ServerType
  sshKeys: SshKey[]
  securityGroups: SecurityGroup[]
}) => {
  if (server.provider === 'aws') {
    return (
      <UpdateEC2InstanceForm
        sshKeys={sshKeys}
        server={server}
        securityGroups={securityGroups}
        formType='update'
      />
    )
  }

  return (
    <UpdateManualServerFrom
      server={server}
      sshKeys={sshKeys}
      formType='update'
    />
  )
}

const GeneralTab = ({ server }: { server: ServerType }) => {
  const generalTabDetails = use(getServerGeneralTabDetails({ id: server.id }))
  const sshKeys = generalTabDetails?.data?.sshKeys ?? []
  const securityGroups = generalTabDetails?.data?.securityGroups ?? []
  const projects = generalTabDetails?.data?.projects ?? []
  const serverDetails = server.netdataVersion
    ? use(
        netdata.metrics.getServerDetails({
          host:
            server.preferConnectionType === 'ssh'
              ? (server.ip ?? '')
              : (server.tailscale?.addresses?.at(0) ?? ''),
        }),
      )
    : {}

  return (
    <div className='flex flex-col space-y-5'>
      s
      <SSHConnectionAlert server={server} />
      <ServerDetails serverDetails={serverDetails} server={server} />
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div className='md:col-span-2'>
          <div className='space-y-4 rounded bg-muted/30 p-4'>
            <UpdateServerForm
              server={server}
              securityGroups={securityGroups}
              sshKeys={sshKeys}
            />
          </div>
        </div>

        <ProjectsAndServicesSection projects={projects} />
      </div>
    </div>
  )
}

const MonitoringTab = ({
  server,
  isSshConnected,
}: {
  server: ServerType
  isSshConnected: boolean
}) => {
  if (
    !server ||
    typeof server !== 'object' ||
    typeof server.sshKey !== 'object'
  ) {
    return <RetryPrompt />
  }

  return (
    <>
      <SSHConnectionAlert server={server} />
      <div className='mt-2'>
        {!server.netdataVersion ? (
          <NetdataInstallPrompt
            server={server}
            disableInstallButton={!isSshConnected}
          />
        ) : (
          <Monitoring server={server} />
        )}
      </div>
    </>
  )
}

const PluginsTab = ({ server }: { server: ServerType }) => {
  const dokkuInstalled =
    server.connection?.status === 'success' &&
    supportedLinuxVersions.includes(server.os.version ?? '') &&
    server.version

  return (
    <div className='mt-2'>
      <SSHConnectionAlert server={server} />
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
    </div>
  )
}

const DomainsTab = ({ server }: { server: ServerType }) => {
  return (
    <>
      <SSHConnectionAlert server={server} />

      <div className='space-y-4'>
        <div className='flex w-full items-center justify-between'>
          <div className='flex items-center'>
            <h4 className='text-lg font-semibold'>Domains</h4>
            <SidebarToggleButton
              directory='servers'
              fileName='domains'
              sectionId='#️-server-level-domains'
            />
          </div>
          <DomainForm server={server} />
        </div>

        <DomainList server={server} />
      </div>
    </>
  )
}

const SuspendedPage = ({ params, searchParams }: PageProps) => {
  const { id } = use(params)
  const { tab } = use(loadServerPageTabs(searchParams))
  const result = use(getServerBreadcrumbs({ id }))

  if (!result?.data?.server?.id) return notFound()

  const { server, servers } = result?.data

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
            <PluginsTab server={server} />
          </Suspense>
        )

      case 'domains':
        return (
          <Suspense fallback={<DomainsTabSkeleton />}>
            <DomainsTab server={server} />
          </Suspense>
        )

      case 'monitoring':
        return (
          <Suspense fallback={<MonitoringTabSkeleton />}>
            <MonitoringTab
              server={server}
              isSshConnected={server.connection?.status === 'success'}
            />
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

  const Onboarding = () => {
    const generalTabDetails = use(getServerGeneralTabDetails({ id: server.id }))
    const sshKeys = generalTabDetails?.data?.sshKeys ?? []
    const securityGroups = generalTabDetails?.data?.securityGroups ?? []

    return (
      <ServerOnboarding
        server={server}
        securityGroups={securityGroups}
        sshKeys={sshKeys}
      />
    )
  }

  return (
    <LayoutClient server={server} servers={servers}>
      {server.onboarded ? renderTab() : <Onboarding />}
    </LayoutClient>
  )
}

const ServerIdPage = (props: PageProps) => {
  return <SuspendedPage {...props} />
}

export default ServerIdPage
