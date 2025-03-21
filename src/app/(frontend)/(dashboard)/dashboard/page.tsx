import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import { DynamicBreadcrumbs } from '@/components/DynamicBreadcrumbs'
import Loader from '@/components/Loader'
import { ProjectCard } from '@/components/ProjectCard'
import ServerTerminal from '@/components/ServerTerminal'
import CreateProject from '@/components/project/CreateProject'
import { Service } from '@/payload-types'

const SuspendedTerminal = async () => {
  const payload = await getPayload({ config: configPromise })
  const { docs: servers } = await payload.find({
    collection: 'servers',
    pagination: false,
    select: {
      name: true,
    },
  })

  return <ServerTerminal servers={servers} />
}

const SuspendedPage = async () => {
  const payload = await getPayload({ config: configPromise })
  const { docs: projects } = await payload.find({
    collection: 'projects',
    pagination: false,
  })

  const { docs: servers } = await payload.find({
    collection: 'servers',
    pagination: false,
  })

  return (
    <section className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='text-2xl font-semibold'>Projects</div>
        <CreateProject servers={servers} />
      </div>

      {projects.length ? (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {projects.map((project, index) => {
            const services = (project?.services?.docs ?? []) as Service[]
            return (
              <ProjectCard
                key={index}
                project={project}
                servers={servers}
                services={services}
              />
            )
          })}
        </div>
      ) : (
        <section className='grid min-h-[calc(100vh-40vh)] w-full place-items-center'>
          <div className='relative mx-auto w-full max-w-lg rounded-lg border border-slate-800 bg-gradient-to-tr from-slate-800 to-slate-900 px-8 pb-6 pt-8 text-center'>
            <h4 className='inline-flex bg-gradient-to-r from-slate-200/60 via-slate-200 to-slate-200/60 bg-clip-text text-2xl font-bold text-transparent'>
              No Projects Found
            </h4>
            <p className='text-cq-text-secondary text-pretty pt-1'>
              You don't have any projects yet. Start by creating a new project
            </p>
          </div>
        </section>
      )}
    </section>
  )
}

const DashboardPage = () => {
  return (
    <>
      <DynamicBreadcrumbs items={[{ label: 'Dashboard' }]} />

      <Suspense fallback={<Loader className='h-96 w-full' />}>
        <SuspendedPage />
      </Suspense>

      <Suspense>
        <SuspendedTerminal />
      </Suspense>
    </>
  )
}

export default DashboardPage
