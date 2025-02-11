import configPromise from '@payload-config'
import { getPayload } from 'payload'

import CreateProject from '@/components/CreateProject'
import { DynamicBreadcrumbs } from '@/components/DynamicBreadcrumbs'
import { ProjectCard } from '@/components/ProjectCard'

const DashboardPage = async () => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({ collection: 'projects' })

  return (
    <>
      <DynamicBreadcrumbs items={[{ label: 'Dashboard' }]} />

      <section className='space-y-6'>
        <CreateProject />

        {docs.length ? (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {docs.map((project, index) => (
              <ProjectCard key={index} project={project} />
            ))}
          </div>
        ) : (
          <p className='pt-8 text-center'>Projects not found!</p>
        )}
      </section>
    </>
  )
}

export default DashboardPage
