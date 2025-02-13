import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { DynamicBreadcrumbs } from '@/components/DynamicBreadcrumbs'
import ConfigureApp from '@/components/service/ConfigureApp'

interface PageProps {
  params: Promise<{
    id: string
    serviceId: string
  }>
}

const ServiceIdPage = async ({ params }: PageProps) => {
  const { id, serviceId } = await params

  const payload = await getPayload({ config: configPromise })

  const { project, ...serviceDetails } = await payload.findByID({
    collection: 'services',
    id: serviceId,
  })

  const { docs: gitProviders } = await payload.find({
    collection: 'gitProviders',
    limit: 1000,
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
        <ConfigureApp
          service={{ ...serviceDetails, project }}
          gitProviders={gitProviders}
        />
      </section>
    </>
  )
}

export default ServiceIdPage
