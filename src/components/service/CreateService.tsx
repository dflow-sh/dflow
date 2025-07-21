'use client'

import {
  Docker,
  Git,
  MariaDB,
  MongoDB,
  MySQL,
  PostgreSQL,
  Redis,
} from '../icons'
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
import { Fragment, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  checkServerResourcesAction,
  createServiceAction,
} from '@/actions/service'
import { createServiceSchema } from '@/actions/service/validator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ServiceType } from '@/lib/server/resourceCheck'
import { slugify } from '@/lib/slugify'
import { Server as ServerType } from '@/payload-types'

const databaseOptions = [
  {
    label: 'Postgres',
    value: 'postgres',
    icon: PostgreSQL,
  },
  {
    label: 'MongoDB',
    value: 'mongo',
    icon: MongoDB,
  },
  {
    label: 'MySQL',
    value: 'mysql',
    icon: MySQL,
  },
  {
    label: 'MariaDB',
    value: 'mariadb',
    icon: MariaDB,
  },
  {
    label: 'Redis',
    value: 'redis',
    icon: Redis,
  },
]

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
        return 'Server status for application deployment'
      case 'docker':
        return 'Server status for Docker container'
      case 'database':
        return 'Server status for database deployment'
      default:
        return 'Server status for new service'
    }
  }

  // Changed: Show warning message instead of blocking message
  const getWarningMessage = (type?: ServiceType) => {
    switch (type) {
      case 'app':
        return 'Server resources are running low - monitor performance after deployment'
      case 'docker':
        return 'Server resources are running low - monitor container performance'
      case 'database':
        return 'Server resources are running low - monitor database performance'
      default:
        return 'Server resources are running low - monitor service performance'
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

  const cpuUsage = Math.round((status.cpuLoad || 0) * 100)
  const memoryUsed = status.totalMemoryMB - status.memoryMB
  const memoryUsage = Math.round((memoryUsed / status.totalMemoryMB) * 100)
  const diskUsed = status.totalDiskGB - status.diskGB
  const diskUsage = Math.round((diskUsed / status.totalDiskGB) * 100)

  return (
    <Alert variant={capable ? 'default' : 'warning'}>
      {capable ? (
        <CheckCircle2 className='h-4 w-4' />
      ) : (
        <AlertCircle className='h-4 w-4' />
      )}
      <AlertDescription>
        <div className='space-y-3'>
          <div className='font-medium'>
            {capable
              ? getSuccessMessage(serviceType)
              : getWarningMessage(serviceType)}
          </div>

          <div className='space-y-2 text-sm'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>
                CPU ({status.cpuCores} cores)
              </span>
              <span>{cpuUsage}%</span>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Memory</span>
              <span>
                {formatBytes(memoryUsed)} / {formatBytes(status.totalMemoryMB)}
              </span>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Disk</span>
              <span>
                {formatBytes(diskUsed, 'GB')} /{' '}
                {formatBytes(status.totalDiskGB, 'GB')}
              </span>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Containers</span>
              <span>{status.runningContainers}</span>
            </div>
          </div>

          {/* Changed: Always show refresh button, regardless of capability */}
          <div className='flex items-center gap-2 pt-1'>
            <Button variant='outline' size='sm' onClick={onRetry}>
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
  project: { name: string }
  disableCreateButton?: boolean
  disableReason?: string
}) => {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const params = useParams<{ id: string; organisation: string }>()
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

  const { execute, isPending } = useAction(createServiceAction, {
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
      projectId: params.id,
    },
  })

  const { type } = useWatch({ control: form.control })

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

    execute(values)
  }

  const createButton = (
    <Button
      disabled={disableCreateButton}
      className='disabled:cursor-not-allowed'>
      <Plus className='mr-2' />
      Create Service
    </Button>
  )

  // Commented: Resource-based form validation - now only checks form validity
  // const isFormValid = resourceStatus?.data?.capable && form.formState.isValid
  const isFormValid = form.formState.isValid
  const submitDisabled = isPending || !isFormValid

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
        {disableCreateButton ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>{createButton}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{disableReason}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <DialogTrigger asChild>{createButton}</DialogTrigger>
        )}

        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Create new service</DialogTitle>
            <DialogDescription className='sr-only'>
              This will create a new service
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
                    <div className='space-y-2'>
                      <p className='text-sm text-gray-500'>
                        Service will be named:{' '}
                        <span className='font-semibold'>{projectName}-</span>
                        <span className='italic'>[your-input]</span>
                      </p>

                      <FormControl>
                        <div className='grid grid-cols-[auto_1fr]'>
                          {projectName && (
                            <div className='flex h-full items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-muted-foreground'>
                              {`${projectName}-`}
                            </div>
                          )}

                          <Input
                            {...field}
                            value={field.value.replace(`${projectName}-`, '')}
                            onChange={e => handleNameChange(e.target.value)}
                            className={projectName ? 'rounded-l-none' : ''}
                          />
                        </div>
                      </FormControl>
                    </div>
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
                          <SelectValue placeholder='Select a type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='app'>
                          <div className='flex items-center gap-1.5'>
                            <Git className='size-4' />
                            App (Git based application)
                          </div>
                        </SelectItem>

                        <SelectItem value='docker'>
                          <div className='flex items-center gap-1.5'>
                            <Docker className='size-4 text-blue-500' />
                            Docker
                          </div>
                        </SelectItem>

                        <SelectItem value='database'>
                          <div className='flex items-center gap-1.5'>
                            <Database size={16} className='text-blue-500' />
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
                            <SelectValue placeholder='Select a type' />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel className='mb-2 inline-block w-[calc(var(--radix-select-trigger-width)-16px)] text-wrap font-normal'>
                              To deploy database which are disabled, please
                              enable appropriate plugin on{' '}
                              <Link
                                className='text-primary underline'
                                href={`/${params.organisation}/servers/${server.id}?tab=plugins`}>
                                server
                              </Link>
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
                                <Fragment key={value}>
                                  <SelectItem
                                    value={value}
                                    disabled={optionDisabled}>
                                    <span className='flex gap-2'>
                                      <Icon className='size-5' />
                                      {label}
                                    </span>
                                  </SelectItem>
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
              )}

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
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
                        <p className='text-xs text-muted-foreground'>
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
                        <p className='text-xs text-muted-foreground'>
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
                  disabled={submitDisabled}
                  isLoading={isPending}>
                  {/* Commented: Resource-based button text - now always shows "Create Service" */}
                  {/* {!resourceStatus?.data?.capable && type
                    ? 'Server Not Ready'
                    : 'Create Service'} */}
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
