import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React, { JSX, SVGProps } from 'react'

import { DynamicBreadcrumbs } from '@/components/DynamicBreadcrumbs'
import { MariaDB, MongoDB, MySQL, PostgreSQL, Redis } from '@/components/icons'
import { Badge } from '@/components/ui/badge'
import { Service } from '@/payload-types'

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
    <>
      <DynamicBreadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          ...(typeof project === 'object'
            ? [
                {
                  label: project.name,
                  href: `/dashboard/project/${id}`,
                },
              ]
            : []),
          { label: serviceDetails.name },
        ]}
      />

      <section>
        <div className='mb-8'>
          <div className='flex items-center gap-2'>
            {Icon && <Icon className='size-6' />}

            <h1 className='text-2xl font-semibold'>{serviceDetails.name}</h1>
            {serviceDetails?.databaseDetails?.status && (
              <Badge className='h-max w-max gap-1'>
                {serviceDetails?.databaseDetails?.status}
              </Badge>
            )}
          </div>
          <p className='text-muted-foreground'>{serviceDetails.description}</p>
        </div>

        <LayoutClient>{children}</LayoutClient>
      </section>
    </>
  )
}

export default ServiceIdLayout
