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
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Textarea } from '../ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Fragment, useEffect, useState } from 'react'
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
import { Service } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

const DeployTemplateWithProjectForm = ({ services }: { services: any }) => {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { organisation } = useParams()

  const form = useForm<DeployTemplateWithProjectCreateType>({
    resolver: zodResolver(deployTemplateWithProjectCreateSchema),
    defaultValues: {
      projectDetails: {
        name: uniqueNamesGenerator({
          dictionaries: [adjectives, colors, animals],
          separator: '-',
          style: 'lowerCase',
          length: 2,
        }),
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
      onSuccess: ({ data }) => {
        toast.success('Template deployed successfully')
        setOpen(false)
        router.push(`/${data?.tenantSlug}/dashboard/project/${data?.projectId}`)
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
      form.setValue('services', services)
    }
  }, [services])

  const { isCreateNewProject } = useWatch({
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
                          'flex cursor-pointer items-start gap-3 rounded-md border p-3',
                          isCreateNewProject
                            ? 'border-primary/30 bg-primary/10'
                            : 'bg-card/30',
                        )}>
                        <Checkbox
                          id='isCreateNewProject'
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <div>
                          <h4 className='text-md font-medium'>
                            Deploy to a New Project
                          </h4>
                          <p className='text-sm text-muted-foreground'>
                            Choose this to deploy the template in a newly
                            created project
                          </p>
                        </div>
                      </FormLabel>
                    </FormControl>
                  </FormItem>
                )}
              />

              {isCreateNewProject ? (
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
                              ({
                                name,
                                id,
                                connection,
                                onboarded,
                                plugins,
                              }) => {
                                const isConnected =
                                  connection?.status === 'success'
                                const isOnboarded = onboarded === true
                                const isAvailable = isConnected && isOnboarded
                                const databasesList = services?.filter(
                                  (service: Service) =>
                                    service.type === 'database',
                                )

                                const disabledDatabasesList =
                                  databasesList?.filter((database: Service) => {
                                    const databaseType =
                                      database?.databaseDetails?.type

                                    const pluginDetails = plugins?.find(
                                      plugin => plugin.name === databaseType,
                                    )

                                    return (
                                      !pluginDetails ||
                                      (pluginDetails &&
                                        pluginDetails?.status === 'disabled')
                                    )
                                  })

                                const disabledDatabasesListNames =
                                  disabledDatabasesList
                                    ?.map(
                                      (database: Service) =>
                                        database?.databaseDetails?.type,
                                    )
                                    ?.filter(
                                      (
                                        value: string,
                                        index: number,
                                        self: any,
                                      ) => {
                                        return self.indexOf(value) === index
                                      },
                                    )
                                return (
                                  <Fragment key={id}>
                                    <SelectItem
                                      key={id}
                                      value={id}
                                      disabled={
                                        !isAvailable ||
                                        !!disabledDatabasesList?.length
                                      }
                                      className={
                                        !isAvailable ||
                                        !!disabledDatabasesList?.length
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
                                    {disabledDatabasesListNames?.length ? (
                                      <span className='px-2 text-xs'>
                                        {`Enable ${disabledDatabasesListNames?.join(',')} plugin for `}
                                        <Button
                                          variant='link'
                                          className='w-min px-0'
                                          size={'sm'}
                                          asChild>
                                          <Link
                                            href={`/${organisation}/servers/${id}?tab=plugins`}>
                                            {name}
                                          </Link>
                                        </Button>
                                        {` server to deploy template`}
                                      </span>
                                    ) : null}
                                    <SelectSeparator />
                                  </Fragment>
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
              ) : (
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
                          {projects.map(({ name, id, server }) => {
                            const {
                              plugins,
                              id: serverId,
                              name: serverName,
                            } = server as ServerType

                            const databasesList = services?.filter(
                              (service: Service) => service.type === 'database',
                            )

                            const disabledDatabasesList = databasesList?.filter(
                              (database: Service) => {
                                const databaseType =
                                  database?.databaseDetails?.type

                                const pluginDetails = plugins?.find(
                                  plugin => plugin.name === databaseType,
                                )

                                return (
                                  !pluginDetails ||
                                  (pluginDetails &&
                                    pluginDetails?.status === 'disabled')
                                )
                              },
                            )

                            const disabledDatabasesListNames =
                              disabledDatabasesList
                                ?.map(
                                  (database: Service) =>
                                    database?.databaseDetails?.type,
                                )
                                ?.filter(
                                  (value: string, index: number, self: any) => {
                                    return self.indexOf(value) === index
                                  },
                                )
                            return (
                              <Fragment key={id}>
                                <SelectItem
                                  disabled={!!disabledDatabasesList?.length}
                                  className={
                                    !!disabledDatabasesList?.length
                                      ? 'cursor-not-allowed opacity-50'
                                      : ''
                                  }
                                  key={id}
                                  value={id}>
                                  <div className='flex w-full items-center justify-between'>
                                    <span>{name}</span>
                                  </div>
                                </SelectItem>
                                {disabledDatabasesListNames?.length ? (
                                  <span className='px-2 text-xs'>
                                    {`Enable ${disabledDatabasesListNames?.join(',')} plugin for `}
                                    <Button
                                      variant='link'
                                      className='w-min px-0'
                                      size={'sm'}
                                      asChild>
                                      <Link
                                        href={`/${organisation}/servers/${serverId}?tab=plugins`}>
                                        {serverName}
                                      </Link>
                                    </Button>
                                    {` server to deploy template`}
                                  </span>
                                ) : null}
                                <SelectSeparator />
                              </Fragment>
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
