'use client'

import Tabs from '../Tabs'
import { Docker } from '../icons'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { zodResolver } from '@hookform/resolvers/zod'
import { Hammer } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GitProvider, Service } from '@/payload-types'

const options = [
  {
    label: 'Default',
    value: 'railpack',
    icon: <Hammer size={20} />,
    description: 'Build app using railpack',
  },
  {
    label: 'Dockerfile',
    value: 'dockerfile',
    icon: <Docker fontSize={20} />,
    description: 'Build app using Dockerfile',
  },
]

const githubURLRegex = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)(?:\.git)?$/

const GithubForm = ({
  gitProviders,
  service,
}: {
  gitProviders: GitProvider[]
  service: Service
}) => {
  const [repoType, setRepoType] = useState(
    service?.provider ? 'private' : 'public',
  )
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
        owner: service?.githubSettings?.owner ?? '',
        branch: service?.githubSettings?.branch,
        buildPath: service?.githubSettings?.buildPath,
        repository: service?.githubSettings?.repository,
        port: service?.githubSettings?.port ?? 3000,
      },
      builder: service?.builder ?? 'railpack',
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
        limit: 10,
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
          limit: 10,
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

  const publicRepoURL =
    githubSettings?.owner && githubSettings?.repository
      ? `https://github.com/${githubSettings?.owner}/${githubSettings?.repository}`
      : ''

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-6'>
        <div className='space-y-2'>
          <RadioGroup
            value={repoType}
            onValueChange={value => {
              setRepoType(value)
              const githubDetails = service?.githubSettings
              const providerId = service?.provider
                ? typeof service?.provider === 'object'
                  ? service?.provider?.id
                  : service?.provider
                : ''

              // 1. first-time save he can select whatever option he want and store details
              // 2. in-case of public -> repository, branch, owner, provider -> null
              //     1. changed public-private -> repository, branch, owner -> "", provider -> undefined
              //     2. changed private-public -> repository, branch, owner -> "initialValues", provider -> undefined
              // 3. in-case of private -> repository, branch, owner, provider
              //     1. changed private-public -> repository, branch, owner -> "", provider -> undefined
              //     2. changed public-private -> repository, branch, owner, provider -> "initialValues"
              if (value === 'public') {
                form.setValue('provider', undefined)
                form.setValue(
                  'githubSettings.branch',
                  providerId ? '' : (githubDetails?.branch ?? ''),
                )
                form.setValue(
                  'githubSettings.repository',
                  providerId ? '' : (githubDetails?.repository ?? ''),
                )
                form.setValue(
                  'githubSettings.owner',
                  providerId ? '' : (githubDetails?.owner ?? ''),
                )
              } else {
                form.setValue('provider', providerId)
                form.setValue(
                  'githubSettings.branch',
                  providerId ? (githubDetails?.branch ?? '') : '',
                )
                form.setValue(
                  'githubSettings.repository',
                  providerId ? (githubDetails?.repository ?? '') : '',
                )
                form.setValue(
                  'githubSettings.owner',
                  providerId ? (githubDetails?.owner ?? '') : '',
                )
              }
            }}
            className='flex gap-6'>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='public' id='r2' />
              <Label htmlFor='r2'>Public</Label>
            </div>

            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='private' id='r3' />
              <Label htmlFor='r3'>Private</Label>
            </div>
          </RadioGroup>

          <p className='text-[0.8rem] text-muted-foreground'>
            Select private option to deploy public, private repositories from
            your github-app
          </p>
        </div>

        {repoType === 'public' ? (
          <>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label>Repository URL</Label>
                <Input
                  type='text'
                  name='repositoryURL'
                  placeholder='ex: https://github.com/akhil-naidu/dflow'
                  defaultValue={publicRepoURL}
                  onChange={e => {
                    const value = e.target.value
                    const matched = value.match(githubURLRegex)

                    if (matched) {
                      const username = matched[1]
                      const repository = matched[2]

                      form.setValue('githubSettings.owner', username)
                      form.setValue('githubSettings.repository', repository)
                    }
                  }}
                />
              </div>

              <div className='space-y-2'>
                <Label>Branch</Label>
                <Input
                  type='text'
                  name='branch'
                  defaultValue={githubSettings?.branch ?? ''}
                  placeholder='ex: main or commit-hash: 6492769'
                  onChange={e => {
                    const value = e.target.value
                    form.setValue('githubSettings.branch', value)
                  }}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name='githubSettings.port'
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
          </>
        ) : (
          <div className='space-y-6'>
            <div className='grid gap-4 md:grid-cols-2'>
              {/* Account field */}
              <FormField
                control={form.control}
                name='provider'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account</FormLabel>

                    <Select
                      value={field.value}
                      onValueChange={value => {
                        field.onChange(value)

                        const provider = gitProviders.find(
                          ({ id }) => id === value,
                        )

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
                      value={field.value}
                      onValueChange={value => {
                        field.onChange(value)
                        if (repositoriesList) {
                          const { repositories } = repositoriesList

                          const providerId = form.getValues('provider')

                          const provider = gitProviders.find(
                            ({ id }) => id === providerId,
                          )

                          const owner = repositories.find(
                            repo => repo.name === value,
                          )?.owner?.login

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
                              installationId:
                                provider.github.installationId ?? '',
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
                          <SelectValue
                            placeholder={
                              repositoriesLoading
                                ? 'Fetching repositories...'
                                : 'Select a repository'
                            }
                          />
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
            </div>

            <div className='grid gap-4 md:grid-cols-4'>
              <div className='md:col-span-2'>
                {/* Branch field */}
                <FormField
                  control={form.control}
                  name='githubSettings.branch'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>

                      <Select
                        value={field.value}
                        disabled={
                          !provider ||
                          branchesLoading ||
                          !githubSettings?.repository
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
                                <SelectItem
                                  value={branch.name}
                                  key={branch.name}>
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
              </div>

              {/* Build path */}
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

              {/* Port field */}
              <FormField
                control={form.control}
                name='githubSettings.port'
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
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name='builder'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Builder</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className='flex w-full flex-col gap-4 md:flex-row'>
                  {options.map(({ value, label, icon, description }) => (
                    <FormItem
                      className='flex w-full items-center space-x-3 space-y-0'
                      key={value}>
                      <FormControl>
                        <div className='has-data-[state=checked]:border-ring shadow-xs relative flex w-full items-start gap-2 rounded-md border border-input p-4 outline-none'>
                          <RadioGroupItem
                            value={value}
                            id={value}
                            aria-describedby={`${label}-builder`}
                            className='order-1 after:absolute after:inset-0'
                          />
                          <div className='flex grow items-start gap-3'>
                            {icon}

                            <div className='grid grow gap-2'>
                              <Label htmlFor={value}>{label}</Label>

                              <p className='text-xs text-muted-foreground'>
                                {description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex w-full justify-end'>
          <Button
            type='submit'
            disabled={
              isPending ||
              (repoType === 'public' &&
                (!githubSettings?.branch ||
                  !githubSettings?.owner ||
                  !githubSettings?.repository))
            }
            variant='outline'>
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
