'use client'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/check-box'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Textarea } from '../ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
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

import { getProjectsAndServers } from '@/actions/pages/dashboard'
import { deployTemplateWithProjectCreateAction } from '@/actions/templates'
import {
  DeployTemplateWithProjectCreateType,
  deployTemplateWithProjectCreateSchema,
} from '@/actions/templates/validator'
import { slugify } from '@/lib/slugify'
import { cn } from '@/lib/utils'

const DeployTemplateWithProjectForm = ({ services }: { services: any }) => {
  console.log('services in DeployTemplateWithProjectForm', services)
  const [open, setOpen] = useState(false)

  const form = useForm<DeployTemplateWithProjectCreateType>({
    resolver: zodResolver(deployTemplateWithProjectCreateSchema),
    defaultValues: {
      projectDetails: {
        name: '',
        description: '',
      },
      services: services,
      isCreateNewProject: false,
    },
    shouldUnregister: true,
  })

  const { execute: templateDeploy, isPending } = useAction(
    deployTemplateWithProjectCreateAction,
    {
      onSuccess: () => {
        toast.success('Template deployed successfully')
      },
      onError: error => {
        toast.error(
          `Failed to deploy template ${error?.error?.serverError && error.error.serverError}`,
        )
      },
    },
  )
  useEffect(() => {
    if (services && services.length > 0) {
      form.reset({
        ...form.getValues(),
        services,
      })
    }
  }, [services])

  const { isCreateNewProject, services: Data } = useWatch({
    control: form.control,
  })

  const {
    execute: getProjectsAndServersDetails,
    result,
    isPending: isGetProjectsAndServersDetailsPending,
  } = useAction(getProjectsAndServers)

  useEffect(() => {
    getProjectsAndServersDetails()
  }, [])

  useEffect(() => {
    if (isCreateNewProject) {
      form.setValue(
        'projectDetails.name',
        uniqueNamesGenerator({
          dictionaries: [adjectives, colors, animals],
          separator: '-',
          style: 'lowerCase',
          length: 2,
        }),
      )
    }
  }, [isCreateNewProject])

  const servers = result?.data?.serversRes.docs ?? []
  const projects = result?.data?.projectsRes.docs ?? []

  const onSubmit = (data: DeployTemplateWithProjectCreateType) => {
    templateDeploy({
      services: data.services,
      isCreateNewProject: data.isCreateNewProject,
      projectDetails: data.projectDetails,
      projectId: data.projectId,
    })
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={isPending || services.length <= 0}
        variant={'outline'}>
        Deploy
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deploy Template</DialogTitle>
            <DialogDescription>deploy project</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
              <FormField
                control={form.control}
                name='isCreateNewProject'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FormLabel
                        htmlFor='isCreateNewProject'
                        className={cn(
                          'flex cursor-pointer items-center space-x-2 rounded-md border p-2',
                          isCreateNewProject
                            ? 'border-primary/30 bg-primary/10'
                            : 'bg-card',
                        )}>
                        <Checkbox
                          className='items-start justify-start'
                          id='isCreateNewProject'
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <div>
                          <h4 className='text-md font-medium'>
                            Deploy to a New Project
                          </h4>
                          <p className='text-sm text-muted-foreground'>
                            deploy this template to a newly created project.
                          </p>
                        </div>
                      </FormLabel>
                    </FormControl>
                    {/* <FormMessage /> */}
                  </FormItem>
                )}
              />

              {isCreateNewProject && (
                <>
                  <FormField
                    control={form.control}
                    name='projectDetails.name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={e => {
                              e.stopPropagation()
                              e.preventDefault()

                              e.target.value = slugify(e.target.value)

                              field.onChange(e)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='projectDetails.description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            onChange={e => {
                              e.stopPropagation()
                              e.preventDefault()

                              field.onChange(e)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='projectDetails.serverId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Server</FormLabel>

                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isGetProjectsAndServersDetailsPending}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  isGetProjectsAndServersDetailsPending
                                    ? 'Fetching servers...'
                                    : 'Select a server'
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent
                            onSelect={e => {
                              e.preventDefault()
                              e.stopPropagation()
                            }}>
                            {servers.map(
                              ({ name, id, connection, onboarded }) => {
                                const isConnected =
                                  connection?.status === 'success'
                                const isOnboarded = onboarded === true
                                const isAvailable = isConnected && isOnboarded

                                return (
                                  <SelectItem
                                    key={id}
                                    value={id}
                                    disabled={!isAvailable}
                                    className={
                                      !isAvailable
                                        ? 'cursor-not-allowed opacity-50'
                                        : ''
                                    }>
                                    <div className='flex w-full items-center justify-between'>
                                      <span>{name}</span>
                                      {!isOnboarded ? (
                                        <Badge
                                          variant='warning'
                                          className='ml-2 text-xs'>
                                          Setup Required
                                        </Badge>
                                      ) : !isConnected ? (
                                        <Badge
                                          variant='destructive'
                                          className='ml-2 text-xs'>
                                          Connection error
                                        </Badge>
                                      ) : null}
                                    </div>
                                  </SelectItem>
                                )
                              },
                            )}
                          </SelectContent>
                        </Select>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {!isCreateNewProject && (
                <FormField
                  control={form.control}
                  name='projectId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Projects</FormLabel>

                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isGetProjectsAndServersDetailsPending}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isGetProjectsAndServersDetailsPending
                                  ? 'Fetching projects...'
                                  : 'Select a project'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          onSelect={e => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}>
                          {projects.map(({ name, id }) => {
                            return (
                              <SelectItem key={id} value={id}>
                                <div className='flex w-full items-center justify-between'>
                                  <span>{name}</span>
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter>
                <Button
                  type='submit'
                  disabled={isPending}
                  isLoading={isPending}>
                  Deploy
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default DeployTemplateWithProjectForm
