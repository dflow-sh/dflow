'use client'

import {
  ClickHouse,
  Docker,
  MariaDB,
  MongoDB,
  MySQL,
  PostgreSQL,
  Redis,
} from '../icons'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Database, Github, Loader2, Rocket } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import { JSX, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  getAllOfficialTemplatesAction,
  getPersonalTemplatesAction,
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
  FormMessage,
} from '@/components/ui/form'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Template as DFlowTemplateType } from '@/lib/restSDK/types'
import { cn } from '@/lib/utils'
import { Server, Service, Template } from '@/payload-types'
import { useArchitectureContext } from '@/providers/ArchitectureProvider'

const icon: { [key in Service['type']]: JSX.Element } = {
  app: <Github className='text-foreground size-5' />,
  database: <Database className='text-destructive size-5' />,
  docker: <Docker className='size-5' />,
}

type DatabaseType = NonNullable<NonNullable<Service['databaseDetails']>['type']>

const databaseIcons: {
  [key in DatabaseType]: JSX.Element
} = {
  postgres: <PostgreSQL className='size-5' />,
  mariadb: <MariaDB className='size-5' />,
  mongo: <MongoDB className='size-5' />,
  mysql: <MySQL className='size-5' />,
  redis: <Redis className='size-5' />,
  clickhouse: <ClickHouse className='size-5' />,
}

export const formateServices = (
  services: Template['services'] | DFlowTemplateType['services'],
) => {
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
          provider:
            'provider' in serviceDetails ? serviceDetails.provider : undefined,
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
  hasMissingPlugins,
  missingPlugins,
  onSelect,
  serverId,
  serverName,
  organisationName,
}: {
  template: Template | DFlowTemplateType
  isSelected: boolean
  hasMissingPlugins: boolean
  missingPlugins?: string[]
  onSelect: (id: string) => void
  serverId: string
  serverName: string
  organisationName: string
}) => {
  const { id, name, services = [], description, imageUrl } = template

  return (
    <div
      className={cn(
        'relative cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md',
        isSelected && 'border-primary',
      )}
      onClick={() => onSelect(id)}>
      {isSelected && (
        <div className='absolute top-3 right-3'>
          <Check className='text-primary size-5' />
        </div>
      )}

      <div className='space-y-3'>
        <div className='flex items-center gap-3'>
          {/* Template Image */}
          <div className='shrink-0'>
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
              <p className='text-muted-foreground mt-1 line-clamp-2 text-xs'>
                {description}
              </p>
            )}
          </div>
        </div>

        <div className='flex flex-wrap gap-1'>
          {services?.map(service => {
            const serviceName = service.databaseDetails?.type ?? service?.type
            const isPluginMissing =
              service.type === 'database' &&
              missingPlugins?.includes(service.databaseDetails?.type ?? '')

            const badge = (
              <Badge
                variant={isPluginMissing ? 'warning' : 'outline'}
                key={service.id}
                className={cn(
                  'gap-1 text-xs capitalize',
                  isPluginMissing && 'border-dashed',
                )}>
                {service.type === 'database' && service.databaseDetails?.type
                  ? databaseIcons[service.databaseDetails?.type]
                  : icon[service.type]}
                {serviceName}
              </Badge>
            )

            if (isPluginMissing) {
              return (
                <TooltipProvider key={service.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>{badge}</TooltipTrigger>
                    <TooltipContent>
                      <p>Plugin not installed - will be auto-installed</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            }

            return badge
          })}
        </div>

        {hasMissingPlugins && missingPlugins?.length && (
          <div className='text-muted-foreground text-xs'>
            Missing plugins{' '}
            <span className='text-primary font-medium'>
              {missingPlugins.join(', ')}
            </span>{' '}
            will be auto-installed
          </div>
        )}
      </div>
    </div>
  )
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
  templates?: Template[] | DFlowTemplateType[]
  type: 'official' | 'community' | 'personal'
  server: Server
}) => {
  const router = useRouter()
  const dialogRef = useRef<HTMLButtonElement>(null)
  const params = useParams<{ projectId: string; organisation: string }>()
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')

  const { execute: deployTemplate, isPending: deployingTemplate } = useAction(
    templateDeployAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success('Added to queue', {
            description:
              'Template deployment started. Missing plugins will be installed automatically.',
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
      projectId: params.projectId,
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

    const missingPluginsList = databasesList?.filter(database => {
      const databaseType = database?.databaseDetails?.type

      const pluginDetails = plugins?.find(
        plugin => plugin.name === databaseType,
      )

      return (
        !pluginDetails ||
        (pluginDetails && pluginDetails?.status === 'disabled')
      )
    })

    const missingPluginsNames = Array.from(
      new Set(
        missingPluginsList
          ?.map(db => db?.databaseDetails?.type)
          .filter(
            (value): value is DatabaseType =>
              value !== undefined && value !== null,
          ),
      ),
    )

    return {
      ...template,
      hasMissingPlugins: !!missingPluginsList?.length,
      missingPlugins: missingPluginsNames,
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
              <FormControl>
                <div className='space-y-4'>
                  {isPending ? (
                    <div className='text-muted-foreground flex flex-col items-center justify-center space-y-2 py-8 text-sm'>
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
                          hasMissingPlugins={template.hasMissingPlugins}
                          missingPlugins={template?.missingPlugins}
                          onSelect={setSelectedTemplateId}
                          serverId={serverId}
                          serverName={serverName}
                          organisationName={params.organisation}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className='text-muted-foreground flex items-center justify-center py-8 text-sm'>
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
            variant='outline'
            onClick={() => {
              router.push(
                `/${params.organisation}/templates/compose?templateId=${selectedTemplateId}&type=${type === 'personal' ? 'personal' : 'official'}`,
              )
            }}
            disabled={deployingTemplate || !selectedTemplateId}
            type='button'>
            Configure
          </Button>

          <Button
            type='submit'
            disabled={deployingTemplate || !selectedTemplateId}
            isLoading={deployingTemplate}>
            Deploy Template
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
  const { execute, result, isPending } = useAction(
    getAllOfficialTemplatesAction,
  )
  const {
    execute: getPersonalTemplates,
    result: personalTemplates,
    isPending: isGetTemplatesPending,
  } = useAction(getPersonalTemplatesAction)

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
            Choose a template to deploy to your project. Missing plugins will be
            installed automatically.
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
                  execute={getPersonalTemplates}
                  templates={personalTemplates.data}
                  isPending={isGetTemplatesPending}
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
