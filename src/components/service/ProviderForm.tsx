'use client'

import Tabs from '../Tabs'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  getBranchesAction,
  getRepositoriesAction,
} from '@/actions/gitProviders'
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

const GithubForm = ({
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
        owner: '',
        branch: service?.githubSettings?.branch,
        buildPath: service?.githubSettings?.buildPath,
        repository: service?.githubSettings?.repository,
      },
      port: service?.githubSettings?.port ?? 3000,
    },
  })

  const { provider, githubSettings } = useWatch({ control: form.control })

  const { execute: saveGitProviderDetails, isPending } = useAction(
    updateServiceAction,
    {
      onSuccess: ({ data }) => {
        if (data) {
          toast.success('Successfully updated Git-provider details')
        }
      },
    },
  )

  const {
    execute: getRepositories,
    result: { data: repositoriesList, serverError },
    isPending: repositoriesLoading,
    reset: resetRepositoriesList,
  } = useAction(getRepositoriesAction)

  const {
    execute: getBranches,
    result: { data: branchesList },
    isPending: branchesLoading,
    reset: resetBranchesList,
  } = useAction(getBranchesAction)

  // On component-mount getting repositories & branches based on git-provider
  useEffect(() => {
    const defaultProvider =
      typeof service.provider === 'object'
        ? service.provider?.id
        : service.provider
    const provider = gitProviders.find(({ id }) => id === defaultProvider)

    if (provider && provider.github) {
      getRepositories({
        page: 1,
        limit: 100,
        appId: `${provider.github.appId}`,
        installationId: `${provider.github.installationId}`,
        privateKey: provider.github.privateKey,
      })

      if (
        service?.githubSettings?.owner &&
        service?.githubSettings.repository
      ) {
        getBranches({
          page: 1,
          limit: 100,
          appId: `${provider.github.appId}`,
          installationId: `${provider.github.installationId}`,
          privateKey: provider.github.privateKey,
          owner: service?.githubSettings?.owner,
          repository: service?.githubSettings.repository,
        })
      }
    }
  }, [])

  function onSubmit(values: z.infer<typeof updateServiceSchema>) {
    saveGitProviderDetails(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-6'>
        {/* Account field */}
        <FormField
          control={form.control}
          name='provider'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account</FormLabel>

              <Select
                onValueChange={value => {
                  field.onChange(value)

                  const provider = gitProviders.find(({ id }) => id === value)

                  if (
                    provider &&
                    provider.github &&
                    provider.github.installationId
                  ) {
                    const { appId, installationId, privateKey } =
                      provider.github
                    getRepositories({
                      appId: `${appId}`,
                      installationId,
                      privateKey,
                      limit: 100,
                      page: 1,
                    })
                  } else {
                    resetRepositoriesList()
                  }

                  // Resetting the repository, branch value whenever account is changed
                  form.setValue('githubSettings.repository', '')
                  form.setValue('githubSettings.branch', '')
                }}
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
                        <SelectItem
                          disabled={!github.installationId}
                          key={github.appName}
                          value={id}>
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

        {/* Repository field */}
        <FormField
          control={form.control}
          name='githubSettings.repository'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repository</FormLabel>

              <Select
                onValueChange={value => {
                  field.onChange(value)
                  if (repositoriesList) {
                    const { repositories } = repositoriesList

                    const providerId = form.getValues('provider')

                    const provider = gitProviders.find(
                      ({ id }) => id === providerId,
                    )

                    const owner = repositories.find(repo => repo.name === value)
                      ?.owner?.login

                    // On changing repository fetching branches based on that
                    if (
                      owner &&
                      provider &&
                      provider.github &&
                      provider.github.installationId
                    ) {
                      getBranches({
                        owner,
                        appId: `${provider.github.appId}`,
                        installationId: provider.github.installationId ?? '',
                        privateKey: provider.github.privateKey,
                        repository: value,
                        limit: 100,
                        page: 1,
                      })
                    } else {
                      resetBranchesList()
                    }

                    form.setValue('githubSettings.owner', owner ?? '')
                    // resetting branch name whenever repository is changed
                    form.setValue('githubSettings.branch', '')
                  }
                }}
                disabled={!provider || repositoriesLoading}
                defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a repository' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {repositoriesList?.repositories?.length
                    ? repositoriesList?.repositories?.map(repository => {
                        return (
                          <SelectItem
                            value={repository.name}
                            key={repository.name}>
                            {repository.name}
                          </SelectItem>
                        )
                      })
                    : null}
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Branch field */}
        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='githubSettings.branch'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch</FormLabel>

                <Select
                  disabled={
                    !provider || branchesLoading || !githubSettings?.repository
                  }
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a branch' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {branchesList?.branches?.length
                      ? branchesList?.branches?.map(branch => (
                          <SelectItem value={branch.name} key={branch.name}>
                            {branch.name}
                          </SelectItem>
                        ))
                      : null}
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
                  <Input
                    {...field}
                    value={field.value || ''}
                    onChange={e => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='port'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Port</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  {...field}
                  value={field.value || ''}
                  onChange={e => {
                    const value = e.target.value
                      ? parseInt(e.target.value, 10)
                      : ''
                    field.onChange(value)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex w-full justify-end'>
          <Button type='submit' disabled={isPending} variant='outline'>
            Save
          </Button>
        </div>
      </form>
    </Form>
  )
}

const ProviderForm = ({
  gitProviders,
  service,
}: {
  gitProviders: GitProvider[]
  service: Service
}) => {
  return (
    <div className='space-y-4 rounded bg-muted/30 p-4'>
      <div>
        <h3 className='text-lg font-semibold'>Provider</h3>
        <p className='text-muted-foreground'>Select the source of your code</p>
      </div>

      <Tabs
        tabs={[
          {
            label: 'Github',
            content: () => (
              <GithubForm gitProviders={gitProviders} service={service} />
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
