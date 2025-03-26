import configPromise from '@payload-config'
import { Github } from 'lucide-react'
import { getPayload } from 'payload'
import React, { JSX, SVGProps } from 'react'

import { MariaDB, MongoDB, MySQL, PostgreSQL, Redis } from '@/components/icons'
import DeploymentForm from '@/components/service/DeploymentForm'
import { Badge } from '@/components/ui/badge'
import { Project, Service } from '@/payload-types'

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
  const { id, serviceId } = await params
  const payload = await getPayload({ config: configPromise })

  const { project, ...serviceDetails } = await payload.findByID({
    collection: 'services',
    id: serviceId,
  })

  const Icon = serviceDetails.databaseDetails?.type
    ? iconMapping[serviceDetails.databaseDetails.type]
    : null

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

export default ServiceIdLayout
