import LayoutClient from '../../../layout.client'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { Suspense, use } from 'react'

import SidebarToggleButton from '@/components/SidebarToggleButton'
import CreateService from '@/components/service/CreateService'
import ServiceList from '@/components/service/ServiceList'
import ServicesArchitecture from '@/components/service/ServicesArchitecture'
import { ProjectSkeleton } from '@/components/skeletons/ProjectSkeleton'
import DeployTemplate from '@/components/templates/DeployTemplate'
import { Service } from '@/payload-types'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

const SuspendedPage = ({ params }: PageProps) => {
  const { id } = use(params)

  const payload = use(getPayload({ config: configPromise }))
  const project = use(
    payload.findByID({
      collection: 'projects',
      id,
    }),
  )

  if (!project) {
    notFound()
  }

  const { services, ...projectDetails } = project

  return (
    <section>
      <div className='flex w-full justify-between'>
        <div>
          <h2 className='flex items-center text-2xl font-semibold'>
            {projectDetails.name}
            <SidebarToggleButton
              directory='services'
              fileName='services-overview'
            />
          </h2>
          <p className='text-sm text-muted-foreground'>
            {projectDetails.description}
          </p>
        </div>

        {typeof projectDetails.server === 'object' && (
          <div className='flex items-center gap-3'>
            <DeployTemplate />
            {services?.docs?.length! > 0 && (
              <CreateService server={projectDetails.server} project={project} />
            )}
          </div>
        )}
      </div>
      {services?.docs?.length! > 0 ? (
        <ServiceList
          projectId={projectDetails.id}
          services={services?.docs as Service[]}
        />
      ) : (
        <ServicesArchitecture />
      )}
    </section>
  )
}

const ProjectIdPage = async ({ params }: PageProps) => {
  return (
    <LayoutClient>
      <Suspense fallback={<ProjectSkeleton />}>
        <SuspendedPage params={params} />
      </Suspense>
    </LayoutClient>
  )
}

export default ProjectIdPage
