'use client'

import { Badge } from "@core/components/ui/badge"
import { Button } from "@core/components/ui/button"
import { Checkbox } from "@core/components/ui/check-box"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@core/components/ui/form"
import { Input } from "@core/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@core/components/ui/select"
import { Textarea } from "@core/components/ui/textarea"
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
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

import { getProjectsAndServers } from "@core/actions/pages/dashboard"
import { templateDeployAction } from "@core/actions/templates"
import {
  DeployTemplateWithProjectCreateType,
  ServicesSchemaType,
  deployTemplateWithProjectCreateSchema,
} from "@core/actions/templates/validator"
import { slugify } from "@core/lib/slugify"
import { cn } from "@core/lib/utils"

const DeployTemplateWithProjectForm = ({
  services,
}: {
  services: ServicesSchemaType
}) => {
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
    templateDeployAction,
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
            <DialogDescription className='sr-only'>
              This template will be deployed with selected services
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
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
                          <p className='text-muted-foreground text-sm'>
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
                                  service => service.type === 'database',
                                )

                                const disabledDatabasesList =
                                  databasesList?.filter(database => {
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
                                      database =>
                                        database?.databaseDetails?.type,
                                    )
                                    ?.filter((value, index, self) => {
                                      return self.indexOf(value) === index
                                    })
                                return (
                                  <Fragment key={id}>
                                    <SelectItem
                                      key={id}
                                      value={id}
                                      disabled={!isAvailable}>
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

                                    {isOnboarded &&
                                    isConnected &&
                                    disabledDatabasesListNames?.length ? (
                                      <span className='text-muted-foreground px-2 text-xs'>
                                        {`${disabledDatabasesListNames?.join(',')} plugin will be automatically installed during deployment!`}
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
                      <FormLabel>Project</FormLabel>

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
                            if (typeof server !== 'object') {
                              return null
                            }

                            const {
                              plugins,
                              id: serverId,
                              name: serverName,
                            } = server

                            const databasesList = services?.filter(
                              service => service.type === 'database',
                            )

                            const disabledDatabasesList = databasesList?.filter(
                              database => {
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
                                  database => database?.databaseDetails?.type,
                                )
                                ?.filter((value, index, self) => {
                                  return self.indexOf(value) === index
                                })

                            const isEnabled =
                              server.onboarded &&
                              server.connection?.status === 'success'

                            return (
                              <Fragment key={id}>
                                <SelectItem disabled={!isEnabled} value={id}>
                                  <div className='flex w-full items-center justify-between'>
                                    <span>{name}</span>
                                  </div>
                                </SelectItem>

                                {isEnabled &&
                                disabledDatabasesListNames?.length ? (
                                  <span className='text-muted-foreground px-2 text-xs'>
                                    {`${disabledDatabasesListNames?.join(',')} plugins will be installed during deployment!`}
                                  </span>
                                ) : null}

                                {!isEnabled && (
                                  <span className='text-muted-foreground px-2 text-xs'>
                                    {server.name} server is not ready for
                                    deployment!
                                  </span>
                                )}
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
