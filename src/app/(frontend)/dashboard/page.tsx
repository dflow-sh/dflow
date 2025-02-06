import configPromise from '@payload-config'
import { getPayload } from 'payload'

import CreateProject from '@/components/CreateProject'
import { ProjectCard } from '@/components/ProjectCard'

const DashboardPage = async () => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({ collection: 'projects' })

  return (
    <section className='space-y-6'>
      <CreateProject />

      {docs.length ? (
        <div className='grid gap-4 md:grid-cols-3 lg:grid-cols-4'>
          {docs.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))}
        </div>
      ) : (
        <p className='pt-8 text-center'>Projects not found!</p>
      )}
    </section>
  )
}

export default DashboardPage
