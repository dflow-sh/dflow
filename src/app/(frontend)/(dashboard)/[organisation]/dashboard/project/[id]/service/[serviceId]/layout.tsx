import { notFound } from 'next/navigation'
import React, { JSX, SVGProps, Suspense } from 'react'

import { getServiceDetails } from '@/actions/pages/service'
import {
  Docker,
  Git,
  MariaDB,
  MongoDB,
  MySQL,
  PostgreSQL,
  Redis,
} from '@/components/icons'
import { ServiceLayoutSkeleton } from '@/components/skeletons/ServiceLayoutSkeleton'
import { Service } from '@/payload-types'
import { DisableDeploymentContextProvider } from '@/providers/DisableDeployment'

import LayoutClient from './layout.client'

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
  const { serviceId } = await params

  const service = await getServiceDetails({ id: serviceId })

  if (!service?.data) {
    return notFound()
  }

  const { project, ...serviceDetails } = service?.data

  const services =
    typeof project === 'object' && project.services?.docs
      ? project.services?.docs?.filter(service => typeof service === 'object')
      : []

  return (
    <LayoutClient
      type={serviceDetails.type}
      services={services as Service[]}
      serviceName={serviceDetails.name}
      service={service?.data}>
      {children}
    </LayoutClient>
  )
}

const ServiceIdLayout = ({
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
    <DisableDeploymentContextProvider>
      <Suspense fallback={<ServiceLayoutSkeleton />}>
        <SuspendedServicePageLayout params={params}>
          {children}
        </SuspendedServicePageLayout>
      </Suspense>
    </DisableDeploymentContextProvider>
  )
}

export default ServiceIdLayout
