import {
  AlertCircle,
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
import DomainForm from '@/components/servers/DomainForm'
import DomainList from '@/components/servers/DomainList'
import GlobalBuildDirForm from '@/components/servers/GlobalBuildDirForm'
import Packages from '@/components/servers/Packages'
import PluginsList from '@/components/servers/PluginsList'
import { ProjectsAndServicesSection } from '@/components/servers/ProjectsAndServices'
import ProvisioningBanner from '@/components/servers/ProvisioningBanner'
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
  shouldShowSSHAlert,
}: {
  children: React.ReactNode
  server: ServerType
  shouldShowSSHAlert: boolean
}) => {
  return (
    <div className='space-y-6'>
      {shouldShowSSHAlert && <SSHConnectionAlert server={server} />}
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

      case 'settings':
        return <ServerSettingsTab server={server} />

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
          attempts: connectionAttempts,
          maxAttempts: 30,
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

    // 7. Connected and ready state
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
    // Check if there's a connection issue that should show SSHConnectionAlert
    const isConnected = server.connection?.status === 'success'
    const isTailscale = server.preferConnectionType === 'tailscale'
    const hasRequiredFields = isTailscale
      ? typeof server.hostname === 'string'
      : typeof server.sshKey === 'object' && server.ip
    const shouldShowSSHAlert =
      !isConnected || (isConnected && !hasRequiredFields)

    // 1. Show provisioning banner for DFlow provisioning state
    if (serverStatus.type === 'provisioning') {
      return (
        <BannerLayout server={server} shouldShowSSHAlert={shouldShowSSHAlert}>
          <ProvisioningBanner
            serverName={serverStatus.bannerProps?.serverName}
          />
        </BannerLayout>
      )
    }

    // 2. Show connection attempts banner for DFlow connecting state
    if (serverStatus.type === 'connecting') {
      return (
        <BannerLayout server={server} shouldShowSSHAlert={shouldShowSSHAlert}>
          <ConnectingStatusBanner {...serverStatus.bannerProps} />
        </BannerLayout>
      )
    }

    // 3. Show connection error banner for connection error state
    if (serverStatus.type === 'connection-error') {
      return (
        <BannerLayout server={server} shouldShowSSHAlert={shouldShowSSHAlert}>
          <ConnectionErrorBanner
            serverName={serverStatus.bannerProps?.serverName}
          />
        </BannerLayout>
      )
    }

    // 4. Show cloud-init banner for cloud-init running state
    if (serverStatus.type === 'cloud-init') {
      return (
        <BannerLayout server={server} shouldShowSSHAlert={shouldShowSSHAlert}>
          <CloudInitStatusBanner
            cloudInitStatus={server.cloudInitStatus ?? 'running'}
            serverName={serverStatus.bannerProps?.serverName}
          />
        </BannerLayout>
      )
    }

    // 5. Show onboarding for onboarding required state
    if (serverStatus.type === 'onboarding') {
      return (
        <BannerLayout server={server} shouldShowSSHAlert={shouldShowSSHAlert}>
          <Onboarding server={server} />
        </BannerLayout>
      )
    }

    // 6. Show disconnected state with connection error alert
    if (serverStatus.type === 'disconnected') {
      return (
        <div className='space-y-6'>
          {shouldShowSSHAlert && server.onboarded && (
            <SSHConnectionAlert server={server} />
          )}
          {server.onboarded ? (
            renderTab()
          ) : (
            <BannerLayout
              server={server}
              shouldShowSSHAlert={shouldShowSSHAlert}>
              <Onboarding server={server} />
            </BannerLayout>
          )}
        </div>
      )
    }

    // 7. Show connected and ready state
    if (serverStatus.type === 'connected') {
      return (
        <div className='space-y-6'>
          {shouldShowSSHAlert && <SSHConnectionAlert server={server} />}
          {renderTab()}
        </div>
      )
    }

    // 8. Show unknown status with warning alert
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
          {shouldShowSSHAlert && <SSHConnectionAlert server={server} />}
          {renderTab()}
        </div>
      )
    }

    // Default fallback
    return (
      <div className='space-y-6'>
        {shouldShowSSHAlert && <SSHConnectionAlert server={server} />}
        {renderTab()}
      </div>
    )
  }

  return (
    <LayoutClient server={server} servers={servers}>
      {/* <div className='mb-2 flex justify-end'>
        <RefreshButton showText={true} text='Refresh Server Status' />
      </div> */}

      {renderContent()}
    </LayoutClient>
  )
}

const ServerIdPage = (props: PageProps) => {
  return <SuspendedPage {...props} />
}

export default ServerIdPage
