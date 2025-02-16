import { Button } from '../ui/button'
import { Github } from 'lucide-react'

const date = new Date()
const formattedDate = date.toISOString().split('T')[0]

const value = JSON.stringify({
  redirect_url:
    'https://5bd9-2406-b400-b4-eb36-7dda-b3dd-7316-624.ngrok-free.app/api/webhook/providers/github',
  name: `Dflow-${formattedDate}`,
  url: 'https://5bd9-2406-b400-b4-eb36-7dda-b3dd-7316-624.ngrok-free.app',
  hook_attributes: {
    url: 'https://5bd9-2406-b400-b4-eb36-7dda-b3dd-7316-624.ngrok-free.app/api/deploy/github',
  },
  callback_urls: [
    'https://5bd9-2406-b400-b4-eb36-7dda-b3dd-7316-624.ngrok-free.app/api/webhook/providers/github',
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

const CreateGitAppForm = () => {
  return (
    <div>
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
    </div>
  )
}

export default CreateGitAppForm
