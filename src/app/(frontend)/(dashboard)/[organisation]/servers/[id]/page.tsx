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
import ConnectionErrorBanner from '@/components/servers/ConnectionErrorBanner'
import UpdateEC2InstanceForm from '@/components/servers/CreateEC2InstanceForm'
import DomainForm from '@/components/servers/DomainForm'
import DomainList from '@/components/servers/DomainList'
import PluginsList from '@/components/servers/PluginsList'
import { ProjectsAndServicesSection } from '@/components/servers/ProjectsAndServices'
import ProvisioningBanner from '@/components/servers/ProvisioningBanner'
import ProvisioningStatusBanner from '@/components/servers/ProvisioningStatusBanner'
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
      <div>
        <RefreshButton showText={true} text='Refresh Server Status' />
        <ServerOnboarding
          server={server}
          securityGroups={securityGroups}
          sshKeys={sshKeys}
        />
      </div>
    )
  }

  // Get server status logic
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
        title: 'Server Provisioning',
        subtitle: `${server.name ? `"${server.name}"` : 'Your dFlow server'} is being provisioned. This may take a few minutes.`,
        badge: {
          variant: 'secondary' as const,
          text: 'Provisioning',
          tooltip:
            'dFlow server is being provisioned. This may take a few minutes.',
        },
        borderColor: 'border-l-purple-500 hover:border-l-purple-600',
        showBanner: true,
        bannerProps: {
          serverName: server.name,
        },
      }
    }

    // 2. DFlow connecting state (attempting to connect) - only after status becomes 'running'
    if (isDflow && dflowStatus === 'running' && connectionAttempts < 30) {
      if (isConnected && !isCloudInitRunning && !isOnboarded) {
        return {
          type: 'onboarding' as const,
          title: 'Onboarding Required',
          subtitle: 'Server is connected but needs to be onboarded.',
          badge: {
            variant: 'warning' as const,
            text: 'Onboarding Required',
            tooltip: 'Server is connected but needs to be onboarded.',
          },
          borderColor: 'border-l-amber-500 hover:border-l-amber-600',
          showBanner: false,
        }
      }

      // If the server is connected mid-attempt, show connected status
      if (isConnected) {
        return {
          type: 'connected' as const,
          title: 'Server Connected',
          subtitle: 'Server is connected and ready for use.',
          badge: {
            variant: 'success' as const,
            text: 'Connected',
            tooltip: undefined,
          },
          borderColor: 'border-l-green-500 hover:border-l-green-600',
          showBanner: false,
        }
      }

      // Show connecting if status is 'not-checked-yet'
      if (connectionStatus === 'not-checked-yet') {
        return {
          type: 'connecting' as const,
          title: 'Connecting to Server',
          subtitle: `${server.name ? `"${server.name}"` : 'Your dFlow server'} is being connected. This may take a few minutes.`,
          badge: {
            variant: 'secondary' as const,
            text: 'Connecting',
            tooltip:
              'Attempting to connect to the server. This may take a few minutes.',
          },
          borderColor: 'border-l-blue-500 hover:border-l-blue-600',
          showBanner: true,
          bannerProps: {
            attempts: connectionAttempts,
            maxAttempts: 30,
            serverName: server.name,
          },
        }
      }

      // If not connected and not connecting, show disconnected
      return {
        type: 'disconnected' as const,
        title: 'Server Disconnected',
        subtitle: 'Unable to connect to the server.',
        badge: {
          variant: 'destructive' as const,
          text: 'Disconnected',
          tooltip: 'Check server configuration or network status.',
        },
        borderColor: 'border-l-red-500 hover:border-l-red-600',
        showBanner: false,
      }
    }

    // 3. Connection error state (30+ attempts failed) - but if connected after 30 attempts, show connected
    if (isDflow && dflowStatus === 'running' && connectionAttempts >= 30) {
      if (isConnected && !isCloudInitRunning && !isOnboarded) {
        return {
          type: 'onboarding' as const,
          title: 'Onboarding Required',
          subtitle: 'Server is connected but needs to be onboarded.',
          badge: {
            variant: 'warning' as const,
            text: 'Onboarding Required',
            tooltip: 'Server is connected but needs to be onboarded.',
          },
          borderColor: 'border-l-amber-500 hover:border-l-amber-600',
          showBanner: false,
        }
      }

      // If the server is connected after 30 attempts, show connected status
      if (isConnected) {
        return {
          type: 'connected' as const,
          title: 'Server Connected',
          subtitle: 'Server is connected and ready for use.',
          badge: {
            variant: 'success' as const,
            text: 'Connected',
            tooltip: undefined,
          },
          borderColor: 'border-l-green-500 hover:border-l-green-600',
          showBanner: false,
        }
      }

      // If not connected after 30 attempts, show connection error
      return {
        type: 'connection-error' as const,
        title: 'Connection Issue Detected',
        subtitle: `${server.name ? `"${server.name}"` : 'Your server'} could not be connected after multiple attempts.`,
        badge: {
          variant: 'destructive' as const,
          text: 'Connection Error',
          tooltip:
            'Server could not be connected after multiple attempts. Please contact support.',
        },
        borderColor: 'border-l-red-500 hover:border-l-red-600',
        showBanner: true,
        bannerProps: {
          serverName: server.name,
        },
      }
    }

    // 4. Disconnected state (non-DFlow or general connection failure)
    if (!isConnected) {
      return {
        type: 'disconnected' as const,
        title: 'Server Disconnected',
        subtitle: 'Unable to connect to the server.',
        badge: {
          variant: 'destructive' as const,
          text: 'Disconnected',
          tooltip: 'Check server configuration or network status.',
        },
        borderColor: 'border-l-red-500 hover:border-l-red-600',
        showBanner: false,
      }
    }

    // 5. Cloud-init running state
    if (isConnected && isCloudInitRunning) {
      return {
        type: 'cloud-init' as const,
        title: 'Server Initialization Running',
        subtitle: `${server.name ? `"${server.name}"` : 'Your server'} is being initialized. This may take a few minutes.`,
        badge: {
          variant: 'secondary' as const,
          text: 'Initializing',
          tooltip:
            'Cloud-init is running. Please wait for initialization to complete.',
        },
        borderColor: 'border-l-blue-500 hover:border-l-blue-600',
        showBanner: true,
        bannerProps: {
          serverName: server.name,
        },
      }
    }

    // 6. Onboarding required state
    if (isConnected && !isCloudInitRunning && !isOnboarded) {
      return {
        type: 'onboarding' as const,
        title: 'Onboarding Required',
        subtitle: 'Server is connected but needs to be onboarded.',
        badge: {
          variant: 'warning' as const,
          text: 'Onboarding Required',
          tooltip: 'Server is connected but needs to be onboarded.',
        },
        borderColor: 'border-l-amber-500 hover:border-l-amber-600',
        showBanner: false,
      }
    }

    // 7. Connected and ready state
    if (isConnected && !isCloudInitRunning && isOnboarded) {
      return {
        type: 'connected' as const,
        title: 'Server Connected',
        subtitle: 'Server is connected and ready for use.',
        badge: {
          variant: 'success' as const,
          text: 'Connected',
          tooltip: undefined,
        },
        borderColor: 'border-l-green-500 hover:border-l-green-600',
        showBanner: false,
      }
    }

    // Default fallback
    return {
      type: 'disconnected' as const,
      title: 'Unknown Status',
      subtitle: 'Unable to determine server status.',
      badge: {
        variant: 'secondary' as const,
        text: 'Unknown Status',
        tooltip: 'Unable to determine server status.',
      },
      borderColor: 'border-l-gray-500 hover:border-l-gray-600',
      showBanner: false,
    }
  }

  const serverStatus = getServerStatus(server)

  const renderContent = () => {
    // Check if there's a connection issue that should show SSHConnectionAlert
    const isConnected = server.connection?.status === 'success'
    const isTailscale = server.preferConnectionType === 'tailscale'
    const hasRequiredFields = isTailscale
      ? typeof server.hostname === 'string'
      : typeof server.sshKey === 'object'
    const shouldShowSSHAlert =
      !isConnected || (isConnected && !hasRequiredFields)

    // 1. Show provisioning banner for DFlow provisioning state
    if (serverStatus.type === 'provisioning') {
      return (
        <ProvisioningBanner serverName={serverStatus.bannerProps?.serverName} />
      )
    }

    // 2. Show connection attempts banner for DFlow connecting state
    if (serverStatus.type === 'connecting') {
      return (
        <div className='space-y-6'>
          {shouldShowSSHAlert && <SSHConnectionAlert server={server} />}
          <ProvisioningStatusBanner
            attempts={serverStatus.bannerProps?.attempts || 0}
            maxAttempts={serverStatus.bannerProps?.maxAttempts || 30}
            serverName={serverStatus.bannerProps?.serverName}
          />
        </div>
      )
    }

    // 3. Show connection error banner for connection error state
    if (serverStatus.type === 'connection-error') {
      return (
        <div className='space-y-6'>
          {shouldShowSSHAlert && <SSHConnectionAlert server={server} />}
          <ConnectionErrorBanner
            serverName={serverStatus.bannerProps?.serverName}
          />
        </div>
      )
    }

    // 4. Show cloud-init banner for cloud-init running state
    if (serverStatus.type === 'cloud-init') {
      return (
        <div className='space-y-6'>
          {shouldShowSSHAlert && <SSHConnectionAlert server={server} />}
          <CloudInitStatusBanner
            cloudInitStatus={server.cloudInitStatus ?? 'running'}
            serverName={serverStatus.bannerProps?.serverName}
          />
        </div>
      )
    }

    // 5. Show onboarding for onboarding required state
    if (serverStatus.type === 'onboarding') {
      return (
        <div className='space-y-6'>
          {shouldShowSSHAlert && <SSHConnectionAlert server={server} />}
          <Onboarding />
        </div>
      )
    }

    // 6. Show disconnected state with connection error alert
    if (serverStatus.type === 'disconnected') {
      return (
        <div className='space-y-6'>
          <SSHConnectionAlert server={server} />
          {server.onboarded ? renderTab() : <Onboarding />}
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
