import Tabs from '../Tabs'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { updateServiceAction } from '@/actions/service'
import { updateServiceSchema } from '@/actions/service/validator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GitProvider, Service } from '@/payload-types'

const ProviderForm = ({
  gitProviders,
  service,
}: {
  gitProviders: GitProvider[]
  service: Service
}) => {
  const params = useParams<{ id: string; serviceId: string }>()
  const form = useForm<z.infer<typeof updateServiceSchema>>({
    resolver: zodResolver(updateServiceSchema),
    defaultValues: {
      provider:
        typeof service.provider === 'object'
          ? service.provider?.id
          : service.provider,
      id: params.serviceId,
      providerType: 'github',
      githubSettings: {
        owner: 'tonykhbo',
        branch: service?.githubSettings?.branch,
        buildPath: service?.githubSettings?.buildPath,
        repository: service?.githubSettings?.repository,
      },
    },
  })

  const { execute, isPending } = useAction(updateServiceAction, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.success('Successfully updated Git-provider details')
      }
    },
  })

  function onSubmit(values: z.infer<typeof updateServiceSchema>) {
    execute(values)
  }

  return (
    <div className='space-y-4 rounded border p-4'>
      <div>
        <h3 className='text-lg font-semibold'>Provider</h3>
        <p className='text-muted-foreground'>Select the source of your code</p>
      </div>

      <Tabs
        tabs={[
          {
            label: 'Github',
            content: () => (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='w-full space-y-8'>
                  <FormField
                    control={form.control}
                    name='provider'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account</FormLabel>

                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select a account' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {gitProviders.map(({ github, id }) => {
                              if (github) {
                                return (
                                  <SelectItem key={github.appName} value={id}>
                                    {github.appName}
                                  </SelectItem>
                                )
                              }
                            })}
                          </SelectContent>
                        </Select>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='githubSettings.repository'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repository</FormLabel>

                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select a repository' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={'hello-world-nextjs'}>
                              hello-world-nextjs
                            </SelectItem>

                            <SelectItem value={'hello-world'}>
                              hello-world (fake repo)
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='grid grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='githubSettings.branch'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch</FormLabel>

                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder='Select a branch' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={'main'}>main</SelectItem>
                            </SelectContent>
                          </Select>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='githubSettings.buildPath'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Build path</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className='flex w-full justify-end'>
                    <Button
                      type='submit'
                      disabled={isPending}
                      variant='outline'>
                      Save
                    </Button>
                  </div>
                </form>
              </Form>
            ),
          },
          {
            label: 'Gitlab',
            disabled: true,
          },
          {
            label: 'Bitbucket',
            disabled: true,
          },
        ]}
      />
    </div>
  )
}

export default ProviderForm
