'use client'

import Loader from '../Loader'
import { MariaDB, MongoDB, MySQL, PostgreSQL, Redis } from '../icons'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'
import { Info, Link, Trash2 } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useParams } from 'next/navigation'
import {
  ChangeEvent,
  ClipboardEvent,
  Dispatch,
  JSX,
  SetStateAction,
  memo,
  useEffect,
  useState,
} from 'react'
import { toast } from 'sonner'

import { getProjectDatabasesAction } from '@/actions/project'
import {
  linkDatabaseAction,
  unlinkDatabaseAction,
  updateServiceAction,
} from '@/actions/service'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Service } from '@/payload-types'

// added mongodb extra to show the icon from the database-url
type StatusType =
  | NonNullable<NonNullable<Service['databaseDetails']>['type']>
  | 'mongodb'
const VALID_KEY_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/

// This is the type for the environment variable option
type EnvironmentVariableOptionType = {
  databaseList?: Service[]
  gettingDatabases: boolean
  service: Service
  variable: {
    key: string
    value: unknown
  }
  envVariables: {
    key: string
    value: unknown
  }[]
  setEnvVariables: Dispatch<
    SetStateAction<
      {
        key: string
        value: unknown
      }[]
    >
  >
  index: number
  savingEnvironmentVariables: boolean
}

const isKeyValid = (key: string) => {
  return key.trim() !== '' && VALID_KEY_REGEX.test(key)
}

const databaseIcons: {
  [key in StatusType]: JSX.Element
} = {
  postgres: <PostgreSQL className='size-6' />,
  mariadb: <MariaDB className='size-6' />,
  mongo: <MongoDB className='size-6' />,
  mysql: <MySQL className='size-6' />,
  redis: <Redis className='size-6' />,
  mongodb: <MongoDB className='size-6' />,
}

// This component is used to link a database for environment variable
const DatabaseLink = memo(
  ({
    databaseList,
    gettingDatabases,
    keyInfo: { value, valid },
    service,
    linkedDatabaseDetails,
  }: {
    databaseList?: Service[]
    gettingDatabases: boolean
    keyInfo: {
      value: string
      valid: boolean
    }
    service: Service
    linkedDatabaseDetails: unknown
  }) => {
    const list = databaseList ?? []
    const {
      execute: linkDatabase,
      isPending: linkingDatabase,
      hasSucceeded: addedToLinkQueue,
    } = useAction(linkDatabaseAction, {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.info('Added to queue', {
            description: 'Added database linking to queue',
          })
        }
      },
      onError: ({ error }) => {
        toast.error(`Failed to link database: ${error?.serverError}`)
      },
    })

    const databaseDetails = (
      linkedDatabaseDetails && typeof linkedDatabaseDetails === 'object'
        ? linkedDatabaseDetails
        : null
    ) as Record<string, string> | null

    console.log({ databaseDetails })

    return databaseDetails ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size={'icon'}>
            <Info size={16} className='text-primary' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className='pb-2' align='end'>
          <DropdownMenuLabel>Linked to Database</DropdownMenuLabel>

          <DropdownMenuItem disabled>
            {
              databaseIcons[
                databaseDetails?.value?.split(':')?.[0] as StatusType
              ]
            }
            {databaseDetails?.linkedService}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size={'icon'}
            disabled={linkingDatabase || addedToLinkQueue}>
            <Link size={16} className='text-primary' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className='pb-2' align='end'>
          <DropdownMenuLabel>Link Database</DropdownMenuLabel>

          {gettingDatabases && (
            <DropdownMenuItem disabled>
              <Loader className='h-min w-min' />
              Fetching databases...
            </DropdownMenuItem>
          )}

          {list.length && !gettingDatabases
            ? list.map(database => {
                return (
                  <DropdownMenuItem
                    key={database.id}
                    onSelect={() => {
                      if (valid) {
                        toast.info(`Linked ${database.name} to ${value}`)
                        linkDatabase({
                          databaseServiceId: database.id,
                          serviceId: service.id,
                          environmentVariableName: value,
                        })
                      } else {
                        toast.error('Enter a key to link database')
                      }
                    }}>
                    {database.databaseDetails?.type &&
                      databaseIcons[database.databaseDetails?.type]}

                    {database.name}
                  </DropdownMenuItem>
                )
              })
            : null}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
)

const EnvironmentVariableOption = memo(
  ({
    databaseList,
    gettingDatabases,
    service,
    envVariables,
    setEnvVariables,
    variable,
    index,
    savingEnvironmentVariables,
  }: EnvironmentVariableOptionType) => {
    const [open, setOpen] = useState(false)

    const {
      execute: unlinkDatabase,
      isPending: unlinkingDatabase,
      hasSucceeded: addedToUnlinkQueue,
    } = useAction(unlinkDatabaseAction, {
      onSuccess: ({ data }) => {
        if (data?.success) {
          setOpen(false)
          toast.info('Added to queue', {
            description: 'Added database unlinking to queue',
          })
        }
      },
      onError: ({ error }) => {
        toast.error(`Failed to unlink database: ${error?.serverError}`)
      },
    })

    const handleChange = (
      index: number,
      field: 'key' | 'value',
      newValue: string,
      isPasteEvent: boolean = false,
    ) => {
      const updatedEnv = [...envVariables]

      if (
        index === 0 &&
        field === 'key' &&
        isPasteEvent &&
        newValue.includes('\n')
      ) {
        const parsedEnv = parseEnvContent(newValue)
        setEnvVariables(
          parsedEnv.length > 0 ? parsedEnv : [{ key: '', value: '' }],
        )
        return
      }

      updatedEnv[index] = { ...updatedEnv[index], [field]: newValue }
      setEnvVariables(updatedEnv)
    }

    const handlePaste = (
      index: number,
      field: 'key' | 'value',
      event: ClipboardEvent<HTMLInputElement>,
    ) => {
      const pastedText = event.clipboardData.getData('text')
      if (pastedText.includes('\n')) {
        event.preventDefault()
        handleChange(index, field, pastedText, true)
      }
    }

    const parseEnvContent = (
      content: string,
    ): { key: string; value: string }[] => {
      const lines = content.split('\n').map(line => line.trim())
      const parsed: { key: string; value: string }[] = []

      for (const line of lines) {
        if (line && !line.startsWith('#')) {
          const [key, ...valueParts] = line.split('=')
          const value = valueParts.join('=').trim()
          if (key.trim()) {
            parsed.push({ key: key.trim(), value: value || '' })
          }
        }
      }
      return parsed
    }

    const handleDelete = (index: number) => {
      setEnvVariables(envVariables.filter((_, i) => i !== index))
    }

    const parsedEnvironmentVariable = (
      variable?.value && typeof variable?.value === 'object'
        ? variable?.value
        : null
    ) as Record<string, string> | null

    return (
      <>
        <tr>
          {/* key */}
          <td className='p-2'>
            <Input
              value={variable.key}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChange(index, 'key', e.target.value)
              }
              onPaste={(e: ClipboardEvent<HTMLInputElement>) =>
                handlePaste(index, 'key', e)
              }
              placeholder='e.g., API_KEY'
              className={`w-full ${!isKeyValid(variable.key) && variable.key !== '' ? 'border-destructive' : ''}`}
              disabled={savingEnvironmentVariables || addedToUnlinkQueue}
            />
          </td>

          {/* value */}
          <td className='p-2'>
            <Input
              value={parsedEnvironmentVariable?.value as string}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChange(index, 'value', e.target.value)
              }
              onPaste={(e: ClipboardEvent<HTMLInputElement>) =>
                handlePaste(index, 'value', e)
              }
              placeholder='e.g., abc123xyz'
              className='w-full'
              disabled={
                savingEnvironmentVariables ||
                typeof variable.value === 'object' ||
                addedToUnlinkQueue
              }
            />
          </td>

          {/* actions */}
          <td className='flex items-center gap-1 p-2'>
            <DatabaseLink
              databaseList={databaseList}
              gettingDatabases={gettingDatabases}
              keyInfo={{
                value: variable.key,
                valid: isKeyValid(variable.key),
              }}
              service={service}
              linkedDatabaseDetails={variable.value}
            />

            <Button
              variant='ghost'
              size={'icon'}
              onClick={() => {
                if (typeof variable.value === 'object') {
                  setOpen(true)
                } else {
                  handleDelete(index)
                }
              }}
              disabled={savingEnvironmentVariables}>
              <Trash2 className='h-4 w-4 text-destructive' />
            </Button>
          </td>
        </tr>

        <AlertDialog open={open}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Environment Variable</AlertDialogTitle>
              <AlertDialogDescription>
                This action will unlink the{' '}
                <strong className='text-foreground'>
                  {parsedEnvironmentVariable?.linkedService}
                </strong>{' '}
                database connection & delete {variable.key} environment variable
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={unlinkingDatabase}
                onClick={() => setOpen(false)}>
                Cancel
              </AlertDialogCancel>

              <AlertDialogAction
                variant='destructive'
                disabled={unlinkingDatabase}
                onClick={() => {
                  if (parsedEnvironmentVariable?.linkedService) {
                    unlinkDatabase({
                      serviceId: service.id,
                      environmentVariableName: variable.key,
                      databaseServiceName:
                        parsedEnvironmentVariable?.linkedService,
                    })
                  }
                }}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  },
)

const EnvironmentVariablesForm = ({ service }: { service: Service }) => {
  const [envVariables, setEnvVariables] = useState<
    { key: string; value: unknown }[]
  >([])

  const { serviceId } = useParams<{ id: string; serviceId: string }>()

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

  // Whenever the service changes, reset the environment variables
  useEffect(() => {
    const initialEnv =
      typeof service?.environmentVariables === 'object' &&
      service.environmentVariables
        ? Object.entries(service.environmentVariables).map(([key, value]) => ({
            key,
            value,
          }))
        : []

    setEnvVariables(initialEnv)
  }, [service])

  const areAllKeysValid = () => {
    const keys = envVariables.map(env => env.key.trim())
    const uniqueKeys = new Set(keys)

    return (
      keys.every(key => isKeyValid(key) || key === '') &&
      uniqueKeys.size === keys.length
    )
  }

  const isLastEntryValid = () => {
    if (envVariables.length === 0) return true
    const lastEntry = envVariables[envVariables.length - 1]
    return lastEntry.key.trim() === '' || isKeyValid(lastEntry.key)
  }

  const handleAddVariable = () => {
    setEnvVariables([...envVariables, { key: '', value: '' }])
  }

  const handleSubmit = (noRestart?: boolean) => {
    if (!areAllKeysValid()) {
      toast.error('Invalid Environment Variables', {
        description:
          'Ensure all keys are unique, non-empty, and contain valid characters (A-Z, 0-9, _)',
      })
      return
    }

    const envObject = envVariables.reduce(
      (acc, { key, value }) => {
        if (key.trim()) acc[key] = value
        return acc
      },
      {} as Record<string, unknown>,
    )

    saveEnvironmentVariables({
      environmentVariables: envObject,
      id: serviceId,
      noRestart,
    })
  }

  return (
    <div className='space-y-4'>
      <div className='overflow-x-auto'>
        <table className='w-full border-collapse'>
          <thead>
            <tr className='border-b'>
              <th className='p-2 text-left text-sm font-medium text-foreground'>
                Key
              </th>
              <th className='p-2 text-left text-sm font-medium text-foreground'>
                Value
              </th>
              <th className='p-2 text-left text-sm font-medium text-foreground'>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {envVariables.map((env, index) => {
              return (
                <EnvironmentVariableOption
                  key={index}
                  service={service}
                  variable={env}
                  databaseList={databaseList?.data}
                  envVariables={envVariables}
                  setEnvVariables={setEnvVariables}
                  index={index}
                  gettingDatabases={gettingDatabases}
                  savingEnvironmentVariables={savingEnvironmentVariables}
                />
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Environment variables actions */}
      <div className='flex justify-start'>
        <Button
          variant='outline'
          onClick={handleAddVariable}
          disabled={savingEnvironmentVariables || !isLastEntryValid()}>
          + Add Variable
        </Button>
      </div>

      <div className='flex w-full justify-end gap-4'>
        <Button
          disabled={savingEnvironmentVariables || !areAllKeysValid()}
          variant='outline'
          onClick={() => handleSubmit(true)}>
          Save
        </Button>

        <Button
          disabled={savingEnvironmentVariables || !areAllKeysValid()}
          variant='secondary'
          onClick={() => handleSubmit(false)}>
          Save & Restart
        </Button>
      </div>
    </div>
  )
}

export default EnvironmentVariablesForm
