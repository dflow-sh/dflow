import { Github } from 'lucide-react'

import { Button } from '@/components/ui/button'

const GitPage = () => {
  return (
    <section>
      <h2 className='font-semibold'>Git Providers</h2>
      <p className='text-muted-foreground'>
        Connect your git-provider for deploying App's.
      </p>

      <div className='mt-4'>
        {/* Added github option in GitProviders collection */}
        <Button>
          <Github />
          Github
        </Button>
      </div>
    </section>
  )
}

export default GitPage
