'use client'

import { Badge } from '../ui/badge'
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
import { useAction } from 'next-safe-action/hooks'
import React, { useState } from 'react'
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
  serverDefaults?: {
    cpu: string
    memory: string
  }
}

const validateAndFormatCpu = (value: string): string => {
  if (!value) return ''
  value = value.replace(/[^\d.]/g, '')
  const num = parseFloat(value)
  return isNaN(num) ? '' : num.toFixed(3).replace(/\.?0+$/, '')
}

const validateAndFormatMemory = (value: string): string => {
  if (!value) return ''
  const match = value.match(/^(\d*\.?\d*)([bkmg]?)$/)
  if (!match) return ''

  let [, numStr, unit] = match
  if (!unit) unit = 'm'

  const num = parseFloat(numStr)
  if (isNaN(num)) return ''

  const formattedNum = Number.isInteger(num) ? num.toString() : num.toFixed(2)
  return `${formattedNum}${unit}`
}

const normalizeCpuValue = (value: string): string => {
  if (!value) return ''
  if (value.endsWith('m')) {
    const millicores = parseFloat(value.slice(0, -1))
    return isNaN(millicores) ? value : (millicores / 1000).toString()
  }
  return value
}

const normalizeMemoryValue = (value: string): string => {
  if (!value) return ''
  return value.toLowerCase().replace(/[^0-9bkmg.]/g, '')
}

const getProcessTypeDisplay = (proc: string) => {
  switch (proc) {
    case 'web':
      return {
        name: 'Web Server',
        icon: Globe,
        color: 'bg-primary/10 text-primary',
      }
    case 'worker':
      return {
        name: 'Background Worker',
        icon: Cog,
        color: 'bg-success/10 text-success',
      }
    case 'scheduler':
      return {
        name: 'Scheduler',
        icon: Clock,
        color: 'bg-secondary/10 text-secondary',
      }
    default:
      return {
        name: proc.charAt(0).toUpperCase() + proc.slice(1),
        icon: Settings2,
        color: 'bg-muted/10 text-muted-foreground',
      }
  }
}

const cpuSchema = z
  .string()
  .optional()
  .refine(
    val =>
      !val ||
      (/^\d*\.?\d+$/.test(val) &&
        parseFloat(val) > 0 &&
        parseFloat(val) <= 1024),
    { message: 'CPU must be fractional cores (e.g., 0.5, 1.0)' },
  )

const memorySchema = z
  .string()
  .optional()
  .refine(val => !val || /^\d+(\.\d+)?[bkmg]?$/.test(val), {
    message: "Memory must be like '512m' or '1g' (lowercase units only)",
  })

const ResourceInputs: React.FC<{
  form: any
  proc: string
  type: 'limit' | 'reserve'
  currentData: any
  actionType: string
  currentLoading: string | null
  onClear: () => void
  onSubmit: () => void
  serverDefaults: { cpu: string; memory: string }
}> = ({
  form,
  proc,
  type,
  currentData,
  actionType,
  currentLoading,
  onClear,
  onSubmit,
  serverDefaults,
}) => {
  const processInfo = getProcessTypeDisplay(proc)
  const IconComponent = processInfo.icon
  const currentCpu = currentData[proc]?.[type]?.cpu || ''
  const currentMemory = currentData[proc]?.[type]?.memory || ''

  const defaultValues = form.formState.defaultValues
  const defaultCpu = defaultValues?.[`cpu_${proc}`] || ''
  const defaultMemory = defaultValues?.[`memory_${proc}`] || ''
  const currentCpuValue = form.watch(`cpu_${proc}`)
  const currentMemoryValue = form.watch(`memory_${proc}`)
  const isFormUnchanged =
    currentCpuValue === defaultCpu && currentMemoryValue === defaultMemory

  const clearLoadingKey = `clear-${type}-${proc}`
  const hasClearValue =
    type === 'limit'
      ? currentData[proc]?.limit?.cpu || currentData[proc]?.limit?.memory
      : currentData[proc]?.reserve?.cpu || currentData[proc]?.reserve?.memory

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
                      type === 'limit'
                        ? serverDefaults.cpu || 'e.g., 0.5'
                        : serverDefaults.cpu || 'e.g., 0.25'
                    }
                    className='h-10 pl-3 pr-8 font-mono text-sm'
                    onBlur={e => {
                      const formatted = validateAndFormatCpu(e.target.value)
                      field.onChange(formatted)
                    }}
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
                      type === 'limit'
                        ? serverDefaults.memory || 'e.g., 512m'
                        : serverDefaults.memory || 'e.g., 256m'
                    }
                    className='h-10 pl-3 pr-8 font-mono text-sm'
                    onBlur={e => {
                      const formatted = validateAndFormatMemory(e.target.value)
                      field.onChange(formatted)
                    }}
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
          className='flex items-center gap-2 text-sm'>
          <RotateCcw className='h-4 w-4' />
          <span className='hidden sm:inline'>Undo Changes</span>
          <span className='sm:hidden'>Undo</span>
        </Button>

        <Button
          type='button'
          variant='destructive'
          size='sm'
          onClick={onClear}
          disabled={currentLoading === clearLoadingKey || !hasClearValue}
          className='flex items-center gap-2 text-sm'>
          {currentLoading === clearLoadingKey ? (
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
          onClick={onSubmit}
          disabled={
            currentLoading === `${actionType}-${proc}` || isFormUnchanged
          }
          className='flex min-w-[120px] items-center gap-2 text-sm'>
          {currentLoading === `${actionType}-${proc}` ? (
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

const ScalingTab = ({
  service,
  scale,
  resource,
  reservations = {},
  serverDefaults = { cpu: '', memory: '' },
}: ScalingTabProps) => {
  const [currentLoading, setCurrentLoading] = useState<string | null>(null)
  const processTypes = Object.keys(scale)

  const createResourceSchema = () => {
    const schemaFields: Record<string, z.ZodTypeAny> = {}
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

  const getScalingDefaults = () =>
    processTypes.reduce(
      (acc, proc) => {
        acc[`scale_${proc}`] = scale[proc] ?? 0
        return acc
      },
      {} as Record<string, number>,
    )

  const getResourceDefaults = () =>
    processTypes.reduce(
      (acc, proc) => {
        acc[`cpu_${proc}`] = normalizeCpuValue(
          resource[proc]?.limit?.cpu || serverDefaults.cpu || '',
        )
        acc[`memory_${proc}`] = normalizeMemoryValue(
          resource[proc]?.limit?.memory || serverDefaults.memory || '',
        )
        return acc
      },
      {} as Record<string, string>,
    )

  const getReservationDefaults = () =>
    processTypes.reduce(
      (acc, proc) => {
        acc[`cpu_${proc}`] = normalizeCpuValue(
          resource[proc]?.reserve?.cpu || serverDefaults.cpu || '',
        )
        acc[`memory_${proc}`] = normalizeMemoryValue(
          resource[proc]?.reserve?.memory || serverDefaults.memory || '',
        )
        return acc
      },
      {} as Record<string, string>,
    )

  const scalingForm = useForm({
    resolver: zodResolver(createScalingSchema()),
    defaultValues: getScalingDefaults(),
  })

  const resourceForm = useForm({
    resolver: zodResolver(createResourceSchema()),
    defaultValues: getResourceDefaults(),
  })

  const reservationForm = useForm({
    resolver: zodResolver(createResourceSchema()),
    defaultValues: getReservationDefaults(),
  })

  const scaleService = useAction(scaleServiceAction, {
    onSuccess: () => {
      const proc = currentLoading?.split('-')[1] || 'process'
      toast.success(`Scaling updated for ${proc}`)
      setCurrentLoading(null)
    },
    onError: ({ error }) => {
      toast.error(
        `Failed to update scaling: ${error.serverError || 'Unknown error'}`,
      )
      setCurrentLoading(null)
    },
  })

  const setResourceLimit = useAction(setServiceResourceLimitAction, {
    onSuccess: () => {
      const proc = currentLoading?.split('-')[1] || 'process'
      toast.success(`Resource limits updated for ${proc}`)
      setCurrentLoading(null)
    },
    onError: ({ error }) => {
      toast.error(
        `Failed to update resource limits: ${error.serverError || 'Unknown error'}`,
      )
      setCurrentLoading(null)
    },
  })

  const setResourceReserve = useAction(setServiceResourceReserveAction, {
    onSuccess: () => {
      const proc = currentLoading?.split('-')[1] || 'process'
      toast.success(`Resource reservations updated for ${proc}`)
      setCurrentLoading(null)
    },
    onError: ({ error }) => {
      toast.error(
        `Failed to update resource reservations: ${error.serverError || 'Unknown error'}`,
      )
      setCurrentLoading(null)
    },
  })

  const clearResourceLimit = useAction(clearServiceResourceLimitAction, {
    onSuccess: () => {
      const proc = currentLoading?.split('-')[2] || 'process'
      toast.success(`Resource limits cleared for ${proc}`)
      setCurrentLoading(null)
    },
    onError: ({ error }) => {
      toast.error(
        `Failed to clear resource limits: ${error.serverError || 'Unknown error'}`,
      )
      setCurrentLoading(null)
    },
  })

  const clearResourceReserve = useAction(clearServiceResourceReserveAction, {
    onSuccess: () => {
      const proc = currentLoading?.split('-')[2] || 'process'
      toast.success(`Resource reservations cleared for ${proc}`)
      setCurrentLoading(null)
    },
    onError: ({ error }) => {
      toast.error(
        `Failed to clear resource reservations: ${error.serverError || 'Unknown error'}`,
      )
      setCurrentLoading(null)
    },
  })

  const handleScaleSubmit = (proc: string) => {
    const replicas = scalingForm.getValues(`scale_${proc}`)
    setCurrentLoading(`scale-${proc}`)
    scaleService.execute({
      id: service.id,
      scaleArgs: [`${proc}=${replicas}`],
    })
  }

  const handleResourceSubmit = (
    proc: string,
    form: any,
    type: 'limit' | 'reserve',
  ) => {
    let cpu = form.getValues(`cpu_${proc}`)
    let memory = form.getValues(`memory_${proc}`)

    cpu = validateAndFormatCpu(cpu)
    memory = validateAndFormatMemory(memory)

    const args = []
    if (cpu) args.push(`--cpu ${cpu}`)
    if (memory) args.push(`--memory ${memory}`)

    if (args.length === 0) {
      toast.error(`Please enter at least one resource value`)
      return
    }

    setCurrentLoading(`${type}-${proc}`)
    const action = type === 'limit' ? setResourceLimit : setResourceReserve
    action.execute({
      id: service.id,
      resourceArgs: args,
      processType: proc,
    })
  }

  const handleResourceLimitClear = (proc: string) => {
    setCurrentLoading(`clear-limit-${proc}`)
    clearResourceLimit.execute({
      id: service.id,
      processType: proc,
    })
  }

  const handleResourceReserveClear = (proc: string) => {
    setCurrentLoading(`clear-reserve-${proc}`)
    clearResourceReserve.execute({
      id: service.id,
      processType: proc,
    })
  }

  if (processTypes.length === 0) {
    return (
      <div className='space-y-6'>
        <Alert variant='destructive'>
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
      <div className='mb-4 flex items-center gap-1.5'>
        <BarChart3 />
        <h4 className='text-lg font-semibold'>Scaling</h4>
      </div>

      {/* Horizontal Scaling Section */}
      <Card className='rounded-lg border shadow-xs'>
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

        <CardContent>
          <Accordion
            type='multiple'
            defaultValue={['scaling']}
            className='space-y-4'>
            <AccordionItem
              value='scaling'
              className='overflow-hidden rounded-lg border'>
              <AccordionTrigger className='bg-muted/30 px-4 py-3 hover:no-underline'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10'>
                    <ArrowUp className='h-4 w-4 text-primary' />
                  </div>
                  <div className='text-left'>
                    <h3 className='text-lg font-semibold'>Process Scaling</h3>
                    <p className='text-sm text-muted-foreground'>
                      Scale the number of replicas for each process
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className='space-y-6 px-4 pb-2 pt-4'>
                <Form {...scalingForm}>
                  <form className='space-y-6'>
                    {processTypes.map((proc, index) => {
                      const processInfo = getProcessTypeDisplay(proc)
                      const currentScale = scale[proc] ?? 0
                      const IconComponent = processInfo.icon
                      const initialScale = scale[proc] ?? 0

                      return (
                        <div key={proc}>
                          <div className='mb-4 flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-md ${processInfo.color}`}>
                                <IconComponent className='h-4 w-4' />
                              </div>
                              <div>
                                <Badge
                                  variant='secondary'
                                  className='font-medium'>
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
                                initialScale
                              }
                              className='flex min-w-[40px] items-center justify-center'
                              title='Reset to initial value'>
                              <RotateCcw className='h-4 w-4' />
                              <span className='hidden sm:inline'>
                                Undo Changes
                              </span>
                              <span className='sm:hidden'>Undo</span>
                            </Button>

                            <Button
                              size='sm'
                              onClick={() => handleScaleSubmit(proc)}
                              disabled={
                                currentLoading === `scale-${proc}` ||
                                scalingForm.watch(`scale_${proc}`) ===
                                  initialScale
                              }
                              className='min-w-[120px]'>
                              {currentLoading === `scale-${proc}` ? (
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
                          {index < processTypes.length - 1 && (
                            <Separator className='my-4' />
                          )}
                        </div>
                      )
                    })}
                  </form>
                </Form>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Vertical Scaling Section */}
      <Card className='rounded-lg border shadow-xs'>
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
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10'>
                    <Settings2 className='h-4 w-4 text-primary' />
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
                          actionType='limit'
                          currentLoading={currentLoading}
                          onClear={() => handleResourceLimitClear(proc)}
                          onSubmit={() =>
                            handleResourceSubmit(proc, resourceForm, 'limit')
                          }
                          serverDefaults={serverDefaults}
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
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-success/10'>
                    <Shield className='h-4 w-4 text-success' />
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
                          actionType='reserve'
                          currentLoading={currentLoading}
                          onClear={() => handleResourceReserveClear(proc)}
                          onSubmit={() =>
                            handleResourceSubmit(
                              proc,
                              reservationForm,
                              'reserve',
                            )
                          }
                          serverDefaults={serverDefaults}
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

      {/* Documentation Section */}
      <Card className='rounded-lg border shadow-xs'>
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

            <div className='rounded-lg border bg-muted/30 p-4'>
              <h4 className='mb-3 flex items-center gap-2 font-semibold'>
                <Settings2 className='h-4 w-4' />
                Resource Formats
              </h4>
              <div className='space-y-2 text-sm text-muted-foreground'>
                <div>
                  <strong>CPU (REQUIRED):</strong>
                  <ul className='ml-4 list-disc'>
                    <li>
                      Fractional cores only:{' '}
                      <code className='rounded bg-background px-1 font-mono text-xs'>
                        0.5
                      </code>
                    </li>
                    <li>
                      1 core = 1000m, but must be entered as{' '}
                      <code className='rounded bg-background px-1 font-mono text-xs'>
                        1.0
                      </code>
                    </li>
                    <li className='text-destructive'>
                      Millicores (500m) are NOT supported
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>Memory (REQUIRED):</strong>
                  <ul className='ml-4 list-disc'>
                    <li>
                      Megabytes:{' '}
                      <code className='rounded bg-background px-1 font-mono text-xs'>
                        512m
                      </code>
                    </li>
                    <li>
                      Gigabytes:{' '}
                      <code className='rounded bg-background px-1 font-mono text-xs'>
                        1g
                      </code>
                    </li>
                    <li className='text-destructive'>
                      Use lowercase units only
                    </li>
                    <li className='text-destructive'>
                      Binary units (Mi, Gi) are NOT supported
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <Alert className='mt-4' variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              <strong>Critical Configuration Rules:</strong>
              <ul className='mt-2 list-disc pl-5'>
                <li>CPU must be fractional cores ONLY (e.g., 0.5, not 500m)</li>
                <li>Memory must use lowercase units ONLY (m, g)</li>
                <li>
                  Uppercase units, binary units, or extra characters will cause
                  failures
                </li>
                <li>Invalid formats will prevent deployments</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

export default ScalingTab
