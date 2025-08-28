import { Database } from 'lucide-react'
import type { SearchParams } from 'nuqs/server'
import { JSX, Suspense } from 'react'

import { getServiceDeploymentsBackups } from '@/actions/pages/service'
import {
  fetchServiceResourceStatusAction,
  fetchServiceScaleStatusAction,
} from '@/actions/service'
import AccessDeniedAlert from '@/components/AccessDeniedAlert'
import SidebarToggleButton from '@/components/SidebarToggleButton'
import {
  Bitbucket,
  Docker,
  Git,
  GitLab,
  Gitea,
  Github,
  MariaDB,
  MicrosoftAzure,
  MongoDB,
  MySQL,
  PostgreSQL,
  Redis,
} from '@/components/icons'
import Backup from '@/components/service/Backup'
import CloseService from '@/components/service/CloseService'
import DeploymentList from '@/components/service/DeploymentList'
import DomainsTab from '@/components/service/DomainsTab'
import GeneralTab from '@/components/service/GeneralTab'
import LogsTabClient from '@/components/service/LogsTabClient'
import ScalingTab from '@/components/service/ScalingTab'
import ServiceSettingsTab from '@/components/service/ServiceSettingsTab'
import VariablesForm from '@/components/service/VariablesForm'
import VolumesForm from '@/components/service/VolumesForm'
import ServiceSkeleton from '@/components/skeletons/ServiceSkeleton'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Project, Service } from '@/payload-types'

interface PageProps {
  params: Promise<{
    organisation: string
    id: string
    serviceId: string
  }>
  searchParams: Promise<SearchParams>
}

const SuspendedPage = async ({ params, searchParams }: PageProps) => {
  const icon: { [key in Service['type']]: JSX.Element } = {
    app: <Git className='size-6' />,
    database: <Database className='size-6' />,
    docker: <Docker className='size-6' />,
  }

  type StatusType = NonNullable<NonNullable<Service['databaseDetails']>['type']>

  const databaseIcons: {
    [key in StatusType]: JSX.Element
  } = {
    postgres: <PostgreSQL className='size-6' />,
    mariadb: <MariaDB className='size-6' />,
    mongo: <MongoDB className='size-6' />,
    mysql: <MySQL className='size-6' />,
    redis: <Redis className='size-6' />,
  }

  const ProviderTypeIcons: {
    [key in NonNullable<Service['providerType']>]: JSX.Element
  } = {
    github: <Github className='size-6' />,
    gitlab: <GitLab className='size-6' />,
    bitbucket: <Bitbucket className='size-6' />,
    azureDevOps: <MicrosoftAzure className='size-6' />,
    gitea: <Gitea className='size-6' />,
  }

  const { serviceId, id, organisation } = await params

  const serviceDetails = await getServiceDeploymentsBackups({ id: serviceId })

  if (!serviceDetails?.data?.service || serviceDetails?.serverError) {
    return <AccessDeniedAlert error={serviceDetails?.serverError!} />
  }
  const { service, deployments, backupsDocs } = serviceDetails.data

  const server =
    typeof service.project === 'object' ? service.project.server : ''
  const serverObject = typeof server === 'object' ? server : null

  // if (
  //   serverObject &&
  //   serverObject.connection &&
  //   serverObject.connection.status !== 'success'
  // ) {
  //   const projectId =
  //     typeof service.project === 'object' ? service.project.id : service.project

  //   redirect(`/${organisation}/dashboard/project/${projectId}`)
  // }

  const domains = service.domains ?? []
  const databaseDetails = service.databaseDetails ?? {}

  const [scaleRes, resourceRes] = await Promise.all([
    fetchServiceScaleStatusAction({ id: service.id }),
    fetchServiceResourceStatusAction({ id: service.id }),
  ])

  const scale = scaleRes?.data?.scale ?? {}
  const resource = resourceRes?.data?.resource ?? {}

  return (
    <div
      className={cn(
        'border-border bg-background fixed top-[9.5rem] right-4 z-50 flex h-[calc(100vh-5rem)] w-3/4 min-w-[calc(100%-30px)] flex-col overflow-hidden rounded-md border-t border-l px-6 pb-20 shadow-lg transition-transform ease-in-out sm:max-w-sm md:right-0 md:min-w-[64%] lg:min-w-[55%]',
      )}>
      <CloseService organisation={organisation} projectId={id} />
      <div className='w-full space-y-4 pt-6 pb-2'>
        <div className='flex items-center gap-x-3'>
          {service?.type === 'database' && service.databaseDetails?.type
            ? databaseIcons[service?.databaseDetails?.type]
            : service.type === 'app' && service?.providerType
              ? ProviderTypeIcons[service?.providerType]
              : icon[service.type]}
          <h1 className='text-2xl font-semibold'>{service.name}</h1>
          {service?.databaseDetails?.status && (
            <Badge className='h-max w-max gap-1' variant={'outline'}>
              {service?.databaseDetails?.status}
            </Badge>
          )}

          <SidebarToggleButton
            directory='services'
            fileName={`${service?.type === 'app' ? 'app-service' : service?.type === 'database' ? 'database-service' : service?.type === 'docker' ? 'docker-service' : ''}`}
          />
        </div>
      </div>
      <div className='relative flex h-full flex-col overflow-hidden'>
        <Tabs defaultValue='general' className='flex h-full flex-col'>
          <div className='scrollbar-hide bg-background sticky top-0 z-10 overflow-x-auto pt-2'>
            <TabsList className='bg-primary/10 rounded'>
              <TabsTrigger value='general'>General</TabsTrigger>
              {service?.type !== 'database' && (
                <TabsTrigger value='environment'>Environment</TabsTrigger>
              )}
              <TabsTrigger value='logs'>Logs</TabsTrigger>
              <TabsTrigger value='deployments'>Deployments</TabsTrigger>
              {service?.type !== 'database' && (
                <TabsTrigger value='scaling'>Scaling</TabsTrigger>
              )}
              {service?.type !== 'database' && (
                <TabsTrigger value='domains'>Domains</TabsTrigger>
              )}
              {service?.type !== 'database' && (
                <TabsTrigger value='volumes'>Volumes</TabsTrigger>
              )}
              {service?.type === 'database' && (
                <TabsTrigger value='backups'>Backups</TabsTrigger>
              )}
              <TabsTrigger value='settings'>Settings</TabsTrigger>
            </TabsList>
            <div className='border-base-content/40 w-full border-b pt-2' />
          </div>

          <div className='flex-1 overflow-x-hidden overflow-y-auto px-1 pt-4 pb-8'>
            <TabsContent className='w-full' value='general'>
              <GeneralTab service={service} server={server} />
            </TabsContent>
            <TabsContent className='w-full' value='environment'>
              <VariablesForm service={service} />
            </TabsContent>
            <TabsContent className='w-full' value='logs'>
              <LogsTabClient
                serviceId={service.id}
                serverId={typeof server === 'object' ? server.id : server}
              />
            </TabsContent>
            <TabsContent className='w-full' value='deployments'>
              <DeploymentList
                deployments={deployments}
                serviceId={service.id}
                serverId={typeof server === 'object' ? server.id : server}
              />
            </TabsContent>
            <TabsContent className='w-full' value='domains'>
              <DomainsTab
                domains={domains}
                // TODO: Domain list should be able to handle both ssh and tailscale
                ip={
                  typeof server === 'object'
                    ? server.preferConnectionType === 'ssh'
                      ? (server.ip ?? '')
                      : (server.publicIp ?? '')
                    : ''
                }
                server={serverObject}
                service={service}
              />
            </TabsContent>
            <TabsContent className='w-full' value='backups'>
              <Backup
                databaseDetails={databaseDetails}
                serviceId={serviceId}
                backups={backupsDocs}
              />
            </TabsContent>
            <TabsContent className='w-full' value='scaling'>
              <ScalingTab service={service} scale={scale} resource={resource} />
            </TabsContent>
            <TabsContent className='w-full' value='volumes'>
              <VolumesForm service={service} />
            </TabsContent>
            <TabsContent className='w-full' value='settings'>
              <ServiceSettingsTab
                service={service}
                project={service.project as Project}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

const ServiceIdPage = async (props: PageProps) => {
  return (
    <Suspense fallback={<ServiceSkeleton />}>
      <SuspendedPage {...props} />
    </Suspense>
  )
}

export default ServiceIdPage
