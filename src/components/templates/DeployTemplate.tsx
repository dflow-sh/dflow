'use client'

import { Docker, MariaDB, MongoDB, MySQL, PostgreSQL, Redis } from '../icons'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { zodResolver } from '@hookform/resolvers/zod'
import { Database, Github, Rocket } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Fragment, JSX, useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  deployTemplateAction,
  deployTemplateFromArchitectureAction,
  getAllTemplatesAction,
} from '@/actions/templates'
import { deployTemplateSchema } from '@/actions/templates/validator'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Server, Service, Template } from '@/payload-types'
import { useArchitectureContext } from '@/providers/ArchitectureProvider'

const icon: { [key in Service['type']]: JSX.Element } = {
  app: <Github className='size-5 text-foreground' />,
  database: <Database className='size-5 text-destructive' />,
  docker: <Docker className='size-5' />,
}

type StatusType = NonNullable<NonNullable<Service['databaseDetails']>['type']>

const databaseIcons: {
  [key in StatusType]: JSX.Element
} = {
  postgres: <PostgreSQL className='size-5' />,
  mariadb: <MariaDB className='size-5' />,
  mongo: <MongoDB className='size-5' />,
  mysql: <MySQL className='size-5' />,
  redis: <Redis className='size-5' />,
}

const TemplateDeploymentForm = ({
  execute,
  isPending,
  templates,
  type,
  server: { plugins, name: serverName, id: serverId },
}: {
  execute: ({ type }: { type: 'official' | 'community' | 'personal' }) => void
  isPending: boolean
  templates?: Template[]
  type: 'official' | 'community' | 'personal'
  server: Server
}) => {
  const dialogRef = useRef<HTMLButtonElement>(null)
  const params = useParams<{ id: string; organisation: string }>()

  const { execute: deployTemplate, isPending: deployingTemplate } = useAction(
    deployTemplateAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success('Added to queue', {
            description: 'Added template deploy to queue',
          })

          dialogRef.current?.click()
        }
      },
      onError: ({ error }) => {
        toast.error(`Failed to deploy template: ${error?.serverError}`)
      },
    },
  )

  const {
    execute: deployOfficialTemplate,
    isPending: deployingOfficialTemplate,
  } = useAction(deployTemplateFromArchitectureAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success('Added to queue', {
          description: 'Added template deploy to queue',
        })

        dialogRef.current?.click()
      }
    },
    onError: ({ error }) => {
      console.log({ error })

      toast.error(`Failed to deploy official template: ${error?.serverError}`)
    },
  })

  const form = useForm<z.infer<typeof deployTemplateSchema>>({
    resolver: zodResolver(deployTemplateSchema),
    defaultValues: {
      projectId: params.id,
    },
  })

  const { id } = useWatch({ control: form.control })

  useEffect(() => {
    execute({ type: type })
  }, [])

  function onSubmit(values: z.infer<typeof deployTemplateSchema>) {
    if (type === 'personal') {
      deployTemplate(values)
    } else if (type === 'official' || type === 'community') {
      const filteredTemplate = templates?.find(
        template => template?.id === values?.id,
      )

      if (filteredTemplate) {
        const services = filteredTemplate.services ?? []

        const formattedServices = services.map(
          ({ type, name, description = '', ...serviceDetails }) => {
            if (type === 'database') {
              return {
                type,
                name,
                description,
                databaseDetails: serviceDetails.databaseDetails,
              }
            }

            if (type === 'docker') {
              return {
                type,
                name,
                description,
                dockerDetails: serviceDetails?.dockerDetails,
                variables: serviceDetails?.variables,
                volumes: serviceDetails?.volumes ?? [],
              }
            }

            if (type === 'app') {
              return {
                type,
                name,
                description,
                variables: serviceDetails?.variables,
                githubSettings: serviceDetails?.githubSettings,
                providerType: serviceDetails?.providerType,
                provider: serviceDetails?.provider,
                volumes: serviceDetails?.volumes ?? [],
              }
            }
          },
        ) as any[]

        deployOfficialTemplate({
          projectId: values?.projectId,
          services: formattedServices,
        })
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='id'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template</FormLabel>
              <Select
                disabled={isPending || deployingTemplate}
                onValueChange={field.onChange}
                defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className='h-max text-left'>
                    <SelectValue
                      placeholder={
                        isPending
                          ? `Fetching ${type} templates...`
                          : 'Select a Template'
                      }
                    />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  {/* todo: add disabled state for database services if plugin is not installed */}
                  {templates?.map(({ id, name, services = [] }) => {
                    const databasesList = services?.filter(
                      service => service.type === 'database',
                    )

                    const disabledDatabasesList = databasesList?.filter(
                      database => {
                        const databaseType = database?.databaseDetails?.type

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

                    const disabledDatabasesListNames = disabledDatabasesList
                      ?.map(database => database?.databaseDetails?.type)
                      ?.filter((value, index, self) => {
                        return self.indexOf(value) === index
                      })

                    return (
                      <Fragment key={id}>
                        <SelectItem
                          value={id}
                          disabled={
                            !services?.length || !!disabledDatabasesList?.length
                          }>
                          {name}

                          <div className='mt-1 flex flex-wrap items-center gap-1'>
                            {services?.map(service => {
                              const serviceName =
                                service.databaseDetails?.type ?? service?.type

                              return (
                                <Badge
                                  variant={'outline'}
                                  key={service.id}
                                  className='gap-1 capitalize'>
                                  {service.type === 'database' &&
                                  service.databaseDetails?.type
                                    ? databaseIcons[
                                        service.databaseDetails?.type
                                      ]
                                    : icon[service.type]}

                                  {serviceName}
                                </Badge>
                              )
                            })}
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
                                href={`/${params.organisation}/servers/${serverId}?tab=plugins`}>
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

        <DialogFooter>
          <DialogClose ref={dialogRef} className='sr-only' />

          <Button
            type='submit'
            disabled={deployingTemplate || deployingOfficialTemplate || !id}
            isLoading={deployingTemplate || deployingOfficialTemplate}>
            Deploy
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

const DeployTemplate = ({
  disableDeployButton = false,
  disableReason = 'This action is currently unavailable',
  server,
}: {
  disableDeployButton?: boolean
  disableReason?: string
  server: Server
}) => {
  const { execute, result, isPending } = useAction(getAllTemplatesAction)

  const architectureContext = function useSafeArchitectureContext() {
    try {
      return useArchitectureContext()
    } catch (e) {
      return null
    }
  }

  const isDeploying = architectureContext()?.isDeploying
  const isButtonDisabled = disableDeployButton || isDeploying

  const deployButton = (
    <Button variant='outline' disabled={isButtonDisabled}>
      <Rocket className='mr-2' /> Deploy from Template
    </Button>
  )

  return (
    <Dialog>
      {isButtonDisabled ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>{deployButton}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isDeploying ? 'Deployment in progress' : disableReason}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <DialogTrigger asChild>{deployButton}</DialogTrigger>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deploy from Template</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <Tabs defaultValue='official'>
          <TabsList>
            <TabsTrigger value='official'>Official</TabsTrigger>
            <TabsTrigger value='community'>Community</TabsTrigger>
            <TabsTrigger value='personal'>Personal</TabsTrigger>
          </TabsList>

          <TabsContent value='official'>
            <TemplateDeploymentForm
              execute={execute}
              templates={result.data}
              isPending={isPending}
              server={server}
              type='official'
            />
          </TabsContent>

          <TabsContent value='community'>
            <TemplateDeploymentForm
              execute={execute}
              templates={result.data}
              isPending={isPending}
              server={server}
              type='community'
            />
          </TabsContent>

          <TabsContent value='personal'>
            <TemplateDeploymentForm
              execute={execute}
              templates={result.data}
              isPending={isPending}
              server={server}
              type='personal'
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default DeployTemplate
