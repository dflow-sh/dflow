'use client'

import Loader from '../Loader'
import SidebarToggleButton from '../SidebarToggleButton'
import { MariaDB, MongoDB, MySQL, PostgreSQL, Redis } from '../icons'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { Braces, Globe, KeyRound, Plus, Trash2 } from 'lucide-react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useAction } from 'next-safe-action/hooks'
import {
  Fragment,
  JSX,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  UseFieldArrayRemove,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { getProjectDatabasesAction } from '@/actions/project'
import { updateServiceAction } from '@/actions/service'
import { updateServiceSchema } from '@/actions/service/validator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Service } from '@/payload-types'
import { useDisableDeploymentContext } from '@/providers/DisableDeployment'

const variants = {
  visible: { opacity: 1, scale: 1 },
  hidden: { opacity: 0, scale: 0.5 },
}

type StatusType = NonNullable<NonNullable<Service['databaseDetails']>['type']>

const databaseIcons: {
  [key in StatusType]: JSX.Element
} = {
  postgres: <PostgreSQL className='size-6' />,
  mariadb: <MariaDB className='size-6' />,
  mongo: <MongoDB className='size-6' />,
  mysql: <MySQL className='size-6' />,
  redis: <Redis className='size-6' />,
}

const ReferenceVariableDropdown = ({
  gettingDatabases,
  databaseList: list = [],
  index,
  serviceName,
}: {
  databaseList: Service[]
  gettingDatabases: boolean
  index: number | string
  serviceName: string
}) => {
  const { setValue } = useFormContext()
  const publicDomain = `{{ ${serviceName}.DFLOW_PUBLIC_DOMAIN }}`
  const secretKey = `{{ secret(64, "abcdefghijklMNOPQRSTUVWXYZ") }}`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type='button'
          className='absolute right-2 top-1.5 h-6 w-6 rounded-sm'
          size='icon'
          variant='outline'>
          <Braces className='!h-3 !w-3' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className='pb-2' align='end'>
        <DropdownMenuLabel>Reference Variables</DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={() => {
            setValue(`variables.${index}.value`, publicDomain)
          }}>
          <Globe className='size-6 text-green-600' />
          {publicDomain}
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => {
            setValue(`variables.${index}.value`, secretKey)
          }}>
          <KeyRound className='size-6 text-blue-500' />
          {secretKey}
        </DropdownMenuItem>

        {gettingDatabases && (
          <DropdownMenuItem disabled>
            <Loader className='h-min w-min' />
            Fetching databases...
          </DropdownMenuItem>
        )}

        {list.length && !gettingDatabases
          ? list.map(database => {
              const { deployments, databaseDetails } = database
              const exposedPorts = databaseDetails?.exposedPorts ?? []

              const disabled =
                typeof deployments?.docs?.find(deployment => {
                  return (
                    typeof deployment === 'object' &&
                    deployment?.status === 'success'
                  )
                }) === 'undefined'

              const environmentVariableValue = `${database.name}.${database.databaseDetails?.type?.toUpperCase()}`

              return (
                <Fragment key={database.id}>
                  <DropdownMenuItem
                    disabled={disabled}
                    onSelect={() => {
                      setValue(
                        `variables.${index}.value`,
                        `{{ ${environmentVariableValue}_URI }}`,
                      )
                    }}>
                    {database.databaseDetails?.type &&
                      databaseIcons[database.databaseDetails?.type]}

                    {`{{ ${environmentVariableValue}_URI }} ${disabled ? '(not-deployed)' : ''}`}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    disabled={!exposedPorts.length}
                    onSelect={() => {
                      setValue(
                        `variables.${index}.value`,
                        `{{ ${environmentVariableValue}_PUBLIC_URI }}`,
                      )
                    }}>
                    {database.databaseDetails?.type &&
                      databaseIcons[database.databaseDetails?.type]}

                    {`{{ ${environmentVariableValue}_PUBLIC_URI }} ${disabled ? '(not-deployed)' : ''}`}
                  </DropdownMenuItem>
                </Fragment>
              )
            })
          : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const CopyToClipboard = ({
  message = '',
  id,
  parsedValues,
}: {
  message?: string
  id: number
  parsedValues: Record<string, string>
}) => {
  const [copying, setCopying] = useState(false)
  const { control } = useFormContext()
  const key = useWatch({
    control,
    name: `variables.${id}.key`,
  })

  const populatedValue = parsedValues?.[key] ?? ''

  const copyToClipboard = () => {
    setCopying(true)
    navigator.clipboard.writeText(populatedValue).then(
      () => {
        if (message) {
          toast.success(message)
        }
      },
      err => {
        console.error(err)
      },
    )

    setTimeout(() => {
      setCopying(false)
    }, 1000)
  }

  return (
    <MotionConfig transition={{ duration: 0.15 }}>
      <Button
        type='button'
        className='absolute right-10 top-1.5 h-6 w-6 rounded-sm'
        size='icon'
        variant='outline'
        onClick={() => {
          if (copying) {
            return
          }

          copyToClipboard()
        }}>
        <AnimatePresence initial={false} mode='wait'>
          {copying ? (
            <motion.div
              animate='visible'
              exit='hidden'
              initial='hidden'
              key='check'
              variants={variants}>
              <svg
                viewBox='0 0 24 24'
                width='14'
                height='14'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
                fill='none'
                shapeRendering='geometricPrecision'>
                <path d='M20 6L9 17l-5-5'></path>
              </svg>
            </motion.div>
          ) : (
            <motion.div
              animate='visible'
              exit='hidden'
              initial='hidden'
              key='copy'
              variants={variants}>
              <svg
                viewBox='0 0 24 24'
                width='14'
                height='14'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
                fill='none'
                shapeRendering='geometricPrecision'>
                <path d='M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z'></path>
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </MotionConfig>
  )
}

const KeyValuePair = memo(
  ({
    id,
    serviceName,
    removeVariable,
    parsedValues,
    databaseList,
    gettingDatabases,
  }: {
    id: number
    serviceName: string
    removeVariable: UseFieldArrayRemove
    parsedValues: Record<string, string>
    databaseList: Service[]
    gettingDatabases: boolean
  }) => {
    const { control } = useFormContext()

    return (
      <div className='grid grid-cols-[1fr_1fr_2.5rem] gap-4'>
        <FormField
          control={control}
          name={`variables.${id}.key`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`variables.${id}.value`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className='relative'>
                  <Input {...field} className='pr-[4.4rem]' />

                  <CopyToClipboard
                    message={`Copied ${field.value} variable`}
                    id={id}
                    parsedValues={parsedValues}
                  />

                  <ReferenceVariableDropdown
                    index={id}
                    databaseList={databaseList}
                    gettingDatabases={gettingDatabases}
                    serviceName={serviceName}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          variant='ghost'
          type='button'
          size='icon'
          onClick={() => {
            removeVariable(+id)
          }}>
          <Trash2 className='text-destructive' />
        </Button>
      </div>
    )
  },
)

KeyValuePair.displayName = 'KeyValuePair'

const VariablesForm = ({ service }: { service: Service }) => {
  const restartRef = useRef(false)
  const { setDisable: disableDeployment } = useDisableDeploymentContext()
  const defaultPopulatedVariables = service?.populatedVariables ?? '{}'
  const parsedValues = useMemo(
    () => JSON.parse(defaultPopulatedVariables),
    [defaultPopulatedVariables],
  )

  const {
    execute: saveEnvironmentVariables,
    isPending: savingEnvironmentVariables,
  } = useAction(updateServiceAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.info('Added updating environment-variables to queue', {
          description: 'Restart service to apply changes',
          duration: 5000,
        })
      }
    },
    onError: ({ error }) => {
      toast.error(
        `Failed to update environment variables: ${error?.serverError}`,
      )
    },
  })

  const {
    execute: getDatabases,
    isPending: gettingDatabases,
    result: databaseList,
    hasSucceeded,
  } = useAction(getProjectDatabasesAction)

  const form = useForm<z.infer<typeof updateServiceSchema>>({
    resolver: zodResolver(updateServiceSchema),
    defaultValues: {
      id: service.id,
      variables:
        Array.isArray(service.variables) && service.variables.length
          ? service.variables
          : [
              {
                key: '',
                value: '',
              },
            ],
    },
  })

  useEffect(() => {
    if (!hasSucceeded) {
      getDatabases({
        id:
          typeof service.project === 'string'
            ? service.project
            : service.project.id,
      })
    }
  }, [])

  const {
    fields,
    append: appendVariable,
    remove: removeVariable,
  } = useFieldArray({
    control: form.control,
    name: 'variables',
  })

  const handleSubmit = (values: z.infer<typeof updateServiceSchema>) => {
    saveEnvironmentVariables({
      ...values,
      restartServiceOnEnvironmentVariablesUpdate: restartRef.current,
    })
    disableDeployment(true)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className='w-full space-y-6'>
        <div className='space-y-2'>
          {fields.length ? (
            <div className='grid grid-cols-[1fr_1fr_2.5rem] gap-4 text-sm text-muted-foreground'>
              <p className='font-semibold'>Key</p>
              <p className='font-semibold'>
                Value{' '}
                <SidebarToggleButton
                  directory='services'
                  fileName='environment-variables'
                />
              </p>
            </div>
          ) : null}

          {fields.map((field, index) => {
            return (
              <KeyValuePair
                key={index}
                id={index}
                databaseList={databaseList?.data ?? []}
                gettingDatabases={gettingDatabases}
                parsedValues={parsedValues}
                removeVariable={removeVariable}
                serviceName={service.name}
              />
            )
          })}

          <Button
            type='button'
            variant='outline'
            onClick={() => {
              appendVariable({
                key: '',
                value: '',
              })
            }}>
            <Plus /> New Variable
          </Button>
        </div>

        <div className='flex w-full justify-end gap-3'>
          <Button
            type='submit'
            variant='outline'
            disabled={savingEnvironmentVariables}
            onClick={() => (restartRef.current = false)}>
            Save
          </Button>

          <Button
            type='submit'
            variant='secondary'
            disabled={savingEnvironmentVariables}
            onClick={() => (restartRef.current = true)}>
            Save & Restart
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default VariablesForm
