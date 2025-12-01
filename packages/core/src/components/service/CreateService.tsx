'use client'

import { Docker, Git } from '../icons'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Loader2,
  Plus,
  Server,
} from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  checkServerResourcesAction,
  createServiceAction,
} from '@dflow/core/actions/service'
import { createServiceSchema } from '@dflow/core/actions/service/validator'
import { Alert, AlertDescription } from '@dflow/core/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@dflow/core/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@dflow/core/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@dflow/core/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@dflow/core/components/ui/tooltip'
import { databaseOptions } from '@dflow/core/lib/constants'
import { ServiceType } from '@dflow/core/lib/server/resourceCheck'
import { slugify } from '@dflow/core/lib/slugify'
import { Project, Server as ServerType } from '@dflow/core/payload-types'

const formatBytes = (bytes: number, unit: 'MB' | 'GB' = 'MB') => {
  if (unit === 'GB') {
    return `${bytes.toFixed(1)} GB`
  }
  return `${Math.round(bytes)} MB`
}

const ResourceStatusCard = ({
  resourceStatus,
  resourceLoading,
  onRetry,
  serviceType,
}: {
  resourceStatus: any
  resourceLoading: boolean
  onRetry: () => void
  serviceType?: ServiceType
}) => {
  const getLoadingMessage = (type?: ServiceType) => {
    switch (type) {
      case 'app':
        return 'Checking server capacity for app service...'
      case 'docker':
        return 'Checking server capacity for docker service...'
      case 'database':
        return 'Checking server capacity for database service...'
      default:
        return 'Checking server capacity...'
    }
  }

  const getSuccessMessage = (type?: ServiceType) => {
    switch (type) {
      case 'app':
        return 'Server ready for application deployment'
      case 'docker':
        return 'Server ready for Docker container'
      case 'database':
        return 'Server ready for database deployment'
      default:
        return 'Server ready for new service'
    }
  }

  const getWarningMessage = (type?: ServiceType) => {
    switch (type) {
      case 'app':
        return 'Low server resources - monitor app performance after deployment'
      case 'docker':
        return 'Low server resources - monitor container performance'
      case 'database':
        return 'Low server resources - monitor database performance'
      default:
        return 'Low server resources - monitor service performance'
    }
  }

  if (resourceLoading) {
    return (
      <Alert>
        <Loader2 className='h-4 w-4 animate-spin' />
        <AlertDescription>{getLoadingMessage(serviceType)}</AlertDescription>
      </Alert>
    )
  }

  if (!resourceStatus?.data) return null

  const { capable, status } = resourceStatus.data

  if (!status) return null

  // Calculate actual usage values
  const cpuUsage = Math.round(status.cpuUtilization || 0)
  const memoryUsed = status.totalMemoryMB - status.memoryMB
  const memoryUsage = Math.round((memoryUsed / status.totalMemoryMB) * 100)
  const diskUsed = status.totalDiskGB - status.diskGB
  const diskUsage = Math.round((diskUsed / status.totalDiskGB) * 100)

  // Helper function to get usage color
  const getUsageColor = (usage: number) => {
    if (usage >= 80) return 'text-red-500'
    if (usage >= 60) return 'text-yellow-500'
    return 'text-green-500'
  }

  return (
    <Alert variant={capable ? 'default' : 'warning'}>
      {capable ? (
        <CheckCircle2 className='h-4 w-4' />
      ) : (
        <AlertCircle className='h-4 w-4' />
      )}
      <AlertDescription>
        <div className='space-y-3'>
          {/* Status Message */}
          <div className='text-sm font-medium'>
            {capable
              ? getSuccessMessage(serviceType)
              : getWarningMessage(serviceType)}
          </div>

          {/* Quick Overview */}
          <div className='text-muted-foreground flex gap-4 text-xs'>
            <span>
              CPU: <span className={getUsageColor(cpuUsage)}>{cpuUsage}%</span>
            </span>
            <span>
              Memory:{' '}
              <span className={getUsageColor(memoryUsage)}>{memoryUsage}%</span>
            </span>
            <span>
              Disk:{' '}
              <span className={getUsageColor(diskUsage)}>{diskUsage}%</span>
            </span>
            <span>Containers: {status.runningContainers}</span>
          </div>

          <Accordion type='single' collapsible className='w-full'>
            <AccordionItem value='details' className='border-none'>
              <AccordionTrigger className='text-muted-foreground hover:text-foreground py-2 text-xs'>
                View Detailed Breakdown
              </AccordionTrigger>
              <AccordionContent className='pt-2'>
                <div className='space-y-3 text-xs'>
                  {/* CPU Section */}
                  <div className='bg-muted/30 rounded-md p-2'>
                    <div className='mb-1 flex items-center justify-between'>
                      <span className='text-muted-foreground font-medium'>
                        CPU ({status.cpuCores} cores)
                      </span>
                      <span
                        className={`font-semibold ${getUsageColor(cpuUsage)}`}>
                        {cpuUsage}% used
                      </span>
                    </div>
                    <div className='text-muted-foreground flex justify-between text-xs'>
                      <span>Available: {100 - cpuUsage}%</span>
                      <span>Load: {status.cpuLoad.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Memory Section */}
                  <div className='bg-muted/30 rounded-md p-2'>
                    <div className='mb-1 flex items-center justify-between'>
                      <span className='text-muted-foreground font-medium'>
                        Memory
                      </span>
                      <span
                        className={`font-semibold ${getUsageColor(memoryUsage)}`}>
                        {formatBytes(memoryUsed)} used ({memoryUsage}%)
                      </span>
                    </div>
                    <div className='text-muted-foreground flex justify-between text-xs'>
                      <span>Available: {formatBytes(status.memoryMB)}</span>
                      <span>Total: {formatBytes(status.totalMemoryMB)}</span>
                    </div>
                  </div>

                  {/* Storage Section */}
                  <div className='bg-muted/30 rounded-md p-2'>
                    <div className='mb-1 flex items-center justify-between'>
                      <span className='text-muted-foreground font-medium'>
                        Storage
                      </span>
                      <span
                        className={`font-semibold ${getUsageColor(diskUsage)}`}>
                        {formatBytes(diskUsed, 'GB')} used ({diskUsage}%)
                      </span>
                    </div>
                    <div className='text-muted-foreground flex justify-between text-xs'>
                      <span>Available: {formatBytes(status.diskGB, 'GB')}</span>
                      <span>
                        Total: {formatBytes(status.totalDiskGB, 'GB')}
                      </span>
                    </div>
                  </div>

                  {/* Containers Section */}
                  <div className='bg-muted/30 rounded-md p-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground font-medium'>
                        Containers Running
                      </span>
                      <span className='font-semibold'>
                        {status.runningContainers}
                      </span>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Refresh Button */}
          <div>
            <Button
              variant='outline'
              size='sm'
              onClick={onRetry}
              className='h-7 text-xs'>
              <Server className='mr-1 h-3 w-3' />
              Refresh Status
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}

const CreateService = ({
  server,
  project,
  disableCreateButton = false,
  disableReason = 'Cannot create service at this time',
}: {
  server: ServerType
  project: Partial<Project>
  disableCreateButton?: boolean
  disableReason?: string
}) => {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const params = useParams<{ projectId: string; organisation: string }>()
  const { plugins = [] } = server

  const projectName = project.name ? slugify(project.name) : ''

  const {
    execute: checkResources,
    result: resourceStatus,
    isPending: resourceLoading,
  } = useAction(checkServerResourcesAction, {
    onError: () => {
      toast.error('Failed to check server resources')
    },
  })

  const { execute: createService, isPending } = useAction(createServiceAction, {
    onSuccess: ({ data, input }) => {
      if (data?.success) {
        if (data.redirectUrl) {
          router.push(data?.redirectUrl)
        }
        toast.success(`Redirecting to ${input.name} service page...`)
        setOpen(false)
      }
    },
    onError: ({ error }) => {
      toast.error(`Failed to create service: ${error.serverError}`)
    },
  })

  const form = useForm<z.infer<typeof createServiceSchema>>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: '',
      projectId: params.projectId,
    },
  })

  const { type, databaseType } = useWatch({ control: form.control })

  const needsPluginInstallation =
    databaseType &&
    !plugins?.some(
      plugin => plugin.name === databaseType && plugin.status === 'enabled',
    )

  const handleResourceCheck = async (serviceType: ServiceType) => {
    if (!serviceType) return

    checkResources({
      serverId: server.id,
      serviceType,
    })
  }

  const handleTypeChange = (newType: ServiceType) => {
    form.setValue('type', newType)
    handleResourceCheck(newType)
  }

  const handleNameChange = (inputValue: string) => {
    const serviceSpecificName = slugify(inputValue)
    form.setValue('name', serviceSpecificName, {
      shouldValidate: true,
    })
  }

  function onSubmit(values: z.infer<typeof createServiceSchema>) {
    // Commented: Resource capability check - now allows creation regardless of resources
    // if (!resourceStatus?.data?.capable) {
    //   toast.error(
    //     'Please ensure server has sufficient resources before creating service',
    //   )
    //   return
    // }

    // Optional: Show warning toast if resources are low but still proceed
    if (resourceStatus?.data && !resourceStatus.data.capable) {
      toast.warning(
        'Server resources are running low - please monitor performance after deployment',
      )
    }

    createService(values)

    // if (needsPluginInstallation) {
    //   createServiceWithPlugin(values)
    // } else {
    //   createService(values)
    // }
  }

  const createButton = (
    <Button
      disabled={disableCreateButton}
      className='w-full disabled:cursor-not-allowed'>
      {isPending ? (
        <>
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          {needsPluginInstallation ? 'Installing & Creating...' : 'Creating...'}
        </>
      ) : (
        <>
          <Plus className='mr-2 h-4 w-4' />
          Create Service
        </>
      )}
    </Button>
  )

  // Commented: Resource-based form validation - now only checks form validity
  // const isFormValid = resourceStatus?.data?.capable && form.formState.isValid

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={state => {
          setOpen(state)

          if (!state) {
            form.reset()
          }
        }}>
        <DialogTrigger asChild>
          {disableCreateButton ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button disabled={true}>
                      <Plus className='mr-2 h-4 w-4' />
                      Create Service
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{disableReason}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            createButton
          )}
        </DialogTrigger>

        <DialogContent className='sm:max-w-md md:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Create new service</DialogTitle>
            <DialogDescription>
              This will create a new service in the{' '}
              <span className='font-medium'>{project.name}</span> project
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='w-full space-y-6'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <div className='flex'>
                        {projectName && (
                          <div className='border-input bg-muted text-muted-foreground inline-flex items-center rounded-l-md border border-r-0 px-3 text-sm'>
                            {`${projectName}-`}
                          </div>
                        )}
                        <Input
                          placeholder=''
                          {...field}
                          onChange={e => handleNameChange(e.target.value)}
                          className={projectName ? 'rounded-l-none' : ''}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={handleTypeChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select service type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='app'>
                          <div className='flex items-center gap-2'>
                            <Git className='h-4 w-4' />
                            App (Git based application)
                          </div>
                        </SelectItem>
                        <SelectItem value='docker'>
                          <div className='flex items-center gap-2'>
                            <Docker className='h-4 w-4' />
                            Docker
                          </div>
                        </SelectItem>
                        <SelectItem value='database'>
                          <div className='flex items-center gap-2'>
                            <Database className='h-4 w-4' />
                            Database
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {type && (
                <ResourceStatusCard
                  resourceStatus={resourceStatus}
                  resourceLoading={resourceLoading}
                  onRetry={() => handleResourceCheck(type)}
                  serviceType={type}
                />
              )}

              {type === 'database' && (
                <FormField
                  control={form.control}
                  name='databaseType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Database</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select database type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>
                              To deploy database which are disabled, please{' '}
                              <Link
                                href={`/${params.organisation}/dashboard/server/${server.id}?tab=plugins`}
                                className='text-blue-600 underline'>
                                enable appropriate plugin on
                              </Link>{' '}
                              server
                            </SelectLabel>
                          </SelectGroup>
                          {databaseOptions.map(
                            ({ label, value, icon: Icon }) => {
                              const optionDisabled =
                                !plugins ||
                                !plugins.find(
                                  plugin => plugin.name === value,
                                ) ||
                                plugins.find(plugin => plugin.name === value)
                                  ?.status === 'disabled'

                              return (
                                <SelectItem
                                  key={value}
                                  value={value}
                                  // ? We are automatically installing the plugin
                                  // disabled={optionDisabled}
                                >
                                  <div className='flex items-center gap-2'>
                                    <Icon className='h-4 w-4' />
                                    {label}
                                  </div>
                                </SelectItem>
                              )
                            },
                          )}
                        </SelectContent>
                      </Select>
                      {needsPluginInstallation && (
                        <Alert variant={'info'}>
                          <AlertCircle className='h-4 w-4' />
                          <AlertDescription>
                            The {databaseType} plugin will be automatically
                            installed during service deployment.
                          </AlertDescription>
                        </Alert>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Optional description for your service'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Default Resource Limits (only for app/docker) */}
              {(type === 'app' || type === 'docker') && (
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='cpuLimit'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPU Limit</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={
                              server.defaultResourceLimits?.cpu ||
                              'e.g. 500m, 1, 2'
                            }
                            defaultValue={
                              server.defaultResourceLimits?.cpu || ''
                            }
                          />
                        </FormControl>
                        <p className='text-muted-foreground text-xs'>
                          Default:{' '}
                          {server.defaultResourceLimits?.cpu || 'Not set'} (from
                          server settings)
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='memoryLimit'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Memory Limit</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={
                              server.defaultResourceLimits?.memory ||
                              'e.g. 512M, 1G'
                            }
                            defaultValue={
                              server.defaultResourceLimits?.memory || ''
                            }
                          />
                        </FormControl>
                        <p className='text-muted-foreground text-xs'>
                          Default:{' '}
                          {server.defaultResourceLimits?.memory || 'Not set'}{' '}
                          (from server settings)
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <DialogFooter>
                <Button
                  type='submit'
                  disabled={isPending}
                  isLoading={isPending}>
                  Create Service
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CreateService
