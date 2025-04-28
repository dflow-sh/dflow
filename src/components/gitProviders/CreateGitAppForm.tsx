import { Button } from '../ui/button'
import { env } from 'env'
import { PlusIcon } from 'lucide-react'

const date = new Date()
const formattedDate = date.toISOString().split('T')[0]

const githubCallbackURL =
  env.NEXT_PUBLIC_WEBHOOK_URL ?? env.NEXT_PUBLIC_WEBSITE_URL

const CreateGitAppForm = ({ onboarding = false }: { onboarding?: boolean }) => {
  const state = 'gh_init'

  const value = JSON.stringify({
    redirect_url: `${githubCallbackURL}/api/webhook/providers/github?onboarding=${onboarding}`,
    name: `dFlow-${formattedDate}`,
    url: githubCallbackURL,
    hook_attributes: {
      url: `${githubCallbackURL}/api/deploy/github`,
    },
    callback_urls: [`${githubCallbackURL}/api/webhook/providers/github`],
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
    <div className='flex w-full items-center justify-end gap-3 pt-4'>
      <form
        method='post'
        action={`https://github.com/settings/apps/new?state=${state}`}>
        <input
          type='text'
          name='manifest'
          id='manifest'
          className='sr-only'
          defaultValue={value}
        />

        {/* Added github option in GitProviders collection */}
        <Button type='submit'>
          <PlusIcon />
          Create Github App
        </Button>
      </form>
    </div>
  )
}

export default CreateGitAppForm
