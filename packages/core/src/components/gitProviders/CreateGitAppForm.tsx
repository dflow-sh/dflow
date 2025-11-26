import { zodResolver } from '@hookform/resolvers/zod'
import { keys as env } from '@core/keys';
import { PlusIcon } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createGithubAppAction } from "@core/actions/gitProviders"
import { createGitHubAppSchema } from "@core/actions/gitProviders/validator"
import { Button } from "@core/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@core/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@core/components/ui/form"
import { Input } from "@core/components/ui/input"

const date = new Date()
const formattedDate = date.toISOString().split('T')[0]

const githubCallbackURL =
  env.NEXT_PUBLIC_WEBHOOK_URL ?? env.NEXT_PUBLIC_WEBSITE_URL

const CreateGitAppForm = ({
  children,
  onboarding = false,
}: {
  children: React.ReactNode
  onboarding?: boolean
}) => {
  const form = useForm<z.infer<typeof createGitHubAppSchema>>({
    resolver: zodResolver(createGitHubAppSchema),
    defaultValues: {
      organizationName: '',
    },
  })

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

  const onSubmit = async (values: z.infer<typeof createGitHubAppSchema>) => {
    execute({
      onboarding,
      organizationName: values.organizationName?.trim() || undefined,
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='space-y-3'>
          <DialogTitle className='text-xl'>Create GitHub App</DialogTitle>
          <DialogDescription className='text-muted-foreground text-sm'>
            Create a new GitHub App to connect repositories from your GitHub
            account. This will redirect you to GitHub to complete the setup.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='organizationName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium'>
                      Organization Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Enter your organization name'
                        className='h-10'
                      />
                    </FormControl>
                    <FormDescription>
                      Leave it blank in case of personal account
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className='flex-col gap-4 sm:flex-row sm:justify-end'>
              <Button type='submit' disabled={isPending} isLoading={isPending}>
                <PlusIcon className='mr-2 h-4 w-4' />
                Create GitHub App
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateGitAppForm
