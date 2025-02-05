import CreateService from '@/components/service/CreateService'

const ProjectIdPage = () => {
  return (
    <section>
      <div className='flex w-full justify-between'>
        <div>
          <h2 className='text-xl font-semibold'>Project Details</h2>
          <p className='text-muted-foreground'>This is project description</p>
        </div>

        <CreateService />
      </div>
    </section>
  )
}

export default ProjectIdPage
