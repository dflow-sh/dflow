import { Github } from 'lucide-react'

import { Button } from '@/components/ui/button'

const GitPage = () => {
  const value = JSON.stringify({
    redirect_url:
      'https://6376-2406-b400-b4-eb36-c7a-30ab-f12-92a7.ngrok-free.app/api/webhook/providers/github',
    name: 'Dflow-2025-02-14',
    url: 'https://6376-2406-b400-b4-eb36-c7a-30ab-f12-92a7.ngrok-free.app',
    hook_attributes: {
      url: 'https://6376-2406-b400-b4-eb36-c7a-30ab-f12-92a7.ngrok-free.app/api/deploy/github',
    },
    callback_urls: [
      'https://6376-2406-b400-b4-eb36-c7a-30ab-f12-92a7.ngrok-free.app/api/webhook/providers/github',
    ],
    public: false,
    request_oauth_on_install: true,
    default_permissions: {
      contents: 'read',
      metadata: 'read',
      emails: 'read',
      pull_requests: 'write',
    },
    default_events: ['pull_request', 'push'],
  })

  return (
    <section>
      <h2 className='font-semibold'>Git Providers</h2>
      <p className='text-muted-foreground'>
        Connect your git-provider for deploying App&apos;s.
      </p>

      <form
        method='post'
        action='https://github.com/settings/apps/new?state=gh_init'
        className='mt-4'>
        <input
          type='text'
          name='manifest'
          id='manifest'
          className='sr-only'
          defaultValue={value}
        />

        {/* Added github option in GitProviders collection */}
        <Button type='submit'>
          <Github />
          Github
        </Button>
      </form>
    </section>
  )
}

export default GitPage
