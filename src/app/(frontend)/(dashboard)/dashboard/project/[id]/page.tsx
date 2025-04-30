import LayoutClient from '../../../layout.client'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { Suspense, use } from 'react'

import SidebarToggleButton from '@/components/SidebarToggleButton'
import ServicesArchitecture from '@/components/project/ServicesArchitecture'
import CreateService from '@/components/service/CreateService'
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
            <CreateService server={projectDetails.server} project={project} />
          </div>
        )}
      </div>
      {services?.docs?.length! > 0 ? (
        <ServicesArchitecture
          projectId={projectDetails.id}
          services={services?.docs as Service[]}
        />
      ) : (
        <section className='grid min-h-[calc(100vh-40vh)] w-full place-items-center'>
          <div className='relative mx-auto w-full max-w-lg rounded-lg border border-slate-800 bg-gradient-to-tr from-slate-800 to-slate-900 px-8 pb-6 pt-8 text-center'>
            <h4 className='inline-flex bg-gradient-to-r from-slate-200/60 via-slate-200 to-slate-200/60 bg-clip-text text-2xl font-bold text-transparent'>
              No Services Found
            </h4>
            <p className='text-cq-text-secondary text-pretty pt-1'>
              You don't have any services yet. Start by creating a new service
            </p>
          </div>
        </section>
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
