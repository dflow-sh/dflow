import TabsLayout from '../../../layout.client'
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
import { ArchitectureContextProvider } from '@/providers/ArchitectureProvider'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

const SuspendedPage = ({ params }: PageProps) => {
  const { id } = use(params)
  const payload = use(getPayload({ config: configPromise }))

  const [{ docs: services }, project] = use(
    Promise.all([
      payload.find({
        collection: 'services',
        where: {
          project: {
            equals: id,
          },
        },
        joins: {
          deployments: {
            limit: 1,
          },
        },
        depth: 10,
      }),
      payload.findByID({
        collection: 'projects',
        id,
        select: {
          name: true,
          description: true,
          server: true,
        },
      }),
    ]),
  )

  if (!project) {
    notFound()
  }

  return (
    <ArchitectureContextProvider>
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
            <p className='text-sm text-muted-foreground'>
              {project.description}
            </p>
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
          <ServiceList projectId={id} services={services} />
        ) : (
          <ServicesArchitecture />
        )}
      </section>
    </ArchitectureContextProvider>
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
