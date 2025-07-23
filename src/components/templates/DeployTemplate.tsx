'use client'

import { Docker, MariaDB, MongoDB, MySQL, PostgreSQL, Redis } from '../icons'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Database, Github, Loader2, Rocket } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { JSX, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  getAllTemplatesAction,
  templateDeployAction,
} from '@/actions/templates'
import {
  ServicesSchemaType,
  deployTemplateSchema,
} from '@/actions/templates/validator'
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
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

export const formateServices = (services: Template['services']) => {
  const formattedServices = services?.map(
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
  )
  return formattedServices as ServicesSchemaType
}

const TemplateCard = ({
  template,
  isSelected,
  isDisabled,
  disabledReason,
  onSelect,
  serverId,
  serverName,
  organisationName,
}: {
  template: Template
  isSelected: boolean
  isDisabled: boolean
  disabledReason?: string[]
  onSelect: (id: string) => void
  serverId: string
  serverName: string
  organisationName: string
}) => {
  const { id, name, services = [], description, imageUrl } = template

  const card = (
    <div
      className={cn(
        'relative cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md',
        isSelected && 'border-primary',
        isDisabled && 'cursor-not-allowed opacity-50',
      )}
      onClick={() => !isDisabled && onSelect(id)}>
      {isSelected && (
        <div className='absolute right-3 top-3'>
          <Check className='size-5 text-primary' />
        </div>
      )}

      <div className='space-y-3'>
        <div className='flex items-center gap-3'>
          {/* Template Image */}
          <div className='flex-shrink-0'>
            <img
              src={imageUrl || '/images/favicon.ico'}
              alt={`${name} template`}
              className='size-10 rounded-md object-cover'
            />
          </div>

          {/* Title and Description */}
          <div className='min-w-0 flex-1'>
            <h4 className='text-sm font-semibold'>{name}</h4>
            {description && (
              <p className='mt-1 line-clamp-2 text-xs text-muted-foreground'>
                {description}
              </p>
            )}
          </div>
        </div>

        <div className='flex flex-wrap gap-1'>
          {services?.map(service => {
            const serviceName = service.databaseDetails?.type ?? service?.type

            return (
              <Badge
                variant='outline'
                key={service.id}
                className='gap-1 text-xs capitalize'>
                {service.type === 'database' && service.databaseDetails?.type
                  ? databaseIcons[service.databaseDetails?.type]
                  : icon[service.type]}
                {serviceName}
              </Badge>
            )
          })}
        </div>

        {isDisabled && disabledReason?.length && (
          <div className='text-xs text-destructive'>
            Enable {disabledReason.join(', ')} plugin for{' '}
            <Button
              variant='link'
              className='h-auto w-min px-0 text-xs'
              asChild>
              <Link
                href={`/${organisationName}/servers/${serverId}?tab=plugins`}>
                {serverName}
              </Link>
            </Button>{' '}
            server to deploy template
          </div>
        )}
      </div>
    </div>
  )

  if (isDisabled && disabledReason?.length) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{card}</TooltipTrigger>
          <TooltipContent>
            <p>Missing required plugins: {disabledReason.join(', ')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return card
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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')

  const { execute: deployTemplate, isPending: deployingTemplate } = useAction(
    templateDeployAction,
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

  const form = useForm<z.infer<typeof deployTemplateSchema>>({
    resolver: zodResolver(deployTemplateSchema),
    defaultValues: {
      projectId: params.id,
    },
  })

  useEffect(() => {
    execute({ type: type })
  }, [])

  useEffect(() => {
    form.setValue('id', selectedTemplateId)
  }, [selectedTemplateId, form])

  function onSubmit(values: z.infer<typeof deployTemplateSchema>) {
    const filteredTemplate = templates?.find(
      template => template?.id === values?.id,
    )

    const services = formateServices(filteredTemplate?.services)

    deployTemplate({
      projectId: values?.projectId,
      services,
    })
  }

  const processedTemplates = templates?.map(template => {
    const { id, name, services = [] } = template

    const databasesList = services?.filter(
      service => service.type === 'database',
    )

    const disabledDatabasesList = databasesList?.filter(database => {
      const databaseType = database?.databaseDetails?.type

      const pluginDetails = plugins?.find(
        plugin => plugin.name === databaseType,
      )

      return (
        !pluginDetails ||
        (pluginDetails && pluginDetails?.status === 'disabled')
      )
    })

    const disabledDatabasesListNames = Array.from(
      new Set(
        disabledDatabasesList
          ?.map(db => db?.databaseDetails?.type)
          .filter(
            (value): value is Exclude<typeof value, undefined> =>
              value !== undefined,
          ),
      ),
    )

    return {
      ...template,
      isDisabled: !services?.length || !!disabledDatabasesList?.length,
      disabledReason: disabledDatabasesListNames,
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='id'
          render={() => (
            <FormItem>
              <FormLabel>Select Template</FormLabel>
              <FormControl>
                <div className='space-y-4'>
                  {isPending ? (
                    <div className='flex flex-col items-center justify-center space-y-2 py-8 text-sm text-muted-foreground'>
                      <Loader2 className='h-5 w-5 animate-spin' />
                      <div>Fetching {type} templates...</div>
                    </div>
                  ) : processedTemplates?.length ? (
                    <div className='grid max-h-96 grid-cols-1 gap-3 overflow-y-auto md:grid-cols-2'>
                      {processedTemplates.map(template => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          isSelected={selectedTemplateId === template.id}
                          isDisabled={template.isDisabled}
                          disabledReason={template.disabledReason}
                          onSelect={setSelectedTemplateId}
                          serverId={serverId}
                          serverName={serverName}
                          organisationName={params.organisation}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className='flex items-center justify-center py-8 text-sm text-muted-foreground'>
                      No {type} templates available
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <DialogClose ref={dialogRef} className='sr-only' />
          <Button
            type='submit'
            disabled={deployingTemplate || !selectedTemplateId}
            isLoading={deployingTemplate}>
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

      <DialogContent className='flex max-h-[80vh] max-w-4xl flex-col overflow-hidden'>
        <DialogHeader>
          <DialogTitle>Deploy from Template</DialogTitle>
          <DialogDescription>
            Choose a template to deploy to your project
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 overflow-hidden'>
          <Tabs defaultValue='official' className='flex h-full flex-col'>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='official'>Official</TabsTrigger>
              <TabsTrigger value='community'>Community</TabsTrigger>
              <TabsTrigger value='personal'>Personal</TabsTrigger>
            </TabsList>

            <div className='flex-1 overflow-hidden'>
              <TabsContent value='official' className='h-full'>
                <TemplateDeploymentForm
                  execute={execute}
                  templates={result.data}
                  isPending={isPending}
                  server={server}
                  type='official'
                />
              </TabsContent>

              <TabsContent value='community' className='h-full'>
                <TemplateDeploymentForm
                  execute={execute}
                  templates={result.data}
                  isPending={isPending}
                  server={server}
                  type='community'
                />
              </TabsContent>

              <TabsContent value='personal' className='h-full'>
                <TemplateDeploymentForm
                  execute={execute}
                  templates={result.data}
                  isPending={isPending}
                  server={server}
                  type='personal'
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DeployTemplate
