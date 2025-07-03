import { ScreenShareOff, TriangleAlert } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Suspense, use } from 'react'

import {
  getServerBreadcrumbs,
  getServerGeneralTabDetails,
} from '@/actions/pages/server'
import RefreshButton from '@/components/RefreshButton'
import SidebarToggleButton from '@/components/SidebarToggleButton'
import UpdateManualServerFrom from '@/components/servers/AttachCustomServerForm'
import CloudInitStatusBanner from '@/components/servers/CloudInitStatusBanner'
import UpdateEC2InstanceForm from '@/components/servers/CreateEC2InstanceForm'
import DomainForm from '@/components/servers/DomainForm'
import DomainList from '@/components/servers/DomainList'
import PluginsList from '@/components/servers/PluginsList'
import { ProjectsAndServicesSection } from '@/components/servers/ProjectsAndServices'
import ServerDetails from '@/components/servers/ServerDetails'
import UpdateTailscaleServerForm from '@/components/servers/UpdateTailscaleServerForm'
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
import { SecurityGroup, SshKey } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

import LayoutClient from './layout.client'

interface PageProps {
  params: Promise<{
    id: string
    organisation: string
  }>
  searchParams: Promise<{
    refreshServerDetails?: string
    tab?: string
  }>
}

const SSHConnectionAlert = ({ server }: { server: ServerType }) => {
  const isTailscale = server.preferConnectionType === 'tailscale'
  const isConnected = server.connection?.status === 'success'
  const hasRequiredFields = isTailscale
    ? typeof server.hostname === 'string'
    : typeof server.sshKey === 'object'

  if (isConnected && hasRequiredFields) return null

  const connectionTypeLabel = isTailscale ? 'Tailscale' : 'SSH'

  return (
    <Alert variant='destructive'>
      <ScreenShareOff className='h-4 w-4' />
      <AlertTitle>{connectionTypeLabel} connection failed</AlertTitle>
      <AlertDescription>
        Failed to establish connection to server via {connectionTypeLabel}.
        Please check the server details.
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

  if (server.preferConnectionType === 'tailscale') {
    return <UpdateTailscaleServerForm server={server} formType='update' />
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
              : (server.publicIp ?? ''),
        }),
      )
    : {}

  return (
    <div className='space-y-6'>
      <SSHConnectionAlert server={server} />

      <ServerDetails serverDetails={serverDetails} server={server} />

      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <div className='md:col-span-2'>
          <div className='space-y-4 rounded-lg border p-6'>
            <h3 className='text-lg font-semibold'>Server Configuration</h3>
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
  return (
    <div className='space-y-6'>
      <SSHConnectionAlert server={server} />

      <div className='space-y-4'>
        {!server.netdataVersion ? (
          <NetdataInstallPrompt
            server={server}
            disableInstallButton={!isSshConnected}
          />
        ) : (
          <Monitoring server={server} />
        )}
      </div>
    </div>
  )
}

const PluginsTab = ({ server }: { server: ServerType }) => {
  const dokkuInstalled =
    server.connection?.status === 'success' &&
    supportedLinuxVersions.includes(server.os.version ?? '') &&
    server.version

  return (
    <div className='space-y-6'>
      <SSHConnectionAlert server={server} />

      <div className='space-y-4'>
        {dokkuInstalled ? (
          <PluginsList server={server} />
        ) : (
          <Alert variant='default'>
            <TriangleAlert className='h-4 w-4' />
            <AlertTitle>Dokku not found</AlertTitle>
            <AlertDescription className='space-y-2'>
              <p>
                Either Dokku is not installed on your server, or your OS
                doesn&apos;t support it.
              </p>
              <p>
                Refer to{' '}
                <a
                  className='underline hover:no-underline'
                  href='https://dokku.com/docs/getting-started/installation/'
                  target='_blank'
                  rel='noopener noreferrer'>
                  the installation documentation
                </a>{' '}
                for setup instructions.
              </p>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}

const DomainsTab = ({ server }: { server: ServerType }) => {
  return (
    <div className='space-y-6'>
      <SSHConnectionAlert server={server} />

      <div className='space-y-4'>
        <div className='flex w-full items-center justify-between'>
          <div className='flex items-center gap-2'>
            <h3 className='text-lg font-semibold'>Domains</h3>
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
    </div>
  )
}

const SuspendedPage = ({ params, searchParams }: PageProps) => {
  const [syncParams, syncSearchParams] = use(
    Promise.all([params, searchParams]),
  )
  const { id } = syncParams
  const { tab, refreshServerDetails } = syncSearchParams
  const isRefreshServerDetails = refreshServerDetails === 'true'

  const result = use(
    getServerBreadcrumbs({
      id,
      populateServerDetails: !isRefreshServerDetails,
      refreshServerDetails: isRefreshServerDetails,
    }),
  )

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
      <div className='mb-2 flex justify-end'>
        <RefreshButton showText={true} text='Refresh Server Status' />
      </div>

      {server.connection?.status !== 'success' ? (
        server.onboarded ? (
          renderTab()
        ) : (
          <Onboarding />
        )
      ) : server.cloudInitStatus === 'running' ? (
        <CloudInitStatusBanner
          cloudInitStatus={server.cloudInitStatus ?? undefined}
        />
      ) : server.onboarded ? (
        renderTab()
      ) : (
        <Onboarding />
      )}
    </LayoutClient>
  )
}

const ServerIdPage = (props: PageProps) => {
  return <SuspendedPage {...props} />
}

export default ServerIdPage
