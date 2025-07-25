'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertTriangle,
  ArrowUp,
  BarChart3,
  BookOpen,
  Clock,
  Cog,
  Cpu,
  Globe,
  Loader2,
  RotateCcw,
  Settings2,
  Shield,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  clearServiceResourceLimitAction,
  clearServiceResourceReserveAction,
  scaleServiceAction,
  setServiceResourceLimitAction,
  setServiceResourceReserveAction,
} from '@/actions/service'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Service } from '@/payload-types'

type ScalingTabProps = {
  service: Service
  scale: Record<string, number>
  resource: Record<string, any>
  reservations?: Record<string, any>
}

const ScalingTab = ({
  service,
  scale,
  resource,
  reservations = {},
}: ScalingTabProps) => {
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const processTypes = Object.keys(scale)

  const createResourceSchema = () => {
    const schemaFields: Record<string, z.ZodTypeAny> = {}

    const cpuSchema = z
      .string()
      .optional()
      .refine(
        val => {
          if (!val) return true
          return /^(\d+\.?\d*m?|\d+\.?\d*)$/.test(val)
        },
        {
          message: "CPU must be in format like '100m', '1000m', '1', or '2.5'",
        },
      )

    const memorySchema = z
      .string()
      .optional()
      .refine(
        val => {
          if (!val) return true
          return /^(\d+\.?\d*(Mi|Gi|Ki|M|G|K)?)$/.test(val)
        },
        {
          message: "Memory must be in format like '512Mi', '1Gi', '100M'",
        },
      )

    processTypes.forEach(proc => {
      schemaFields[`cpu_${proc}`] = cpuSchema
      schemaFields[`memory_${proc}`] = memorySchema
    })

    return z.object(schemaFields)
  }

  const createScalingSchema = () => {
    const schemaFields: Record<string, z.ZodNumber> = {}
    processTypes.forEach(proc => {
      schemaFields[`scale_${proc}`] = z.number().min(0).max(100)
    })
    return z.object(schemaFields)
  }

  const scalingForm = useForm<z.infer<ReturnType<typeof createScalingSchema>>>({
    resolver: zodResolver(createScalingSchema()),
    defaultValues: processTypes.reduce(
      (acc, proc) => {
        acc[`scale_${proc}`] = scale[proc] ?? 0
        return acc
      },
      {} as Record<string, number>,
    ),
  })

  const resourceForm = useForm<
    z.infer<ReturnType<typeof createResourceSchema>>
  >({
    resolver: zodResolver(createResourceSchema()),
    defaultValues: processTypes.reduce(
      (acc, proc) => {
        acc[`cpu_${proc}`] = resource[proc]?.limit?.cpu ?? ''
        acc[`memory_${proc}`] = resource[proc]?.limit?.memory ?? ''
        return acc
      },
      {} as Record<string, string>,
    ),
  })

  const reservationForm = useForm<
    z.infer<ReturnType<typeof createResourceSchema>>
  >({
    resolver: zodResolver(createResourceSchema()),
    defaultValues: processTypes.reduce(
      (acc, proc) => {
        acc[`cpu_${proc}`] = resource[proc]?.reserve?.cpu ?? ''
        acc[`memory_${proc}`] = resource[proc]?.reserve?.memory ?? ''
        return acc
      },
      {} as Record<string, string>,
    ),
  })

  const handleScaleSubmit = async (proc: string) => {
    const isValid = await scalingForm.trigger(`scale_${proc}`)
    if (!isValid) return

    const replicas = scalingForm.getValues(`scale_${proc}`)

    setLoading(prev => ({ ...prev, [`scale-${proc}`]: true }))
    try {
      await scaleServiceAction({
        id: service.id,
        scaleArgs: [`${proc}=${replicas}`],
      })
      toast.success(`Scaling updated for ${proc}`)
    } catch (error) {
      toast.error(`Failed to update scaling ${error}`)
    } finally {
      setLoading(prev => ({ ...prev, [`scale-${proc}`]: false }))
    }
  }

  const handleResourceSubmit = async (proc: string) => {
    const isValid = await resourceForm.trigger([
      `cpu_${proc}`,
      `memory_${proc}`,
    ])
    if (!isValid) return

    const cpu = resourceForm.getValues(`cpu_${proc}`)
    const memory = resourceForm.getValues(`memory_${proc}`)
    const args = []
    if (cpu) args.push(`--cpu ${cpu}`)
    if (memory) args.push(`--memory ${memory}`)

    if (args.length === 0) {
      toast.error('Please enter at least one resource value')
      return
    }

    setLoading(prev => ({ ...prev, [`resource-${proc}`]: true }))
    try {
      await setServiceResourceLimitAction({
        id: service.id,
        resourceArgs: args,
        processType: proc,
      })
      toast.success(`Resource limits updated for ${proc}`)
    } catch (error) {
      toast.error('Failed to update resource limits')
    } finally {
      setLoading(prev => ({ ...prev, [`resource-${proc}`]: false }))
    }
  }

  const handleReservationSubmit = async (proc: string) => {
    const isValid = await reservationForm.trigger([
      `cpu_${proc}`,
      `memory_${proc}`,
    ])
    if (!isValid) return

    const cpu = reservationForm.getValues(`cpu_${proc}`)
    const memory = reservationForm.getValues(`memory_${proc}`)
    const args = []
    if (cpu) args.push(`--cpu ${cpu}`)
    if (memory) args.push(`--memory ${memory}`)

    if (args.length === 0) {
      toast.error('Please enter at least one reservation value')
      return
    }

    setLoading(prev => ({ ...prev, [`reservation-${proc}`]: true }))
    try {
      await setServiceResourceReserveAction({
        id: service.id,
        resourceArgs: args,
        processType: proc,
      })
      toast.success(`Resource reservations updated for ${proc}`)
    } catch (error) {
      toast.error('Failed to update resource reservations')
    } finally {
      setLoading(prev => ({ ...prev, [`reservation-${proc}`]: false }))
    }
  }

  // Add loading state for clear actions
  const [clearLoading, setClearLoading] = useState<Record<string, boolean>>({})

  // Handler for clearing resource limits
  const handleResourceLimitClear = async (proc: string) => {
    setClearLoading(prev => ({ ...prev, [`limit-${proc}`]: true }))
    try {
      await clearServiceResourceLimitAction({
        id: service.id,
        processType: proc,
      })
      toast.success(`Resource limits cleared for ${proc}`)
    } catch (error) {
      toast.error('Failed to clear resource limits')
    } finally {
      setClearLoading(prev => ({ ...prev, [`limit-${proc}`]: false }))
    }
  }

  // Handler for clearing resource reservations
  const handleResourceReserveClear = async (proc: string) => {
    setClearLoading(prev => ({ ...prev, [`reserve-${proc}`]: true }))
    try {
      await clearServiceResourceReserveAction({
        id: service.id,
        processType: proc,
      })
      toast.success(`Resource reservations cleared for ${proc}`)
    } catch (error) {
      toast.error('Failed to clear resource reservations')
    } finally {
      setClearLoading(prev => ({ ...prev, [`reserve-${proc}`]: false }))
    }
  }

  const getProcessTypeDisplay = (proc: string) => {
    switch (proc) {
      case 'web':
        return {
          name: 'Web Server',
          icon: Globe,
          color: 'bg-blue-500/10 text-blue-400',
        }
      case 'worker':
        return {
          name: 'Background Worker',
          icon: Cog,
          color: 'bg-green-500/10 text-green-400',
        }
      case 'scheduler':
        return {
          name: 'Scheduler',
          icon: Clock,
          color: 'bg-purple-500/10 text-purple-400',
        }
      default:
        return {
          name: proc.charAt(0).toUpperCase() + proc.slice(1),
          icon: Settings2,
          color: 'bg-gray-500/10 text-gray-400',
        }
    }
  }

  // Helper to get initial values for a process type
  const getInitialScale = (proc: string) => scale[proc] ?? 0
  const getInitialLimitCpu = (proc: string) => resource[proc]?.limit?.cpu ?? ''
  const getInitialLimitMemory = (proc: string) =>
    resource[proc]?.limit?.memory ?? ''
  const getInitialReserveCpu = (proc: string) =>
    resource[proc]?.reserve?.cpu ?? ''
  const getInitialReserveMemory = (proc: string) =>
    resource[proc]?.reserve?.memory ?? ''

  // Simple and clean ResourceInputs component with better button clarity

  const ResourceInputs = ({
    form,
    proc,
    type,
    currentData,
    onSubmit,
    loadingKey,
  }: {
    form: any
    proc: string
    type: 'limit' | 'reserve'
    currentData: any
    onSubmit: (proc: string) => void
    loadingKey: string
  }) => {
    const processInfo = getProcessTypeDisplay(proc)
    const IconComponent = processInfo.icon
    const currentCpuRaw = currentData[proc]?.[type]?.cpu
    const currentMemoryRaw = currentData[proc]?.[type]?.memory
    const currentCpu = currentCpuRaw === undefined ? '' : currentCpuRaw
    const currentMemory = currentMemoryRaw === undefined ? '' : currentMemoryRaw

    const clearHandler =
      type === 'limit' ? handleResourceLimitClear : handleResourceReserveClear
    const clearLoadingKey =
      type === 'limit' ? `limit-${proc}` : `reserve-${proc}`
    const hasClearValue =
      type === 'limit'
        ? currentData[proc]?.limit?.cpu || currentData[proc]?.limit?.memory
        : currentData[proc]?.reserve?.cpu || currentData[proc]?.reserve?.memory

    const isFormUnchanged =
      form.watch(`cpu_${proc}`) ===
        (type === 'limit'
          ? getInitialLimitCpu(proc)
          : getInitialReserveCpu(proc)) &&
      form.watch(`memory_${proc}`) ===
        (type === 'limit'
          ? getInitialLimitMemory(proc)
          : getInitialReserveMemory(proc))

    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-md ${processInfo.color}`}>
              <IconComponent className='h-4 w-4' />
            </div>
            <div>
              <Badge variant='secondary' className='font-medium'>
                {processInfo.name}
              </Badge>
              <div className='mt-1 flex items-center gap-3 text-sm text-muted-foreground'>
                <span>
                  CPU:{' '}
                  <span className='font-medium text-foreground'>
                    {currentCpu || 'Not set'}
                  </span>
                </span>
                <span>•</span>
                <span>
                  Memory:{' '}
                  <span className='font-medium text-foreground'>
                    {currentMemory || 'Not set'}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name={`cpu_${proc}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium'>
                  CPU {type === 'limit' ? 'Limit' : 'Reservation'}
                </FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Input
                      {...field}
                      placeholder={
                        type === 'limit' ? 'e.g., 1000m' : 'e.g., 500m'
                      }
                      className='h-10 pl-3 pr-8 font-mono text-sm'
                    />
                    <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground'>
                      cores
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`memory_${proc}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium'>
                  Memory {type === 'limit' ? 'Limit' : 'Reservation'}
                </FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Input
                      {...field}
                      placeholder={
                        type === 'limit' ? 'e.g., 1Gi' : 'e.g., 512Mi'
                      }
                      className='h-10 pl-3 pr-8 font-mono text-sm'
                    />
                    <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground'>
                      MB/GB
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex flex-col gap-2 sm:flex-row sm:justify-end'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => {
              form.resetField(`cpu_${proc}`)
              form.resetField(`memory_${proc}`)
            }}
            disabled={isFormUnchanged}
            className='flex items-center gap-2 text-sm'
            title={`Reset form to original values (CPU: ${type === 'limit' ? getInitialLimitCpu(proc) || 'empty' : getInitialReserveCpu(proc) || 'empty'}, Memory: ${type === 'limit' ? getInitialLimitMemory(proc) || 'empty' : getInitialReserveMemory(proc) || 'empty'})`}>
            <RotateCcw className='h-4 w-4' />
            <span className='hidden sm:inline'>Undo Changes</span>
            <span className='sm:hidden'>Undo</span>
          </Button>

          <Button
            type='button'
            variant='destructive'
            size='sm'
            onClick={() => clearHandler(proc)}
            disabled={clearLoading[clearLoadingKey] || !hasClearValue}
            className='flex items-center gap-2 text-sm'
            title={`Clear saved ${type === 'limit' ? 'limits' : 'reservations'} for ${processInfo.name} (CPU: ${currentCpu || 'none'}, Memory: ${currentMemory || 'none'})`}>
            {clearLoading[clearLoadingKey] ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Trash2 className='h-4 w-4' />
            )}
            <span className='hidden sm:inline'>
              Clear {type === 'limit' ? 'Limits' : 'Reservations'}
            </span>
            <span className='sm:hidden'>Clear</span>
          </Button>

          <Button
            size='sm'
            onClick={() => onSubmit(proc)}
            disabled={loading[loadingKey] || isFormUnchanged}
            className='flex min-w-[120px] items-center gap-2 text-sm'>
            {loading[loadingKey] ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span>Updating...</span>
              </>
            ) : (
              <>
                {type === 'limit' ? (
                  <Settings2 className='h-4 w-4' />
                ) : (
                  <Shield className='h-4 w-4' />
                )}
                <span>Update</span>
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  if (processTypes.length === 0) {
    return (
      <div className='space-y-6'>
        <Alert>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>
            No process types found for this service. Make sure your service is
            properly configured with a Procfile or Dockerfile.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className='space-y-8 pb-12'>
      {/* Horizontal Scaling Section */}
      <Card className='rounded-lg border shadow-sm'>
        <CardHeader className='pb-6'>
          <div className='flex items-center gap-4'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
              <BarChart3 className='h-5 w-5 text-primary' />
            </div>
            <div className='flex-1'>
              <CardTitle className='text-xl font-semibold'>
                Horizontal Scaling
              </CardTitle>
              <p className='mt-1 text-sm text-muted-foreground'>
                Control the number of replicas for each process type
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-4'>
          <Form {...scalingForm}>
            <form className='space-y-4'>
              {processTypes.map((proc, index) => {
                const processInfo = getProcessTypeDisplay(proc)
                const currentScale = scale[proc] ?? 0
                const hasChanges =
                  scalingForm.watch(`scale_${proc}`) !== currentScale
                const IconComponent = processInfo.icon

                return (
                  <div key={proc}>
                    <Card className='rounded-lg border p-4'>
                      <div className='mb-4 flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-md ${processInfo.color}`}>
                            <IconComponent className='h-4 w-4' />
                          </div>
                          <div>
                            <Badge variant='secondary' className='font-medium'>
                              {processInfo.name}
                            </Badge>
                            <div className='mt-1 text-sm text-muted-foreground'>
                              Current:{' '}
                              <span className='font-medium text-foreground'>
                                {currentScale}
                              </span>{' '}
                              replicas
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className='flex items-end gap-4'>
                        <FormField
                          control={scalingForm.control}
                          name={`scale_${proc}`}
                          render={({ field }) => (
                            <FormItem className='flex-1'>
                              <FormLabel className='text-sm font-medium'>
                                Target Replicas
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  min={0}
                                  max={100}
                                  {...field}
                                  value={field.value?.toString() || ''}
                                  onChange={e =>
                                    field.onChange(
                                      parseInt(e.target.value) || 0,
                                    )
                                  }
                                  className='font-mono'
                                  placeholder='0'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            scalingForm.resetField(`scale_${proc}`)
                          }
                          disabled={
                            scalingForm.watch(`scale_${proc}`) ===
                            getInitialScale(proc)
                          }
                          className='flex min-w-[40px] items-center justify-center'
                          title='Reset to initial value'>
                          <RotateCcw className='h-4 w-4' />
                          <span className='hidden sm:inline'>Undo Changes</span>
                          <span className='sm:hidden'>Undo</span>
                        </Button>

                        <Button
                          size='sm'
                          onClick={() => handleScaleSubmit(proc)}
                          disabled={
                            loading[`scale-${proc}`] ||
                            scalingForm.watch(`scale_${proc}`) ===
                              getInitialScale(proc)
                          }
                          className='min-w-[120px]'>
                          {loading[`scale-${proc}`] ? (
                            <>
                              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                              Scaling...
                            </>
                          ) : (
                            <>
                              <ArrowUp className='mr-2 h-4 w-4' />
                              Scale
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>
                    {index < processTypes.length - 1 && (
                      <Separator className='my-4' />
                    )}
                  </div>
                )
              })}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Vertical Scaling Section */}
      <Card className='rounded-lg border shadow-sm'>
        <CardHeader className='pb-6'>
          <div className='flex items-center gap-4'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
              <Cpu className='h-5 w-5 text-primary' />
            </div>
            <div className='flex-1'>
              <CardTitle className='text-xl font-semibold'>
                Vertical Scaling
              </CardTitle>
              <p className='mt-1 text-sm text-muted-foreground'>
                Configure resource allocations for each process type
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Accordion
            type='multiple'
            defaultValue={['limits', 'reservations']}
            className='space-y-4'>
            {/* Resource Limits Accordion */}
            <AccordionItem
              value='limits'
              className='overflow-hidden rounded-lg border'>
              <AccordionTrigger className='bg-muted/30 px-4 py-3 hover:no-underline'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10'>
                    <Settings2 className='h-4 w-4 text-blue-400' />
                  </div>
                  <div className='text-left'>
                    <h3 className='text-lg font-semibold'>Resource Limits</h3>
                    <p className='text-sm text-muted-foreground'>
                      Maximum resources each process can use
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className='space-y-6 px-4 pb-2 pt-4'>
                <Form {...resourceForm}>
                  <form className='space-y-6'>
                    {processTypes.map((proc, index) => (
                      <div key={`limit-${proc}`}>
                        <ResourceInputs
                          form={resourceForm}
                          proc={proc}
                          type='limit'
                          currentData={resource}
                          onSubmit={handleResourceSubmit}
                          loadingKey={`resource-${proc}`}
                        />
                        {index < processTypes.length - 1 && (
                          <Separator className='my-4' />
                        )}
                      </div>
                    ))}
                  </form>
                </Form>
              </AccordionContent>
            </AccordionItem>

            {/* Resource Reservations Accordion */}
            <AccordionItem
              value='reservations'
              className='overflow-hidden rounded-lg border'>
              <AccordionTrigger className='bg-muted/30 px-4 py-3 hover:no-underline'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10'>
                    <Shield className='h-4 w-4 text-green-400' />
                  </div>
                  <div className='text-left'>
                    <h3 className='text-lg font-semibold'>
                      Resource Reservations
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Guaranteed resources for each process
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className='space-y-6 px-4 pb-2 pt-4'>
                <Form {...reservationForm}>
                  <form className='space-y-6'>
                    {processTypes.map((proc, index) => (
                      <div key={`reservation-${proc}`}>
                        <ResourceInputs
                          form={reservationForm}
                          proc={proc}
                          type='reserve'
                          currentData={resource}
                          onSubmit={handleReservationSubmit}
                          loadingKey={`reservation-${proc}`}
                        />
                        {index < processTypes.length - 1 && (
                          <Separator className='my-4' />
                        )}
                      </div>
                    ))}
                  </form>
                </Form>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Enhanced Documentation Section with Resource Tips */}
      <Card className='rounded-lg border shadow-sm'>
        <CardHeader className='pb-6'>
          <div className='flex items-center gap-4'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
              <BookOpen className='h-5 w-5 text-primary' />
            </div>
            <CardTitle className='text-xl font-semibold'>
              Scaling Reference
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2'>
            {/* Horizontal Scaling Card */}
            <div className='rounded-lg border bg-muted/30 p-4'>
              <h4 className='mb-3 flex items-center gap-2 font-semibold'>
                <BarChart3 className='h-4 w-4' />
                Horizontal Scaling
              </h4>
              <p className='text-sm leading-relaxed text-muted-foreground'>
                Increase the number of replicas to handle more traffic. Each
                replica runs independently and shares the load.
              </p>
            </div>

            {/* Resource Limits Card */}
            <div className='rounded-lg border bg-muted/30 p-4'>
              <h4 className='mb-3 flex items-center gap-2 font-semibold'>
                <Cpu className='h-4 w-4' />
                Resource Limits
              </h4>
              <p className='text-sm leading-relaxed text-muted-foreground'>
                Set maximum resources your app can use. If exceeded, the process
                may be terminated or throttled.
              </p>
            </div>

            {/* Resource Reservations Card */}
            <div className='rounded-lg border bg-muted/30 p-4'>
              <h4 className='mb-3 flex items-center gap-2 font-semibold'>
                <Shield className='h-4 w-4' />
                Resource Reservations
              </h4>
              <p className='text-sm leading-relaxed text-muted-foreground'>
                Reserve minimum resources for your app. The scheduler ensures
                these resources are available before deployment.
              </p>
            </div>

            {/* Resource Formats Card */}
            <div className='rounded-lg border bg-muted/30 p-4'>
              <h4 className='mb-3 flex items-center gap-2 font-semibold'>
                <Settings2 className='h-4 w-4' />
                Resource Formats
              </h4>
              <div className='space-y-2 text-sm text-muted-foreground'>
                <div>
                  <strong>CPU:</strong>{' '}
                  <code className='rounded bg-background px-1 font-mono text-xs'>
                    100m
                  </code>
                  ,
                  <code className='rounded bg-background px-1 font-mono text-xs'>
                    1000m
                  </code>
                  ,
                  <code className='rounded bg-background px-1 font-mono text-xs'>
                    1
                  </code>
                  ,
                  <code className='rounded bg-background px-1 font-mono text-xs'>
                    2.5
                  </code>
                </div>
                <div>
                  <strong>Memory:</strong>{' '}
                  <code className='rounded bg-background px-1 font-mono text-xs'>
                    512Mi
                  </code>
                  ,
                  <code className='rounded bg-background px-1 font-mono text-xs'>
                    1Gi
                  </code>
                  ,
                  <code className='rounded bg-background px-1 font-mono text-xs'>
                    2048Mi
                  </code>
                </div>
              </div>
            </div>
          </div>

          <Alert className='mt-4 border-destructive/30 bg-destructive/10'>
            <AlertTriangle className='h-4 w-4 text-destructive' />
            <AlertDescription className='text-destructive'>
              <strong>Important:</strong> Resource changes require redeploying
              your app to take effect. Scaling changes are applied immediately.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

export default ScalingTab
