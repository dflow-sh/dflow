import { zodResolver } from '@hookform/resolvers/zod'
import { Node, useReactFlow } from '@xyflow/react'
import { motion } from 'framer-motion'
import { useAction } from 'next-safe-action/hooks'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { getPositionForNewNode } from './CreateNewTemplate'
import { GithubServiceSchema, GithubServiceType } from './types'

const AddGithubService = ({
  setNodes,
  nodes,
  setOpen,
}: {
  setNodes: Function
  nodes: Node[]
  setOpen: Function
}) => {
  const { fitView } = useReactFlow()

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
      githubSettings: {
        port: 3000,
        buildPath: '/',
      },
    },
  })

  useEffect(() => {
    fetchProviders()
  }, [])

  const { provider, githubSettings } = useWatch({ control: form.control })

  const addGithubNode = (data: GithubServiceType) => {
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
      environmentVariables: {},
      ...data,
    }

    setNodes((prev: Node[]) => [
      ...prev,
      {
        id: name,
        data: { ...newNode },
        position: getPositionForNewNode(nodes?.length),
        type: 'custom',
      },
    ])
    setOpen(false)
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 500 })
    }, 100)
  }

  return (
    <motion.div
      initial={{ x: '5%', opacity: 0.25 }}
      animate={{ x: 0, opacity: [0.25, 1] }}
      exit={{ x: '100%', opacity: 1 }}
      className='w-full'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(addGithubNode)} className='space-y-4'>
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
                  disabled={isPending}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isPending
                            ? 'Fetching accounts...'
                            : 'Select a account'
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {gitProviders?.data?.map(({ github, id }) => {
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
                  disabled={!provider || repositoriesLoading}>
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
          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='githubSettings.branch'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch</FormLabel>

                  <Select
                    disabled={
                      !provider ||
                      branchesLoading ||
                      !githubSettings?.repository
                    }
                    value={field.value}
                    onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            branchesLoading
                              ? 'Fetching branches...'
                              : 'Select a branch'
                          }
                        />
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
            name='githubSettings.port'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Port</FormLabel>
                <FormControl>
                  <Input
                    className='w-full'
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
          <DialogFooter>
            <Button
              disabled={!githubSettings?.repository || !githubSettings?.branch}
              type='submit'>
              Add
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </motion.div>
  )
}

export default AddGithubService
