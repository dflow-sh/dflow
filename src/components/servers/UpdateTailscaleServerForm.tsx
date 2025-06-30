'use client'

import SidebarToggleButton from '../SidebarToggleButton'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle, RefreshCw, XCircle } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  checkServerConnection,
  updateTailscaleServerAction,
} from '@/actions/server'
import { updateTailscaleServerSchema } from '@/actions/server/validator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Server } from '@/payload-types'
import { ServerType } from '@/payload-types-overrides'

type ConnectionStatus = {
  isConnected: boolean
  portIsOpen: boolean
  sshConnected: boolean
  serverInfo?: any
  error?: string
} | null

const UpdateTailscaleServerForm = ({
  formType = 'update',
  server,
  onSuccess,
  onError,
}: {
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
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>(null)
  const [hasTestedConnection, setHasTestedConnection] = useState(false)

  const form = useForm<z.infer<typeof updateTailscaleServerSchema>>({
    resolver: zodResolver(updateTailscaleServerSchema),
    defaultValues: server
      ? {
          name: server.name,
          description: server.description ?? '',
          hostname: server.hostname ?? '',
          username: server.username,
          id: server.id,
        }
      : {
          name: '',
          description: '',
          hostname: '',
          username: '',
          id: '',
        },
  })

  const handleFieldChange = (field: string) => {
    // Reset connection status when critical fields change
    if (['hostname', 'username'].includes(field) && hasTestedConnection) {
      setConnectionStatus(null)
      setHasTestedConnection(false)
    }
  }

  const { execute: updateServer, isPending: isUpdatingServer } = useAction(
    updateTailscaleServerAction,
    {
      onSuccess: ({ data, input }) => {
        if (data?.success) {
          toast.success(`Successfully updated ${input.name} server`)
          form.reset()
          setConnectionStatus(null)
          setHasTestedConnection(false)
        }

        onSuccess?.(data)
      },
      onError: ({ error }) => {
        toast.error(`Failed to update server: ${error.serverError}`)

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
    const { hostname, username } = form.getValues()

    // Validate required fields
    const errors: string[] = []
    if (!hostname?.trim()) errors.push('Hostname')
    if (!username?.trim()) errors.push('Username')

    if (errors.length > 0) {
      toast.error(`Please fill in required fields: ${errors.join(', ')}`)
      return
    }

    setConnectionStatus(null)
    setHasTestedConnection(false)

    testConnection({
      connectionType: 'tailscale',
      hostname,
      username,
    })
  }

  function onSubmit(values: z.infer<typeof updateTailscaleServerSchema>) {
    // If server prop exists, check if hostname or username changed
    const initialHostname = server?.hostname ?? ''
    const initialUsername = server?.username ?? ''
    const hostnameChanged = values.hostname !== initialHostname
    const usernameChanged = values.username !== initialUsername
    const criticalFieldsChanged = hostnameChanged || usernameChanged

    // Only require connection test if hostname or username changed
    if (criticalFieldsChanged) {
      if (!hasTestedConnection) {
        handleTestConnection()
        return
      }
      if (!connectionStatus?.isConnected) {
        toast.error('Please fix connection issues before saving')
        return
      }
    }

    updateServer(values)
  }

  // Allow save if either:
  // - critical fields changed and connection is tested and successful
  // - or only name/description changed (critical fields not changed)
  const initialHostname = server?.hostname ?? ''
  const initialUsername = server?.username ?? ''
  const currentValues = form.watch()
  const hostnameChanged = currentValues.hostname !== initialHostname
  const usernameChanged = currentValues.username !== initialUsername
  const criticalFieldsChanged = hostnameChanged || usernameChanged
  const canSave = criticalFieldsChanged
    ? hasTestedConnection && connectionStatus?.isConnected
    : true

  const showConnectionError =
    criticalFieldsChanged &&
    hasTestedConnection &&
    !connectionStatus?.isConnected

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-6'>
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
              </FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='hostname'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Hostname
                <SidebarToggleButton
                  directory='servers'
                  fileName='attach-server'
                  sectionId='#hostname'
                />
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={e => {
                    field.onChange(e)
                    handleFieldChange('hostname')
                  }}
                  disabled={formType === 'update'}
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
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={e => {
                    field.onChange(e)
                    handleFieldChange('username')
                  }}
                  disabled={formType === 'update'}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Connection Test Section */}
        <div className='space-y-4 rounded-lg border p-4'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex-1'>
              <p className='text-sm font-medium text-foreground'>
                Tailscale Connection Test
              </p>
              <p className='text-xs text-muted-foreground'>
                Verify Tailscale network connectivity before saving
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
                Testing Tailscale network connectivity and SSH authentication...
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
                    Tailscale connection successful
                  </p>
                  <div className='mt-1 space-y-1 text-xs text-emerald-400'>
                    <p>✓ Tailscale network accessible</p>
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
                  <p className='font-medium'>Tailscale connection failed</p>
                  <div className='space-y-1 text-xs'>
                    <p>
                      Network accessible:{' '}
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
                    Please verify your Tailscale configuration and try again
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className='flex w-full items-center justify-end'>
          <Button type='submit' disabled={isUpdatingServer || !canSave}>
            {isUpdatingServer ? (
              'Updating Server...'
            ) : criticalFieldsChanged && !hasTestedConnection ? (
              'Test Connection First'
            ) : canSave ? (
              <>
                <CheckCircle className='mr-2 h-4 w-4' />
                Update Server
              </>
            ) : (
              'Fix Connection Issues'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default UpdateTailscaleServerForm
