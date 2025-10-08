'use client'

import { getPositionForNewNode } from '../ChooseService'
import { GithubServiceSchema, GithubServiceType } from '../types'
import { zodResolver } from '@hookform/resolvers/zod'
import { Node, useReactFlow } from '@xyflow/react'
import { motion } from 'motion/react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from 'unique-names-generator'

import {
  getAllAppsAction,
  getBranchesAction,
  getRepositoriesAction,
} from '@/actions/gitProviders'
import { ServiceNode } from '@/components/reactflow/types'
import SecretContent from '@/components/ui/blur-reveal'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import SelectSearch from '@/components/ui/select-search'
import { buildOptions } from '@/lib/buildOptions'

const githubURLRegex = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)(?:\.git)?$/

const handleBuildPathInputChange =
  (onChange: (value: string) => void) =>
  (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/^\/+/, '')
    onChange(value)
  }

const AddGithubService = ({
  setNodes,
  nodes,
  type = 'create',
  setOpen,
  handleOnClick,
  service,
}: {
  setNodes: Function
  nodes: Node[]
  service?: ServiceNode
  setOpen?: Function
  type: 'create' | 'update'
  handleOnClick?: ({ serviceId }: { serviceId: string }) => void
}) => {
  const { fitView } = useReactFlow()
  const [repoType, setRepoType] = useState(
    service?.provider ? 'private' : 'public',
  )

  const {
    execute: fetchProviders,
    isPending,
    result: gitProviders,
  } = useAction(getAllAppsAction)

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

  const form = useForm<GithubServiceType>({
    resolver: zodResolver(GithubServiceSchema),
    defaultValues: {
      providerType: 'github',
      builder: service?.builder ?? 'buildPacks',
      provider:
        typeof service?.provider === 'object'
          ? service?.provider?.id
          : service?.provider,
      githubSettings: {
        owner: service?.githubSettings?.owner ?? '',
        branch: service?.githubSettings?.branch,
        buildPath: service?.githubSettings?.buildPath ?? '/',
        repository: service?.githubSettings?.repository,
        port: service?.githubSettings?.port ?? 3000,
        gitToken: service?.githubSettings?.gitToken ?? '',
      },
    },
  })

  useEffect(() => {
    fetchProviders()
  }, [])
  useEffect(() => {
    const defaultProvider =
      typeof service?.provider === 'object'
        ? service?.provider?.id
        : service?.provider
    const provider = gitProviders?.data?.find(
      ({ id }) => id === defaultProvider,
    )
    if (provider && provider.github) {
      getRepositories({
        page: 1,
        limit: 10,
        appId: `${provider.github.appId}`,
        installationId: `${provider.github.installationId}`,
        privateKey: provider.github.privateKey,
      })
    }
  }, [isPending])
  useEffect(() => {
    const defaultProvider =
      typeof service?.provider === 'object'
        ? service?.provider?.id
        : service?.provider
    const provider = gitProviders?.data?.find(
      ({ id }) => id === defaultProvider,
    )
    if (
      provider &&
      provider.github &&
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
  }, [isPending, repositoriesLoading])

  const { provider, githubSettings } = useWatch({ control: form.control })

  const addGithubNode = (data: GithubServiceType) => {
    if (type === 'update') {
      setNodes((prevNodes: Node[]) =>
        prevNodes.map(node => {
          if (node.id === service?.id) {
            return {
              ...node,
              data: {
                ...node.data,
                ...data,
              },
            }
          }
          return node
        }),
      )
      toast.success('Github details updated successfully')
    } else if (type === 'create') {
      const name = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: '-',
        style: 'lowerCase',
        length: 2,
      })
      const newNode: ServiceNode = {
        type: 'app',
        id: name,
        name,
        variables: [],
        ...data,
      }

      setNodes((prev: Node[]) => [
        ...prev,
        {
          id: name,
          data: {
            ...newNode,
            ...(handleOnClick && {
              onClick: () => handleOnClick({ serviceId: name }),
            }),
          },
          position: getPositionForNewNode(nodes?.length),
          type: 'custom',
        },
      ])
      setOpen?.(false)
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 500 })
      }, 100)
    }
  }
  const publicRepoURL =
    githubSettings?.owner && githubSettings?.repository
      ? `https://github.com/${githubSettings?.owner}/${githubSettings?.repository}`
      : ''

  // Create repository options for SelectSearch
  const repositoryOptions =
    repositoriesList?.repositories?.map(repo => ({
      id: repo.name,
      name: repo.name,
      owner: repo.owner?.login,
    })) || []

  // Create branch options for SelectSearch
  const branchOptions =
    branchesList?.branches?.map(branch => ({
      id: branch.name,
      name: branch.name,
    })) || []

  return (
    <motion.div
      initial={{ x: '5%', opacity: 0.25 }}
      animate={{ x: 0, opacity: [0.25, 1] }}
      exit={{ x: '100%', opacity: 1 }}
      className='w-full'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(addGithubNode)}>
          <ScrollArea className='h-[60vh]'>
            <div className='space-y-6'>
              <div className='space-y-4'>
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
                  className='flex gap-4'>
                  <div className='has-data-[state=checked]:border-ring border-input relative flex w-full items-start gap-2 rounded-md border p-4 shadow-2xs outline-hidden'>
                    <RadioGroupItem
                      value='public'
                      id='r2'
                      className='order-1 after:absolute after:inset-0'
                    />
                    <div className='flex grow items-start gap-3'>
                      <div className='grid grow gap-2'>
                        <Label>open source</Label>

                        <p className='text-muted-foreground text-xs'>
                          Automatic deployment is not available.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='has-data-[state=checked]:border-ring border-input relative flex w-full items-start gap-2 rounded-md border p-4 shadow-2xs outline-hidden'>
                    <RadioGroupItem
                      value='private'
                      id='r3'
                      className='order-1 after:absolute after:inset-0'
                    />
                    <div className='flex grow items-start gap-3'>
                      <div className='grid grow gap-2'>
                        <Label>personal/organisation</Label>

                        <p className='text-muted-foreground text-xs'>
                          Automatic deployment is enabled
                        </p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {repoType === 'public' ? (
                <>
                  <div
                    className={`grid gap-4 ${type == 'update' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {/* Repository URL */}
                    <FormField
                      control={form.control}
                      name='githubSettings.repository'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Repository URL</FormLabel>
                          <FormControl>
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

                                  form.setValue(
                                    'githubSettings.owner',
                                    username,
                                  )
                                  form.setValue(
                                    'githubSettings.repository',
                                    repository,
                                  )
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Branch */}
                    <FormField
                      control={form.control}
                      name='githubSettings.branch'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch</FormLabel>
                          <FormControl>
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='githubSettings.gitToken'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Git Token</FormLabel>
                          <FormControl>
                            <SecretContent defaultHide={!!field.value}>
                              <Input type='text' {...field} />
                            </SecretContent>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className='grid gap-4 md:grid-cols-2'>
                      {/* Port */}
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
                                onChange={handleBuildPathInputChange(
                                  field.onChange,
                                )}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className='space-y-6'>
                  <div
                    className={`grid gap-4 ${type === 'update' ? 'grid-cols-2' : 'grid-cols-1'} `}>
                    {/* Account field */}
                    <FormField
                      control={form.control}
                      name='provider'
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <SelectSearch
                              fieldValue={field.value}
                              label='Account'
                              inputPlaceholder={'account'}
                              gitProviders={gitProviders?.data ?? []}
                              onSelect={(value: string) => {
                                field.onChange(value)

                                const provider = gitProviders?.data?.find(
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
                            />
                          </FormControl>
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
                          <FormControl>
                            <SelectSearch
                              fieldValue={field.value}
                              label='Repository'
                              inputPlaceholder={
                                repositoriesLoading
                                  ? 'fetching repositories...'
                                  : 'repository'
                              }
                              gitProviders={repositoryOptions}
                              disabled={!provider || repositoriesLoading}
                              onSelect={(value: any) => {
                                field.onChange(value)

                                if (repositoriesList) {
                                  const { repositories } = repositoriesList

                                  const providerId = form.getValues('provider')

                                  const provider = gitProviders?.data?.find(
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

                                  form.setValue(
                                    'githubSettings.owner',
                                    owner ?? '',
                                  )
                                  // resetting branch name whenever repository is changed
                                  form.setValue('githubSettings.branch', '')
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div
                    className={`grid gap-4 ${type === 'update' ? 'md:grid-cols-4' : 'grid-cols-2'} `}>
                    <div className='md:col-span-2'>
                      {/* Branch field */}
                      <FormField
                        control={form.control}
                        name='githubSettings.branch'
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <SelectSearch
                                fieldValue={field.value}
                                label='Branch'
                                inputPlaceholder={
                                  branchesLoading
                                    ? 'fetching branches...'
                                    : 'branch'
                                }
                                gitProviders={branchOptions}
                                disabled={
                                  !provider ||
                                  branchesLoading ||
                                  !githubSettings?.repository
                                }
                                onSelect={field.onChange}
                              />
                            </FormControl>
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
                              onChange={handleBuildPathInputChange(
                                field.onChange,
                              )}
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
                        className='grid w-full grid-cols-1 gap-4 md:grid-cols-2'>
                        {buildOptions.map(
                          ({ value, label, icon, description }) => (
                            <FormItem
                              className='flex w-full items-center space-y-0 space-x-3'
                              key={value}>
                              <FormControl>
                                <div className='has-data-[state=checked]:border-ring border-input relative flex h-full w-full items-start gap-2 rounded-md border p-4 shadow-2xs outline-hidden'>
                                  <RadioGroupItem
                                    value={value}
                                    id={value}
                                    aria-describedby={`${label}-builder`}
                                    className='order-1 after:absolute after:inset-0'
                                  />
                                  <div className='flex grow items-start gap-3'>
                                    <div className='flex h-8 w-8 items-center justify-center'>
                                      {icon}
                                    </div>

                                    <div className='grid grow gap-2'>
                                      <Label htmlFor={value}>{label}</Label>

                                      <p className='text-muted-foreground text-xs'>
                                        {description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </FormControl>
                            </FormItem>
                          ),
                        )}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </ScrollArea>

          <DialogFooter className='mt-4'>
            <Button
              type='submit'
              disabled={
                isPending ||
                !githubSettings?.buildPath ||
                (repoType === 'public' &&
                  (!githubSettings?.branch ||
                    !githubSettings?.owner ||
                    !githubSettings?.repository))
              }
              variant='outline'>
              Save
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </motion.div>
  )
}

export default AddGithubService
