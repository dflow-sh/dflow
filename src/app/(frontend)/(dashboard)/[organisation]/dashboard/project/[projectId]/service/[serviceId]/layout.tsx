import { notFound } from 'next/navigation'
import React from 'react'

import { getServiceDetails } from '@/actions/pages/service'
import { Service } from '@/payload-types'
import { DisableDeploymentContextProvider } from '@/providers/DisableDeployment'

import LayoutClient from './layout.client'

const SuspendedServicePageLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{
    projectId: string
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
    projectId: string
    serviceId: string
  }>
}) => {
  return (
    <DisableDeploymentContextProvider>
      <SuspendedServicePageLayout params={params}>
        {children}
      </SuspendedServicePageLayout>
    </DisableDeploymentContextProvider>
  )
}

export default ServiceIdLayout
