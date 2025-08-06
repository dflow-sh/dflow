import {
  AlertCircle,
  Lock,
  ScreenShareOff,
  Server,
  Settings2,
  TriangleAlert,
} from 'lucide-react'
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
import ConnectingStatusBanner from '@/components/servers/ConnectingStatusBanner'
import ConnectionErrorBanner from '@/components/servers/ConnectionErrorBanner'
import UpdateEC2InstanceForm from '@/components/servers/CreateEC2InstanceForm'
import Danger from '@/components/servers/Danger'
import DefaultResourceLimitsForm from '@/components/servers/DefaultResourceLimitsForm'
import DomainForm from '@/components/servers/DomainForm'
import DomainList from '@/components/servers/DomainList'
import DpkgLockBanner from '@/components/servers/DpkgLockBanner'
import GlobalBuildDirForm from '@/components/servers/GlobalBuildDirForm'
import KubernetesTab from '@/components/servers/KubernetesTab'
import Packages from '@/components/servers/Packages'
import PluginsList from '@/components/servers/PluginsList'
import { ProjectsAndServicesSection } from '@/components/servers/ProjectsAndServices'
import ProvisioningBanner from '@/components/servers/ProvisioningBanner'
import ServerDetails from '@/components/servers/ServerDetails'
import UpdateTailscaleServerForm from '@/components/servers/UpdateTailscaleServerForm'
import MonitoringTab from '@/components/servers/monitoring/MonitoringTab'
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
  searchParams: Promise<{
    refreshServerDetails?: string
    tab?: string
  }>
}

const SSHConnectionAlert = ({ server }: { server: ServerType }) => {
  const isTailscale = server.preferConnectionType === 'tailscale'
  const isFailed = server.connection?.status === 'failed'

  if (!isFailed) return null

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

const PluginsTab = ({ server }: { server: ServerType }) => {
  const dokkuInstalled =
    server.connection?.status === 'success' &&
    supportedLinuxVersions.includes(server.os.version ?? '') &&
    server.version

  return (
    <div className='space-y-6'>
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

          <div className='flex items-center gap-2'>
            <RefreshButton showText={true} text='Refresh Server Status' />
            <DomainForm server={server} />
          </div>
        </div>

        <DomainList server={server} />
      </div>
    </div>
  )
}

const Onboarding = ({ server }: { server: ServerType }) => {
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

const BannerLayout = ({
  children,
  server,
}: {
  children: React.ReactNode
  server: ServerType
}) => {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-1.5'>
          <Server />
          <h4 className='text-lg font-semibold'>{server.name}</h4>
        </div>

        <RefreshButton showText={true} text='Refresh Server Status' />
      </div>
      {children}
    </div>
  )
}

const ServerSettingsTab = ({ server }: { server: ServerType }) => {
  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1.5'>
            <Settings2 />
            <h4 className='text-lg font-semibold'>Server Settings</h4>
          </div>

          <RefreshButton showText={true} text='Refresh Server Status' />
        </div>
        <GlobalBuildDirForm server={server} />
        <DefaultResourceLimitsForm server={server} />
      </div>

      <Packages railpack={server.railpack} serverId={server.id} />

      <Danger server={server} />
    </div>
  )
}

const SuspendedPage = ({ params, searchParams }: PageProps) => {
  const [syncParams, syncSearchParams] = use(
    Promise.all([params, searchParams]),
  )
  const { id } = syncParams
  const { refreshServerDetails } = syncSearchParams

  const { tab } = use(loadServerPageTabs(searchParams))

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

      case 'settings':
        return <ServerSettingsTab server={server} />

      case 'kubernetes':
        return <KubernetesTab />

      default:
        return (
          <Suspense fallback={<GeneralTabSkeleton />}>
            <GeneralTab server={server} />
          </Suspense>
        )
    }
  }

  // Get complete server status logic
  const getServerStatus = (server: ServerType) => {
    const isDflow = server?.provider?.toLowerCase() === 'dflow'
    const dflowStatus = server.dflowVpsDetails?.status
    const connectionAttempts = server.connectionAttempts ?? 0
    const connectionStatus = server.connection?.status || 'unknown'
    const isConnected = connectionStatus === 'success'
    const isOnboarded = server.onboarded === true
    const isCloudInitRunning = server.cloudInitStatus === 'running'

    // 1. DFlow provisioning state
    if (isDflow && dflowStatus === 'provisioning') {
      return {
        type: 'provisioning' as const,
        bannerProps: {
          serverName: server.name,
        },
      }
    }

    // 2. DFlow connecting state (attempting to connect)
    if (
      isDflow &&
      dflowStatus === 'running' &&
      connectionAttempts < 30 &&
      connectionStatus === 'not-checked-yet'
    ) {
      return {
        type: 'connecting' as const,
        bannerProps: {
          serverName: server.name,
        },
      }
    }

    // 3. Connection error state (30+ attempts failed)
    if (
      isDflow &&
      dflowStatus === 'running' &&
      connectionAttempts >= 30 &&
      connectionStatus === 'not-checked-yet'
    ) {
      return {
        type: 'connection-error' as const,
        bannerProps: {
          serverName: server.name,
        },
      }
    }

    // 4. Disconnected state (non-DFlow or general connection failure)
    if (!isConnected) {
      return {
        type: 'disconnected' as const,
        bannerProps: {
          serverName: server.name,
        },
      }
    }

    // 5. Cloud-init running state
    if (isConnected && isCloudInitRunning) {
      return {
        type: 'cloud-init' as const,
        bannerProps: {
          serverName: server.name,
        },
      }
    }

    // 6. Onboarding required state
    if (isConnected && !isCloudInitRunning && !isOnboarded) {
      return {
        type: 'onboarding' as const,
        bannerProps: {
          serverName: server.name,
        },
      }
    }

    console.log('Coming Here')

    console.log({
      isConnected,
      isCloudInitRunning,
      isOnboarded,
      dpkgLocked: server.dpkgLocked,
    })

    // 7. dpkg locked state (after onboarding check)
    if (
      isConnected &&
      !isCloudInitRunning &&
      !isOnboarded &&
      server.dpkgLocked
    ) {
      return {
        type: 'dpkg-locked' as const,
        bannerProps: {
          serverName: server.name,
        },
      }
    }

    // 8. Onboarded but dpkg locked
    if (
      isConnected &&
      !isCloudInitRunning &&
      isOnboarded &&
      server.dpkgLocked
    ) {
      return {
        type: 'dpkg-locked-onboarded' as const,
        bannerProps: {
          serverName: server.name,
        },
      }
    }

    // 9. Connected and ready state
    if (isConnected && !isCloudInitRunning && isOnboarded) {
      return {
        type: 'connected' as const,
        bannerProps: {
          serverName: server.name,
        },
      }
    }

    // Default fallback
    return {
      type: 'unknown' as const,
      bannerProps: {
        serverName: server.name,
      },
    }
  }

  const serverStatus = getServerStatus(server)

  const renderContent = () => {
    // 1. Show provisioning banner for DFlow provisioning state
    if (serverStatus.type === 'provisioning') {
      return (
        <BannerLayout server={server}>
          <ProvisioningBanner
            serverName={serverStatus.bannerProps?.serverName}
          />
        </BannerLayout>
      )
    }

    // 2. Show connection attempts banner for DFlow connecting state
    if (serverStatus.type === 'connecting') {
      return (
        <BannerLayout server={server}>
          <ConnectingStatusBanner {...serverStatus.bannerProps} />
        </BannerLayout>
      )
    }

    // 3. Show connection error banner for connection error state
    if (serverStatus.type === 'connection-error') {
      return (
        <BannerLayout server={server}>
          <ConnectionErrorBanner
            serverName={serverStatus.bannerProps?.serverName}
          />
        </BannerLayout>
      )
    }

    // 4. Show cloud-init banner for cloud-init running state
    if (serverStatus.type === 'cloud-init') {
      return (
        <BannerLayout server={server}>
          <CloudInitStatusBanner
            cloudInitStatus={server.cloudInitStatus ?? 'running'}
            serverName={serverStatus.bannerProps?.serverName}
          />
        </BannerLayout>
      )
    }

    // 5. Show dpkg lock banner for dpkg-locked state
    if (serverStatus.type === 'dpkg-locked') {
      return (
        <BannerLayout server={server}>
          <DpkgLockBanner serverName={server.name} />
        </BannerLayout>
      )
    }

    // 6. In renderContent, show a simple Alert for dpkg-locked-onboarded, but do not block the rest of the UI
    if (serverStatus.type === 'dpkg-locked-onboarded') {
      return (
        <div className='space-y-6'>
          <Alert variant='warning' className='flex items-center gap-3'>
            <Lock className='h-5 w-5 text-warning' />
            <div>
              <AlertTitle>dpkg is Locked</AlertTitle>
              <AlertDescription>
                The system package manager (dpkg) is currently locked. Wait for
                ongoing package operations to finish before performing further
                actions.
              </AlertDescription>
            </div>
          </Alert>
          {renderTab()}
        </div>
      )
    }

    // 7. Show onboarding for onboarding required state
    if (serverStatus.type === 'onboarding') {
      return (
        <BannerLayout server={server}>
          <Onboarding server={server} />
        </BannerLayout>
      )
    }

    // 8. Show disconnected state with connection error alert
    if (serverStatus.type === 'disconnected') {
      return (
        <div className='space-y-6'>
          {server.onboarded ? (
            renderTab()
          ) : (
            <BannerLayout server={server}>
              <Onboarding server={server} />
            </BannerLayout>
          )}
        </div>
      )
    }

    // 9. Show connected and ready state
    if (serverStatus.type === 'connected') {
      return <div className='space-y-6'>{renderTab()}</div>
    }

    // 10. Show unknown status with warning alert
    if (serverStatus.type === 'unknown') {
      return (
        <div className='space-y-6'>
          <Alert variant='warning'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Unknown Server Status</AlertTitle>
            <AlertDescription>
              Unable to determine server status. Please refresh or check your
              server configuration. If the issue persists, contact support.
            </AlertDescription>
          </Alert>
          {renderTab()}
        </div>
      )
    }

    // Default fallback
    return <div className='space-y-6'>{renderTab()}</div>
  }

  return (
    <LayoutClient server={server} servers={servers}>
      <div className='space-y-6'>
        <SSHConnectionAlert server={server} />
        {renderContent()}
      </div>
    </LayoutClient>
  )
}

const ServerIdPage = (props: PageProps) => {
  return <SuspendedPage {...props} />
}

export default ServerIdPage
