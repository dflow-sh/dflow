import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import { DynamicBreadcrumbs } from '@/components/DynamicBreadcrumbs'
import Loader from '@/components/Loader'
import CreateService from '@/components/service/CreateService'
import { ServiceCard } from '@/components/service/ServiceCard'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

const SuspendedPage = async ({ params }: PageProps) => {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })

  const { services, ...projectDetails } = await payload.findByID({
    collection: 'projects',
    id,
  })

  if (!projectDetails) {
    notFound()
  }
  return (
    <>
      <DynamicBreadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: projectDetails.name },
        ]}
      />

      <section>
        <div className='flex w-full justify-between'>
          <div>
            <h2 className='text-xl font-semibold'>{projectDetails.name}</h2>
            <p className='text-muted-foreground'>
              {projectDetails.description}
            </p>
          </div>

          {typeof projectDetails.server === 'object' && (
            <CreateService server={projectDetails.server} />
          )}
        </div>

        {services?.docs && services.docs.length ? (
          <div className='mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {services.docs.map((service, index) => {
              if (typeof service === 'object') {
                return (
                  <ServiceCard
                    key={index}
                    service={service}
                    projectId={projectDetails.id}
                  />
                )
              }

              return null
            })}
          </div>
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
    </>
  )
}

const ProjectIdPage = async ({ params }: PageProps) => {
  return (
    <Suspense fallback={<Loader className='h-96 w-full' />}>
      <SuspendedPage params={params} />
    </Suspense>
  )
}

export default ProjectIdPage
