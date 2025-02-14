import { Github } from 'lucide-react'

import { Button } from '@/components/ui/button'

const GitPage = () => {
  const value = JSON.stringify({
    redirect_url:
      'https://5a92-103-217-239-66.ngrok-free.app/api/providers/github/setup?authId=12345',
    name: 'Dflow-2025-02-14',
    url: 'https://5a92-103-217-239-66.ngrok-free.app',
    hook_attributes: {
      url: 'https://5a92-103-217-239-66.ngrok-free.app/api/deploy/github',
    },
    callback_urls: [
      'https://5a92-103-217-239-66.ngrok-free.app/api/providers/github/setup',
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
        action='https://github.com/settings/apps/new?state=gh_init:12345'
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
