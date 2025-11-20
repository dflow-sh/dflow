import { Folder } from 'lucide-react'

const ProjectsEmptyState = () => {
  return (
    <div className='bg-muted/10 rounded-2xl border p-8 text-center shadow-xs'>
      <div className='grid min-h-[40vh] place-items-center'>
        <div className='max-w-md space-y-4 text-center'>
          <div className='bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
            <Folder className='text-muted-foreground h-8 w-8 animate-pulse' />
          </div>
          <h2 className='text-2xl font-semibold'>No Projects Yet</h2>
          <p className='text-muted-foreground'>
            It looks like you haven&apos;t created any projects yet. Start by
            creating a new one using a connected server.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProjectsEmptyState
