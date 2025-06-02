'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle, RefreshCw, XCircle } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import React, { useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import {
  connectDockerRegistryAction,
  testDockerRegistryConnectionAction,
} from '@/actions/dockerRegistry'
import { connectDockerRegistrySchema } from '@/actions/dockerRegistry/validator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import SecretContent from '@/components/ui/blur-reveal'
import { Button } from '@/components/ui/button'
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DockerRegistry } from '@/payload-types'

const registriesList = [
  {
    label: 'Docker',
    value: 'docker',
  },
  {
    label: 'Github',
    value: 'github',
  },
  {
    label: 'Digitalocean',
    value: 'digitalocean',
  },
  {
    label: 'Quay',
    value: 'quay',
  },
]

type ConnectionStatus = {
  isConnected: boolean
  error?: string
  registryInfo?: any
} | null

const DockerRegistryForm = ({
  children,
  account,
  refetch,
}: {
  children: React.ReactNode
  account?: DockerRegistry
  refetch: () => void
}) => {
  const dialogFooterRef = useRef<HTMLButtonElement>(null)
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>(null)
  const [hasTestedConnection, setHasTestedConnection] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const { execute: connectAccount, isPending: connectingAccount } = useAction(
    connectDockerRegistryAction,
    {
      onSuccess: ({ data }) => {
        if (data?.id) {
          refetch()
          dialogFooterRef.current?.click()
        }
      },
      onError: ({ error }) => {
        if (error?.serverError) {
          setValidationError(error.serverError)
        }

        if (error?.validationErrors) {
          Object.entries(error.validationErrors).forEach(
            ([field, messages]) => {
              if (Array.isArray(messages) && messages.length > 0) {
                form.setError(
                  field as keyof z.infer<typeof connectDockerRegistrySchema>,
                  {
                    message: messages[0],
                  },
                )
              }
            },
          )
        }
      },
    },
  )

  const { execute: testConnection, isExecuting: isTestingConnection } =
    useAction(testDockerRegistryConnectionAction, {
      onSuccess: ({ data }) => {
        setConnectionStatus({
          isConnected: data?.isConnected || false,
          error: data?.error || '',
          registryInfo: data?.registryInfo,
        })
        setHasTestedConnection(true)
      },
      onError: ({ error }) => {
        setConnectionStatus({
          isConnected: false,
          error: error?.serverError || 'Failed to test registry connection',
        })
        setHasTestedConnection(true)
      },
    })

  const form = useForm<z.infer<typeof connectDockerRegistrySchema>>({
    resolver: zodResolver(connectDockerRegistrySchema),
    defaultValues: account
      ? account
      : {
          name: '',
          username: '',
          password: '',
          type: 'docker',
        },
  })

  const { type } = useWatch({ control: form.control })

  const handleTestConnection = () => {
    const username = form.getValues('username')
    const password = form.getValues('password')
    const registryType = form.getValues('type')
    const name = form.getValues('name')

    // Basic validation
    if (!name.trim()) {
      form.setError('name', {
        message: 'Registry name is required to test connection',
      })
      return
    }

    // For DigitalOcean, username is not required (it uses token as both username and password)
    if (registryType !== 'digitalocean' && !username.trim()) {
      form.setError('username', {
        message: 'Username is required to test connection',
      })
      return
    }

    if (!password.trim()) {
      form.setError('password', {
        message: 'Password/Token is required to test connection',
      })
      return
    }

    // Test connection with form values
    setConnectionStatus(null)
    setHasTestedConnection(false)
    testConnection({
      name,
      username,
      password,
      type: registryType,
    })
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      form.reset()
      setConnectionStatus(null)
      setHasTestedConnection(false)
      setValidationError(null)
    }
  }

  function onSubmit(values: z.infer<typeof connectDockerRegistrySchema>) {
    // Clear previous validation errors
    setValidationError(null)

    // Require connection test before saving
    if (!hasTestedConnection) {
      handleTestConnection()
      return
    }

    if (!connectionStatus?.isConnected) {
      return
    }

    connectAccount({ ...values, id: account?.id })
  }

  const canSave = hasTestedConnection && connectionStatus?.isConnected
  const showConnectionError =
    hasTestedConnection && !connectionStatus?.isConnected

  const resetConnectionStatus = () => {
    if (hasTestedConnection) {
      setConnectionStatus(null)
      setHasTestedConnection(false)
    }
    if (validationError) {
      setValidationError(null)
    }
  }

  return (
    <Dialog onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='space-y-3'>
          <DialogTitle className='text-xl'>
            {account ? 'Edit Registry Account' : 'Connect Registry Account'}
          </DialogTitle>
          <DialogDescription className='text-sm text-muted-foreground'>
            Connect your image registry to deploy private images and access
            container services.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Display validation errors from server */}
            {validationError && (
              <Alert variant='destructive'>
                <XCircle className='h-4 w-4' />
                <AlertDescription>
                  <div className='space-y-1'>
                    <p className='font-medium'>Validation Error</p>
                    <p className='text-sm opacity-90'>
                      {validationError.replace('Validation failed: ', '')}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium'>
                      Registry Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='My Docker Registry'
                        className='h-10'
                        onChange={e => {
                          field.onChange(e)
                          resetConnectionStatus()
                        }}
                      />
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
                    <FormLabel className='text-sm font-medium'>
                      Registry Type
                    </FormLabel>

                    <Select
                      onValueChange={value => {
                        field.onChange(value)
                        resetConnectionStatus()

                        if (account?.type === value) {
                          form.setValue('username', account?.username ?? '')
                          form.setValue('password', account?.password ?? '')
                        } else {
                          // on registry-type change resetting the form fields
                          form.setValue('username', '')
                          form.setValue('password', '')
                        }
                      }}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className='h-10'>
                          <SelectValue placeholder='Select registry type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent
                        onSelect={e => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}>
                        {registriesList.map(({ label, value }) => {
                          return (
                            <SelectItem key={value} value={value}>
                              <span className='flex items-center gap-1'>
                                {label}
                              </span>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hiding username for digital-ocean because for it we can use password and username as same */}
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem
                    className={type === 'digitalocean' ? 'hidden' : 'block'}>
                    <FormLabel className='text-sm font-medium'>
                      Username
                    </FormLabel>
                    <FormControl>
                      <SecretContent defaultHide={!!account}>
                        <Input
                          {...field}
                          placeholder='Enter your registry username'
                          className='h-10'
                          onChange={e => {
                            field.onChange(e)
                            resetConnectionStatus()
                          }}
                        />
                      </SecretContent>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium'>
                      Password
                    </FormLabel>
                    <FormControl>
                      <SecretContent defaultHide={!!account}>
                        <Input
                          {...field}
                          placeholder={
                            type === 'digitalocean'
                              ? 'Enter your API Token'
                              : 'Enter your password/token'
                          }
                          className='h-10'
                          onChange={e => {
                            // making username and password same for digitalocean registry
                            if (type === 'digitalocean') {
                              form.setValue('username', e.target.value)
                            }

                            field.onChange(e)
                            resetConnectionStatus()
                          }}
                        />
                      </SecretContent>
                    </FormControl>

                    {type === 'digitalocean' && (
                      <FormDescription>Add your API Token</FormDescription>
                    )}

                    {(type === 'github' || type === 'docker') && (
                      <FormDescription>
                        Add your Personal Access Token
                      </FormDescription>
                    )}

                    {type === 'quay' && (
                      <FormDescription>
                        Add your Quay.io access token
                      </FormDescription>
                    )}

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Connection Test Section - Show for both new and existing registries */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between gap-3'>
                <div className='flex-1'>
                  <p className='text-sm font-medium text-foreground'>
                    Connection Status
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Verify your registry credentials before saving
                  </p>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={handleTestConnection}
                  disabled={
                    isTestingConnection ||
                    !form.getValues('name')?.trim() ||
                    (type !== 'digitalocean' &&
                      !form.getValues('username')?.trim()) ||
                    !form.getValues('password')?.trim()
                  }
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
                    Verifying your{' '}
                    {registriesList.find(r => r.value === type)?.label} registry
                    connection...
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
                        Connection verified
                      </p>
                      <p className='text-xs text-emerald-400'>
                        Your {registriesList.find(r => r.value === type)?.label}{' '}
                        registry is ready to use
                      </p>
                      {connectionStatus.registryInfo?.githubUser && (
                        <p className='text-xs text-emerald-400'>
                          Connected as:{' '}
                          {connectionStatus.registryInfo.githubUser}
                        </p>
                      )}
                      {connectionStatus.registryInfo?.registryName && (
                        <p className='text-xs text-emerald-400'>
                          Registry: {connectionStatus.registryInfo.registryName}
                        </p>
                      )}
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
                      <p className='text-sm opacity-90'>
                        {connectionStatus?.error}
                      </p>
                      <p className='text-xs opacity-75'>
                        Please verify your registry credentials and try again
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter className='flex-col gap-4 sm:flex-row sm:justify-end'>
              <Button
                ref={dialogFooterRef}
                type='submit'
                disabled={connectingAccount || !canSave}>
                {connectingAccount ? (
                  'Saving...'
                ) : !hasTestedConnection ? (
                  'Test Connection First'
                ) : canSave ? (
                  <>
                    <CheckCircle className='mr-2 h-4 w-4' />
                    Save Registry
                  </>
                ) : (
                  'Fix Connection Issues'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default DockerRegistryForm
