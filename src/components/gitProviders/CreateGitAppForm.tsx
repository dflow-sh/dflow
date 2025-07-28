import { Button } from '../ui/button'
import { env } from 'env'
import { PlusIcon } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'

import { createGithubAppAction } from '@/actions/gitProviders'

const date = new Date()
const formattedDate = date.toISOString().split('T')[0]

const githubCallbackURL =
  env.NEXT_PUBLIC_WEBHOOK_URL ?? env.NEXT_PUBLIC_WEBSITE_URL

const CreateGitAppForm = ({ onboarding = false }: { onboarding?: boolean }) => {
  const { execute, result, isPending } = useAction(createGithubAppAction, {
    onSuccess: ({ data }) => {
      if (data?.githubAppUrl && data?.manifest) {
        // Create a form and submit it to GitHub
        const form = document.createElement('form')
        form.method = 'post'
        form.action = data.githubAppUrl

        const manifestInput = document.createElement('input')
        manifestInput.type = 'hidden'
        manifestInput.name = 'manifest'
        manifestInput.value = data.manifest

        form.appendChild(manifestInput)
        document.body.appendChild(form)
        form.submit()
        document.body.removeChild(form)
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to create github app ${error.serverError}`)
    },
  })

  const handleCreateApp = async () => {
    execute({ onboarding })
  }

  return (
    <div className='flex w-full items-center justify-end gap-3 pt-4'>
      {/* Added github option in GitProviders collection */}
      <Button
        disabled={isPending}
        isLoading={isPending}
        onClick={handleCreateApp}>
        <PlusIcon />
        Create Github App
      </Button>
    </div>
  )
}

export default CreateGitAppForm
