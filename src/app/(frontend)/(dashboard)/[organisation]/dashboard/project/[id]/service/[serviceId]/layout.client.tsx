'use client'

import { useProgress } from '@bprogress/next'
import { Database, X } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import { type JSX, useEffect, useMemo, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'

import SelectSearch from '@/components/SelectSearch'
import SidebarToggleButton from '@/components/SidebarToggleButton'
import Tabs from '@/components/Tabs'
import {
  Bitbucket,
  ClickHouse,
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
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Service } from '@/payload-types'
import { useDisableDeploymentContext } from '@/providers/DisableDeployment'

const icon: { [key in Service['type']]: JSX.Element } = {
  app: <Git className='size-6' />,
  database: <Database className='size-6' />,
  docker: <Docker className='size-6' />,
}

const databaseIcons: {
  [key in StatusType]: JSX.Element
} = {
  postgres: <PostgreSQL className='size-6' />,
  mariadb: <MariaDB className='size-6' />,
  mongo: <MongoDB className='size-6' />,
  mysql: <MySQL className='size-6' />,
  redis: <Redis className='size-6' />,
  clickhouse: <ClickHouse className='size-6' />,
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

type StatusType = NonNullable<NonNullable<Service['databaseDetails']>['type']>

const LayoutClient = ({
  children,
  services,
  type,
  serviceName,
  service,
}: {
  children: React.ReactNode
  type: 'database' | 'app' | 'docker'
  serviceName: string
  services: Service[]
  service: Service
}) => {
  const params = useParams<{
    serviceId: string
    organisation: string
    id: string
  }>()
  const [isPending, startTransition] = useTransition()
  const { start, stop } = useProgress()
  const [tab, setTab] = useQueryState(
    'tab',
    parseAsStringEnum([
      'general',
      'environment',
      'logs',
      'domains',
      'deployments',
      'backups',
      'volumes',
      'scaling',
      'settings',
    ]).withDefault('general'),
  )

  const [mounted, setMounted] = useState(false)
  const [populatedVariables, setPopulatedVariables] = useState(
    service.populatedVariables,
  )

  const { setDisable } = useDisableDeploymentContext()
  const defaultPopulatedVariables = service?.populatedVariables ?? '{}'

  const tabsList = useMemo(() => {
    return type === 'database'
      ? ([
          { label: 'General', slug: 'general', disabled: false },
          { label: 'Logs', slug: 'logs', disabled: false },
          { label: 'Deployments', slug: 'deployments', disabled: false },
          { label: 'Backups', slug: 'backups', disabled: false },
          { label: 'Settings', slug: 'settings', disabled: false },
        ] as const)
      : ([
          { label: 'General', slug: 'general', disabled: false },
          { label: 'Environment', slug: 'environment', disabled: false },
          { label: 'Logs', slug: 'logs', disabled: false },
          { label: 'Deployments', slug: 'deployments', disabled: false },
          { label: 'Scaling', slug: 'scaling', disabled: false },
          { label: 'Domains', slug: 'domains', disabled: false },
          { label: 'Volumes', slug: 'volumes', disabled: false },
          { label: 'Settings', slug: 'settings', disabled: false },
        ] as const)
  }, [type])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isPending) {
      start()
    } else {
      stop()
    }
  }, [isPending])

  // When environment variables are changed we're disabling the deployments
  // Checking if old-variables and new-variables are changed and enabling deployment actions
  useEffect(() => {
    if (populatedVariables !== service.populatedVariables) {
      setDisable(false)
      setPopulatedVariables(defaultPopulatedVariables)
    }
  }, [service.populatedVariables])

  const activeTab = tabsList.findIndex(({ slug }) => {
    return slug === tab
  })

  return (
    <>
      <main className='mx-auto'>
        <div
          className={
            'border-border bg-background fixed top-[9.5rem] right-4 z-50 flex h-[calc(100vh-5rem)] w-3/4 min-w-[calc(100%-30px)] flex-col overflow-hidden rounded-t-md border-t border-l px-6 pb-20 shadow-lg transition-transform ease-in-out sm:max-w-sm md:right-0 md:min-w-[64%] md:rounded-tr-none lg:min-w-[55%]'
          }>
          <Link
            href={`/${params.organisation}/dashboard/project/${params.id}`}
            title='close'
            className='focus:ring-none text-base-content absolute top-4 right-4 cursor-pointer rounded-md opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none'>
            <X className='h-4 w-4' />
            <span className='sr-only'>Close</span>
          </Link>

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

          <div
            className='mx-auto mb-4 w-full overflow-x-scroll'
            style={{ scrollbarWidth: 'none' }}>
            <Tabs
              tabs={tabsList.map(({ label, disabled }) => ({
                label,
                disabled,
              }))}
              onTabChange={index => {
                const tab = tabsList[index]

                startTransition(() => {
                  setTab(tab.slug, {
                    shallow: false,
                  })
                })
              }}
              activeTab={activeTab >= 0 ? activeTab : 0}
              defaultActiveTab={activeTab >= 0 ? activeTab : 0}
            />
          </div>

          <ScrollArea className='h-[calc(100%-8.5rem)]'>{children}</ScrollArea>
        </div>
      </main>

      {mounted && (
        <>
          {createPortal(
            <div className='flex items-center gap-1 text-sm font-normal'>
              <svg
                fill='currentColor'
                viewBox='0 0 20 20'
                className='stroke-border h-5 w-5 flex-shrink-0'
                aria-hidden='true'>
                <path d='M5.555 17.776l8-16 .894.448-8 16-.894-.448z'></path>
              </svg>{' '}
              {serviceName}
              <SelectSearch
                organisationSlug={params.organisation}
                placeholder='service'
                services={services}
                serviceId={params.serviceId}
                projectId={params.id}
              />
            </div>,
            document.getElementById('serviceName') ?? document.body,
          )}
        </>
      )}
    </>
  )
}

export default LayoutClient
