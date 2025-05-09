import TabsLayout from '../../../../layout.client'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { Suspense, use } from 'react'

import SidebarToggleButton from '@/components/SidebarToggleButton'
import CreateService from '@/components/service/CreateService'
import ServiceList from '@/components/service/ServiceList'
import ServicesArchitecture from '@/components/service/ServicesArchitecture'
import ServicesSkeleton from '@/components/skeletons/ServicesSkeleton'
import DeployTemplate from '@/components/templates/DeployTemplate'

interface PageProps {
  params: Promise<{
    id: string
    organisation: string
  }>
}

const SuspendedPage = ({ params }: PageProps) => {
  const { id, organisation } = use(params)
  const payload = use(getPayload({ config: configPromise }))

  const [{ docs: services }, { docs: Projects }] = use(
    Promise.all([
      payload.find({
        collection: 'services',
        where: {
          and: [
            {
              project: {
                equals: id,
              },
            },
            {
              'tenant.slug': {
                equals: organisation,
              },
            },
          ],
        },
        joins: {
          deployments: {
            limit: 10,
          },
        },
        depth: 10,
      }),
      payload.find({
        collection: 'projects',
        where: {
          'tenant.slug': {
            equals: organisation,
          },
        },
        select: {
          name: true,
          description: true,
          server: true,
        },
      }),
    ]),
  )

  const project = Projects.at(0)
  if (!project) {
    notFound()
  }

  return (
    <section>
      <div className='flex w-full justify-between'>
        <div>
          <h2 className='flex items-center text-2xl font-semibold'>
            {project.name}
            <SidebarToggleButton
              directory='services'
              fileName='services-overview'
            />
          </h2>
          <p className='text-sm text-muted-foreground'>{project.description}</p>
        </div>

        {typeof project.server === 'object' && (
          <div className='flex items-center gap-3'>
            <DeployTemplate />

            {services?.length ? (
              <CreateService server={project.server} project={project} />
            ) : null}
          </div>
        )}
      </div>

      {services.length ? (
        <ServiceList
          organisationSlug={organisation}
          projectId={id}
          services={services}
        />
      ) : (
        <ServicesArchitecture />
      )}
    </section>
  )
}

const ProjectIdPage = async ({ params }: PageProps) => {
  return (
    <TabsLayout>
      <Suspense fallback={<ServicesSkeleton />}>
        <SuspendedPage params={params} />
      </Suspense>
    </TabsLayout>
  )
}

export default ProjectIdPage
