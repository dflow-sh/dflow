import React from 'react'
import { getServiceDetails } from '@dflow/core/actions/pages/service'
import AccessDeniedAlert from '@dflow/core/components/AccessDeniedAlert'
import TriggerNotFound from '@dflow/core/components/states/TriggerNotFound'
import { Service } from '@dflow/core/payload-types'
import { DisableDeploymentContextProvider } from '@dflow/core/providers/DisableDeployment'
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

  if (service?.serverError) {
    return <AccessDeniedAlert error={service.serverError} />
  }

  if (!service.data) {
    return <TriggerNotFound />
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
