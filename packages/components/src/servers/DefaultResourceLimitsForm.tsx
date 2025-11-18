'use client'

import { Alert, AlertDescription } from '../ui/alert'
import { Button } from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'
import { Separator } from '../ui/separator'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Settings2,
} from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { updateServerResourceLimitsAction } from '@/actions/server'
import { Server } from '@/payload-types'

// Resource constants
const DEFAULT_CPU = '0.5'
const DEFAULT_MEMORY = '512m'

// Validation helpers
const validateAndFormatCpu = (value: string | undefined): string => {
  if (!value) return ''
  const num = parseFloat(value.replace(/[^\d.]/g, ''))
  return isNaN(num) ? '' : num.toFixed(3).replace(/\.?0+$/, '')
}

const validateAndFormatMemory = (value: string | undefined): string => {
  if (!value) return ''
  const match = value.match(/^(\d*\.?\d*)([bkmg]?)$/i)
  if (!match) return ''

  const [, numStr, unit] = match
  const normalizedUnit = unit.toLowerCase() || 'm'
  const num = parseFloat(numStr)

  return isNaN(num)
    ? ''
    : `${Number.isInteger(num) ? num : num.toFixed(2)}${normalizedUnit}`
}

// Normalization helpers
const normalizeCpuValue = (value: string | undefined): string => {
  if (!value) return ''
  if (value.endsWith('m')) {
    const millicores = parseFloat(value.slice(0, -1))
    return isNaN(millicores) ? value : (millicores / 1000).toString()
  }
  return value
}

const normalizeMemoryValue = (value: string | undefined): string => {
  return value?.toLowerCase().replace(/[^0-9bkmg.]/g, '') || ''
}

// Schema definitions
const cpuSchema = z
  .string()
  .optional()
  .refine(val => !val || (parseFloat(val) > 0 && parseFloat(val) <= 1024), {
    message: 'Must be between 0.001-1024 cores',
  })

const memorySchema = z
  .string()
  .optional()
  .refine(val => !val || /^\d+(\.\d+)?[bkmg]$/.test(val), {
    message: "Must be like '512m' or '1g' with lowercase units",
  })

const schema = z.object({
  cpu: cpuSchema,
  memory: memorySchema,
})

type FormValues = z.infer<typeof schema>

const DefaultResourceLimitsForm = ({ server }: { server: Server }) => {
  const [showDocs, setShowDocs] = useState(false)
  const isServerConnected = server.connection?.status === 'success'

  // Memoize initial values to prevent unnecessary recalculations
  const initialValues = useMemo(
    () => ({
      cpu: normalizeCpuValue(server.defaultResourceLimits?.cpu || ''),
      memory: normalizeMemoryValue(server.defaultResourceLimits?.memory || ''),
    }),
    [server.defaultResourceLimits],
  )

  // Form initialization
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  })

  // Action handling
  const { execute, status } = useAction(updateServerResourceLimitsAction, {
    onSuccess: () => {
      toast.success('Resource limits updated!')
      // Update form defaults to current values
      form.reset(form.getValues())
    },
    onError: error => {
      console.error('Failed to update resource limits:', error)
      toast.error('Failed to update resource limits', {
        description: error?.error?.serverError,
      })
    },
  })

  // Reset form when server data changes
  useEffect(() => {
    form.reset(initialValues)
  }, [initialValues, form])

  // Derived states
  const isPending = status === 'executing'
  const currentValues = form.watch()
  const hasChanges = form.formState.isDirty
  const isAtSystemDefaults =
    DEFAULT_CPU === initialValues.cpu && DEFAULT_MEMORY === initialValues.memory

  // Handlers
  const handleSubmit = (values: FormValues) => {
    execute({
      id: server.id,
      defaultResourceLimits: {
        cpu: validateAndFormatCpu(values.cpu),
        memory: validateAndFormatMemory(values.memory),
      },
    })
  }

  const handleUndo = () => form.reset(initialValues)
  const handleResetToDefault = () => {
    form.reset({ cpu: DEFAULT_CPU, memory: DEFAULT_MEMORY })
    execute({
      id: server.id,
      defaultResourceLimits: {
        cpu: DEFAULT_CPU,
        memory: DEFAULT_MEMORY,
      },
    })
  }

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Default Resource Limits</CardTitle>
        <CardDescription>
          Set default CPU and Memory limits for new services.
          {!isServerConnected && (
            <span className='mt-1 block text-destructive'>
              Server disconnected - updates disabled
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'>
            {/* Form fields remain the same as before */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='cpu'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default CPU Limit</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          {...field}
                          placeholder='e.g., 0.5'
                          disabled={isPending || !isServerConnected}
                          className='h-10 pl-3 pr-8 font-mono text-sm'
                          onBlur={e => {
                            field.onChange(validateAndFormatCpu(e.target.value))
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
                name='memory'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Memory Limit</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          {...field}
                          placeholder='e.g., 512m'
                          disabled={isPending || !isServerConnected}
                          className='h-10 pl-3 pr-8 font-mono text-sm'
                          onBlur={e => {
                            field.onChange(
                              validateAndFormatMemory(e.target.value),
                            )
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
                onClick={handleUndo}
                disabled={!hasChanges || isPending || !isServerConnected}
                className='gap-2 text-sm'>
                <RotateCcw className='h-4 w-4' />
                <span className='hidden sm:inline'>Undo Changes</span>
              </Button>

              <Button
                type='button'
                variant='destructive'
                size='sm'
                onClick={handleResetToDefault}
                disabled={isAtSystemDefaults || isPending || !isServerConnected}
                className='gap-2 text-sm'>
                <Settings2 className='h-4 w-4' />
                <span className='hidden sm:inline'>Reset to Default</span>
              </Button>

              <Button
                type='submit'
                size='sm'
                disabled={!hasChanges || isPending || !isServerConnected}
                className='min-w-[120px] gap-2 text-sm'>
                {isPending ? (
                  <>
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                    Saving...
                  </>
                ) : (
                  <>
                    <Settings2 className='h-4 w-4' />
                    Save Limits
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>

        <Separator className='my-4' />

        {/* Collapsible Documentation Section */}
        <Collapsible open={showDocs} onOpenChange={setShowDocs}>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h4 className='text-sm font-semibold'>Resource Formats</h4>
              <CollapsibleTrigger asChild>
                <Button variant='ghost' size='sm'>
                  {showDocs ? (
                    <>
                      Hide <ChevronUp className='ml-1 h-4 w-4' />
                    </>
                  ) : (
                    <>
                      Show Details <ChevronDown className='ml-1 h-4 w-4' />
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent className='space-y-4'>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* CPU Documentation */}
                <div className='space-y-2 text-sm text-muted-foreground'>
                  <div>
                    <strong>CPU (Fractional cores only):</strong>
                    <ul className='ml-4 mt-1 list-disc'>
                      <li>
                        Half core:{' '}
                        <code className='rounded bg-muted px-1 font-mono text-xs'>
                          0.5
                        </code>
                      </li>
                      <li>
                        One core:{' '}
                        <code className='rounded bg-muted px-1 font-mono text-xs'>
                          1.0
                        </code>
                      </li>
                      <li className='text-destructive'>
                        Millicores (500m) are NOT supported
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Memory Documentation */}
                <div className='space-y-2 text-sm text-muted-foreground'>
                  <div>
                    <strong>Memory (Lowercase units only):</strong>
                    <ul className='ml-4 mt-1 list-disc'>
                      <li>
                        Megabytes:{' '}
                        <code className='rounded bg-muted px-1 font-mono text-xs'>
                          512m
                        </code>
                      </li>
                      <li>
                        Gigabytes:{' '}
                        <code className='rounded bg-muted px-1 font-mono text-xs'>
                          1g
                        </code>
                      </li>
                      <li className='text-destructive'>
                        Binary units (Mi, Gi) are NOT supported
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <Alert className='mt-4' variant='destructive'>
                <AlertTriangle className='h-4 w-4' />
                <AlertDescription>
                  <strong>Critical Configuration Rules:</strong>
                  <ul className='mt-2 list-disc pl-5'>
                    <li>
                      CPU must be fractional cores ONLY (e.g., 0.5, not 500m)
                    </li>
                    <li>Memory must use lowercase units ONLY (m, g)</li>
                    <li>
                      Uppercase units, binary units, or extra characters will
                      cause failures
                    </li>
                    <li>
                      Invalid formats will prevent proper service configuration
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </CardContent>
    </Card>
  )
}

export default DefaultResourceLimitsForm
