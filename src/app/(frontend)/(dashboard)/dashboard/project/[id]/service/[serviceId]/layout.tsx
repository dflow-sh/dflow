import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { DynamicBreadcrumbs } from '@/components/DynamicBreadcrumbs'

import LayoutClient from './layout.client'

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
          <h1 className='text-2xl font-semibold'>{serviceDetails.name}</h1>
          <p className='text-muted-foreground'>{serviceDetails.description}</p>
        </div>

        <LayoutClient>{children}</LayoutClient>
      </section>
    </>
  )
}

export default ServiceIdLayout
