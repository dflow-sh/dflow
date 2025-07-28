import Loader from '../Loader'
import { ExternalLink, Github, Globe } from 'lucide-react'
import Link from 'next/link'
import { JSX, SVGProps } from 'react'

import { getDockerRegistries } from '@/actions/dockerRegistry'
import { getAllAppsAction } from '@/actions/gitProviders'
import SidebarToggleButton from '@/components/SidebarToggleButton'
import {
  Docker,
  Git,
  MariaDB,
  MongoDB,
  MySQL,
  PostgreSQL,
  Redis,
} from '@/components/icons'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Server, Service } from '@/payload-types'

import DatabaseForm from './DatabaseForm'
import DeploymentForm from './DeploymentForm'
import DockerForm from './DockerForm'
import ProviderForm from './ProviderForm'

type StatusType =
  | NonNullable<NonNullable<Service['databaseDetails']>['type']>
  | 'app'
  | 'docker'

const iconMapping: {
  [key in StatusType]: (props: SVGProps<SVGSVGElement>) => JSX.Element
} = {
  postgres: PostgreSQL,
  mariadb: MariaDB,
  mongo: MongoDB,
  mysql: MySQL,
  redis: Redis,
  app: props => <Git {...props} />,
  docker: Docker,
}

const AppComponent = async ({ service }: { service: Service }) => {
  const gitProvidersData = await getAllAppsAction()
  const gitProviders = gitProvidersData?.data ?? []

  return <ProviderForm service={service} gitProviders={gitProviders} />
}

const DatabaseComponent = ({
  service,
  server,
}: {
  service: Service
  server: Server | string
}) => {
  return (
    <div className='space-y-4'>
      <DatabaseForm service={service} server={server} />
    </div>
  )
}

const DockerComponent = async ({ service }: { service: Service }) => {
  const dockerRegistriesData = await getDockerRegistries()
  const accounts = dockerRegistriesData?.data ?? []

  return <DockerForm service={service} accounts={accounts} />
}

const GeneralTab = ({
  service,
  server,
}: {
  service: Service
  server: Server | string
}) => {
  const Icon =
    service.type === 'database' && service.databaseDetails?.type
      ? iconMapping[service.databaseDetails.type]
      : service.type === 'database'
        ? undefined // Handle "database" type explicitly if no icon is needed
        : iconMapping[service.type as Exclude<StatusType, 'database'>]

  const domains = service.domains

  const renderService = () => {
    switch (service.type) {
      case 'app':
        return <AppComponent service={service} />

      case 'database':
        return <DatabaseComponent service={service} server={server} />

      case 'docker':
        return <DockerComponent service={service} />

      default:
        return <Loader className='h-96 w-full' />
    }
  }

  return (
    <>
      {/* Heading removed as per user request */}
      <div className='mb-6 md:flex md:justify-between md:gap-x-2'>
        <div>
          <div className='flex items-center gap-2'>
            {Icon ? <Icon className='size-6' /> : <Github className='size-6' />}
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

          <p
            className='line-clamp-1 text-muted-foreground'
            title={service.description || undefined}>
            {service.description}
          </p>

          <div className='flex items-center gap-2 text-muted-foreground'>
            {domains?.length ? (
              <>
                <Globe size={16} />
                <Link
                  href={`//${domains[0].domain}`}
                  target='_blank'
                  rel='noopener noreferrer'>
                  <div className='flex items-center gap-x-1 text-sm hover:text-primary'>
                    {domains[0].domain}
                    <ExternalLink size={14} />
                  </div>
                </Link>
              </>
            ) : null}

            {domains?.length && domains.length > 1 ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>+ {(domains?.length ?? 0) - 1}</div>
                  </TooltipTrigger>

                  <TooltipContent side='top'>
                    {domains?.slice(1).map((domain, index) => (
                      <div
                        key={index}
                        className='flex items-center gap-x-1 text-sm hover:text-primary'>
                        <Link
                          href={`//${domain.domain}`}
                          target='_blank'
                          rel='noopener noreferrer'>
                          {domain.domain}
                        </Link>
                        <ExternalLink size={14} />
                      </div>
                    ))}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}
          </div>
        </div>

        <DeploymentForm service={service} />
      </div>

      {renderService()}
    </>
  )
}

export default GeneralTab
