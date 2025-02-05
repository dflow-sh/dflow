import CreateProject from '@/components/CreateProject'
import { ProjectCard } from '@/components/ProjectCard'

const DashboardPage = () => {
  return (
    <section className='space-y-6'>
      <CreateProject />

      <div className='grid gap-4 md:grid-cols-3 lg:grid-cols-4'>
        {[1].map(index => (
          <ProjectCard key={index} />
        ))}
      </div>
    </section>
  )
}

export default DashboardPage
