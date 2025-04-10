import configPromise from '@payload-config'
import { ExternalLink, Github, Globe } from 'lucide-react'
import Link from 'next/link'
import { getPayload } from 'payload'
import React, { JSX, SVGProps, Suspense } from 'react'

import { MariaDB, MongoDB, MySQL, PostgreSQL, Redis } from '@/components/icons'
import DeploymentForm from '@/components/service/DeploymentForm'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Project, Service } from '@/payload-types'

import ServiceLoading from './ServiceLoading'
import LayoutClient from './layout.client'

type StatusType = NonNullable<NonNullable<Service['databaseDetails']>['type']>

const iconMapping: {
  [key in StatusType]: (props: SVGProps<SVGSVGElement>) => JSX.Element
} = {
  postgres: PostgreSQL,
  mariadb: MariaDB,
  mongo: MongoDB,
  mysql: MySQL,
  redis: Redis,
}

const SuspendedServicePageLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{
    id: string
    serviceId: string
  }>
}) => {
  const { id, serviceId } = await params
  const payload = await getPayload({ config: configPromise })

  const { project, ...serviceDetails } = await payload.findByID({
    collection: 'services',
    id: serviceId,
  })

  const Icon = serviceDetails.databaseDetails?.type
    ? iconMapping[serviceDetails.databaseDetails.type]
    : null

  const domains = serviceDetails.domains

  return (
    <LayoutClient
      type={serviceDetails.type}
      project={project}
      services={((project as Project)?.services?.docs as Service[]) || []}
      serviceName={serviceDetails.name}>
      <div className={`mb-6 md:flex md:justify-between md:gap-x-2`}>
        <div>
          <div className='flex items-center gap-2'>
            {Icon ? <Icon className='size-6' /> : <Github className='size-6' />}
            <h1 className='text-2xl font-semibold'>{serviceDetails.name}</h1>
            {domains?.length ? (
              <>
                <Globe size={16} />
                <Link href={`${domains[0].domain}`} target='_blank'>
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
                        <Link href={domain.domain} target='_blank'>
                          {domain.domain}
                        </Link>
                        <ExternalLink size={14} />
                      </div>
                    ))}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}
            {serviceDetails?.databaseDetails?.status && (
              <Badge className='h-max w-max gap-1' variant={'outline'}>
                {serviceDetails?.databaseDetails?.status}
              </Badge>
            )}
          </div>
          <p
            className='line-clamp-1 text-muted-foreground'
            title={serviceDetails.description || undefined}>
            {serviceDetails.description}
          </p>
        </div>
        <DeploymentForm service={{ project, ...serviceDetails }} />
      </div>

      {children}
    </LayoutClient>
  )
}

const ServiceIdLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{
    id: string
    serviceId: string
  }>
}) => {
  return (
    <Suspense fallback={<ServiceLoading />}>
      <SuspendedServicePageLayout params={params}>
        {children}
      </SuspendedServicePageLayout>
    </Suspense>
  )
}

export default ServiceIdLayout
