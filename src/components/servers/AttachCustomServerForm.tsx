'use client'

import SidebarToggleButton from '../SidebarToggleButton'
import CreateSSHKey from '../security/CreateSSHKey'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle, Plus, RefreshCw, XCircle } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { parseAsString, useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  checkServerConnection,
  createServerAction,
  updateServerAction,
} from '@/actions/server'
// You'll need to import your server connection action
import { createServerSchema } from '@/actions/server/validator'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Server, SshKey } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

type ConnectionStatus = {
  isConnected: boolean
  portIsOpen: boolean
  sshConnected: boolean
  serverInfo?: any
  error?: string
} | null

const AttachCustomServerForm = ({
  sshKeys,
  formType = 'create',
  server,
  onSuccess,
  onError,
}: {
  sshKeys: SshKey[]
  formType?: 'create' | 'update'
  server?: ServerType
  onSuccess?: (
    data:
      | {
          success: boolean
          server: Server
        }
      | undefined,
  ) => void
  onError?: (error: any) => void
}) => {
  const [_type] = useQueryState('type', parseAsString.withDefault(''))
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>(null)
  const [hasTestedConnection, setHasTestedConnection] = useState(false)
  const [previousSshKeysLength, setPreviousSshKeysLength] = useState(
    sshKeys.length,
  )

  const form = useForm<z.infer<typeof createServerSchema>>({
    resolver: zodResolver(createServerSchema),
    defaultValues: server
      ? {
          name: server.name,
          description: server.description ?? '',
          ip: server.ip,
          port: server.port,
          sshKey:
            typeof server.sshKey === 'object'
              ? server.sshKey.id
              : server.sshKey,
          username: server.username,
        }
      : {
          name: '',
          description: '',
          ip: '',
          port: 22,
          sshKey: '',
          username: '',
        },
  })

  const handleFieldChange = (field: string) => {
    // Reset connection status when critical fields change
    if (
      ['ip', 'port', 'username', 'sshKey'].includes(field) &&
      hasTestedConnection
    ) {
      setConnectionStatus(null)
      setHasTestedConnection(false)
    }
  }

  // Auto-select newly created SSH key
  useEffect(() => {
    if (sshKeys.length > previousSshKeysLength) {
      // A new SSH key was added, select the most recent one
      const newestKey = sshKeys[0]
      if (newestKey) {
        form.setValue('sshKey', newestKey.id, { shouldValidate: true })
        handleFieldChange('sshKey')
      }
    }
    setPreviousSshKeysLength(sshKeys.length)
  }, [sshKeys, previousSshKeysLength, form])

  const { execute: createServer, isPending: isCreatingServer } = useAction(
    createServerAction,
    {
      onSuccess: ({ data, input }) => {
        if (data?.success) {
          toast.success(`Successfully created ${input.name} server`, {
            description: `Redirecting to server-details page`,
          })

          form.reset()
          setConnectionStatus(null)
          setHasTestedConnection(false)
        }

        onSuccess?.(data)
      },
      onError: ({ error }) => {
        toast.error(`Failed to create server: ${error.serverError}`)

        onError?.(error)
      },
    },
  )

  const { execute: updateServer, isPending: isUpdatingServer } = useAction(
    updateServerAction,
    {
      onSuccess: ({ data, input }) => {
        if (data?.success) {
          toast.success(`Successfully updated ${input.name} service`)
          form.reset()
          setConnectionStatus(null)
          setHasTestedConnection(false)
        }

        onSuccess?.(data)
      },
      onError: ({ error }) => {
        toast.error(`Failed to update service: ${error.serverError}`)

        onError?.(error)
      },
    },
  )

  const { execute: testConnection, isExecuting: isTestingConnection } =
    useAction(checkServerConnection, {
      onSuccess: ({ data }) => {
        setConnectionStatus({
          isConnected: data?.isConnected || false,
          portIsOpen: data?.portIsOpen || false,
          sshConnected: data?.sshConnected || false,
          serverInfo: data?.serverInfo,
          error: data?.error || '',
        })
        setHasTestedConnection(true)
      },
      onError: ({ error }) => {
        setConnectionStatus({
          isConnected: false,
          portIsOpen: false,
          sshConnected: false,
          error: error?.serverError || 'Failed to check server connection',
        })
        setHasTestedConnection(true)
      },
    })

  const handleTestConnection = () => {
    const { ip, port, username, sshKey } = form.getValues()

    // Validate required fields
    const errors: string[] = []
    if (!ip?.trim()) errors.push('IP Address')
    if (!port) errors.push('Port')
    if (!username?.trim()) errors.push('Username')
    if (!sshKey?.trim()) errors.push('SSH Key')

    if (errors.length > 0) {
      toast.error(`Please fill in required fields: ${errors.join(', ')}`)
      return
    }

    // Find the selected SSH key
    const selectedSshKey = sshKeys.find(key => key.id === sshKey)
    if (!selectedSshKey?.privateKey) {
      toast.error('Selected SSH key does not have a private key')
      return
    }

    setConnectionStatus(null)
    setHasTestedConnection(false)

    testConnection({
      ip,
      port,
      username,
      privateKey: selectedSshKey.privateKey,
    })
  }

  function onSubmit(values: z.infer<typeof createServerSchema>) {
    // If connection hasn't been tested, test it first
    if (!hasTestedConnection) {
      handleTestConnection()
      return
    }

    // If connection failed, don't proceed
    if (!connectionStatus?.isConnected) {
      toast.error('Please fix connection issues before saving')
      return
    }

    if (formType === 'create') {
      createServer(values)
    } else if (formType === 'update' && server) {
      // passing extra id-field during update operation
      updateServer({ ...values, id: server.id })
    }
  }

  const canSave = hasTestedConnection && connectionStatus?.isConnected
  const showConnectionError =
    hasTestedConnection && !connectionStatus?.isConnected

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full space-y-6'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name
                  <SidebarToggleButton
                    directory='servers'
                    fileName='attach-server'
                    sectionId='#name'
                  />
                </FormLabel>
                <FormControl>
                  <Input {...field} className='rounded-sm' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Description
                  <SidebarToggleButton
                    directory='servers'
                    fileName='attach-server'
                    sectionId='#description-optional'
                  />
                </FormLabel>{' '}
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='sshKey'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  SSH key
                  <SidebarToggleButton
                    directory='servers'
                    fileName='attach-server'
                    sectionId='#ssh-key'
                  />
                </FormLabel>
                <div className='flex items-center space-x-2'>
                  <div className='flex-1'>
                    <Select
                      onValueChange={value => {
                        field.onChange(value)
                        handleFieldChange('sshKey')
                      }}
                      value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a SSH key' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sshKeys.map(({ name, id }) => (
                          <SelectItem key={id} value={id}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <CreateSSHKey
                    trigger={
                      <Button
                        onClick={(e: any) => e.stopPropagation()}
                        size='sm'
                        variant='outline'
                        type='button'
                        className='m-0 h-fit shrink-0 p-2'>
                        <Plus className='h-4 w-4' />
                      </Button>
                    }
                  />
                </div>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='ip'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  IP Address
                  <SidebarToggleButton
                    directory='servers'
                    fileName='attach-server'
                    sectionId='#ip-address'
                  />
                </FormLabel>{' '}
                <FormControl>
                  <Input
                    {...field}
                    onChange={e => {
                      field.onChange(e)
                      handleFieldChange('ip')
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='port'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Port
                    <SidebarToggleButton
                      directory='servers'
                      fileName='attach-server'
                      sectionId='#port'
                    />
                  </FormLabel>{' '}
                  <FormControl>
                    <Input
                      type='number'
                      {...field}
                      onChange={e => {
                        form.setValue('port', +e.target.value, {
                          shouldValidate: true,
                        })
                        handleFieldChange('port')
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Username
                    <SidebarToggleButton
                      directory='servers'
                      fileName='attach-server'
                      sectionId='#username'
                    />
                  </FormLabel>{' '}
                  <FormControl>
                    <Input
                      {...field}
                      onChange={e => {
                        field.onChange(e)
                        handleFieldChange('username')
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Connection Test Section */}
          <div className='space-y-4 rounded-lg border p-4'>
            <div className='flex items-center justify-between gap-3'>
              <div className='flex-1'>
                <p className='text-sm font-medium text-foreground'>
                  Server Connection Test
                </p>
                <p className='text-xs text-muted-foreground'>
                  Verify server connectivity before saving
                </p>
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                className='shrink-0'>
                {isTestingConnection ? (
                  <>
                    <RefreshCw className='mr-2 h-3 w-3 animate-spin' />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>
            </div>

            {/* Connection Status Display */}
            {isTestingConnection && (
              <Alert>
                <RefreshCw className='h-4 w-4 animate-spin' />
                <AlertDescription>
                  Testing server connection (port accessibility and SSH
                  authentication)...
                </AlertDescription>
              </Alert>
            )}

            {connectionStatus?.isConnected && (
              <Alert className='border-emerald-800 bg-emerald-950'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-emerald-900'>
                    <CheckCircle className='h-4 w-4 text-emerald-400' />
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-emerald-300'>
                      Connection successful
                    </p>
                    <div className='mt-1 space-y-1 text-xs text-emerald-400'>
                      <p>✓ Port {form.getValues('port')} is accessible</p>
                      <p>✓ SSH authentication successful</p>
                      {connectionStatus.serverInfo?.dokku && (
                        <p>
                          ✓ Dokku {connectionStatus.serverInfo.dokku} detected
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Alert>
            )}

            {showConnectionError && (
              <Alert variant='destructive'>
                <XCircle className='h-4 w-4' />
                <AlertDescription>
                  <div className='space-y-2'>
                    <p className='font-medium'>Connection failed</p>
                    <div className='space-y-1 text-xs'>
                      <p>
                        Port accessible:{' '}
                        {connectionStatus?.portIsOpen ? '✓' : '✗'}
                      </p>
                      <p>
                        SSH connection:{' '}
                        {connectionStatus?.sshConnected ? '✓' : '✗'}
                      </p>
                    </div>
                    <p className='text-sm opacity-90'>
                      {connectionStatus?.error}
                    </p>
                    <p className='text-xs opacity-75'>
                      Please verify your server details and try again
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className='flex w-full items-center justify-end'>
            <Button
              type='submit'
              disabled={isCreatingServer || isUpdatingServer || !canSave}>
              {isCreatingServer || isUpdatingServer ? (
                formType === 'create' ? (
                  'Adding Server...'
                ) : (
                  'Updating Server...'
                )
              ) : !hasTestedConnection ? (
                'Test Connection First'
              ) : canSave ? (
                <>
                  <CheckCircle className='mr-2 h-4 w-4' />
                  {formType === 'create' ? 'Add Server' : 'Update Server'}
                </>
              ) : (
                'Fix Connection Issues'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}

export default AttachCustomServerForm
